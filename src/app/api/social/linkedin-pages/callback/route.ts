import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { encryptToken } from "@/lib/crypto";
import { getUser } from "@/lib/auth";

const BASE_URL = process.env.APP_BASE_URL!;

function errorRedirect(code = "connection_failed") {
  return NextResponse.redirect(`${BASE_URL}/oauth/done?error=${code}`);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("smm_linkedin_pages_state")?.value ?? null;
  const workspaceId = storedState ? storedState.split(":")[0] : null;

  if (oauthError) return errorRedirect("oauth_denied");
  if (!code || !state) return errorRedirect("oauth_invalid");
  if (!storedState || state !== storedState) return errorRedirect("state_mismatch");

  const wid = workspaceId!;
  cookieStore.set("smm_linkedin_pages_state", "", { maxAge: 0, path: "/" });

  try {
    let user: Awaited<ReturnType<typeof getUser>>
    try { user = await getUser() } catch { return errorRedirect("unauthenticated") }

    // Exchange code for token
    const tokenBody = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.LINKEDIN_PAGES_REDIRECT_URI!,
      client_id: process.env.LINKEDIN_PAGES_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_PAGES_CLIENT_SECRET!,
    });

    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenBody.toString(),
    });

    if (!tokenRes.ok) {
      console.error("LinkedIn Pages token exchange failed:", await tokenRes.text());
      return errorRedirect("connection_failed");
    }

    const tokenData = await tokenRes.json();
    const accessToken: string = tokenData.access_token;
    const expiresIn: number = tokenData.expires_in ?? 5184000;
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
    const refreshToken: string | undefined = tokenData.refresh_token;

    const encryptedAccessToken = encryptToken(accessToken);
    const encryptedRefreshToken = refreshToken ? encryptToken(refreshToken) : null;

    const admin = createAdminClient();

    // Get the user's own profile to use as authorized_by identifier
    let externalUserId = "pages_user";
    try {
      const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        externalUserId = profileData.sub ?? externalUserId;
      }
    } catch { /* ignore */ }

    // Upsert OAuth connection for pages
    const { data: connection, error: connErr } = await admin
      .from("smm_oauth_connections")
      .upsert(
        {
          workspace_id: wid,
          platform: "linkedin-pages",
          authorized_by_user_id: user.id,
          external_user_id: externalUserId,
          encrypted_access_token: encryptedAccessToken,
          encrypted_refresh_token: encryptedRefreshToken,
          token_expires_at: tokenExpiresAt,
          granted_scopes: ["r_organization_social", "w_organization_social"],
          status: "active",
          last_verified_at: new Date().toISOString(),
        },
        { onConflict: "workspace_id,platform,external_user_id", ignoreDuplicates: false },
      )
      .select("id")
      .single();

    if (connErr || !connection) {
      console.error("Failed to upsert LinkedIn Pages oauth connection:", connErr);
      return errorRedirect("connection_failed");
    }

    // Fetch organization pages the user admins
    let orgCount = 0;
    try {
      const orgAclRes = await fetch(
        "https://api.linkedin.com/v2/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Restli-Protocol-Version": "2.0.0",
          },
        },
      );

      if (orgAclRes.ok) {
        const orgAclData = await orgAclRes.json();
        const orgUrns: string[] = (orgAclData.elements ?? []).map(
          (e: { organizationUrn: string }) => e.organizationUrn,
        );

        for (const orgUrn of orgUrns) {
          const orgId = orgUrn.split(":").pop()!;
          const orgRes = await fetch(
            `https://api.linkedin.com/v2/organizations/${orgId}?projection=(id,localizedName,vanityName)`,
            { headers: { Authorization: `Bearer ${accessToken}` } },
          );
          if (!orgRes.ok) continue;
          const orgData = await orgRes.json();

          await admin.from("smm_social_destinations").upsert(
            {
              workspace_id: wid,
              oauth_connection_id: connection.id,
              platform: "linkedin-pages",
              external_destination_id: `org:${orgId}`,
              destination_type: "company",
              display_name: orgData.localizedName ?? `LinkedIn Page ${orgId}`,
              username: orgData.vanityName ?? null,
              profile_image_url: null,
              status: "active",
            },
            { onConflict: "workspace_id,platform,external_destination_id", ignoreDuplicates: false },
          );
          orgCount++;
        }
      }
    } catch (orgErr) {
      console.error("LinkedIn Pages org fetch error:", orgErr);
    }

    // Audit log
    await admin.from("smm_audit_logs").insert({
      workspace_id: wid,
      actor_user_id: user.id,
      action: "connection:connected",
      entity_type: "oauth_connection",
      entity_id: connection.id,
      safe_metadata_json: {
        platform: "linkedin-pages",
        org_count: orgCount,
      },
    });

    return NextResponse.redirect(`${BASE_URL}/oauth/done?platform=linkedin-pages`);
  } catch (err) {
    console.error("LinkedIn Pages OAuth callback error:", err);
    return errorRedirect("connection_failed");
  }
}

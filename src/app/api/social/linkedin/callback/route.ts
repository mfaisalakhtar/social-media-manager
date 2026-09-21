import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { encryptToken } from "@/lib/crypto";
import { getUser } from "@/lib/auth";

const BASE_URL = process.env.APP_BASE_URL!;

function errorRedirect(_workspaceId: string | null, code = "connection_failed") {
  return NextResponse.redirect(`${BASE_URL}/oauth/done?error=${code}`);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("smm_linkedin_state")?.value ?? null;

  const workspaceId = storedState ? storedState.split(":")[0] : null;

  if (oauthError) {
    return errorRedirect(workspaceId, "oauth_denied");
  }

  if (!code || !state) {
    return errorRedirect(workspaceId, "oauth_invalid");
  }

  if (!storedState || state !== storedState) {
    return errorRedirect(workspaceId, "state_mismatch");
  }

  const wid = workspaceId!;

  // Clear CSRF cookie
  cookieStore.set("smm_linkedin_state", "", { maxAge: 0, path: "/" });

  try {
    // Get authenticated user from JWT cookie
    let user: Awaited<ReturnType<typeof getUser>>
    try { user = await getUser() } catch { return errorRedirect(wid, "unauthenticated") }

    // Exchange code for access token
    const tokenBody = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.LINKEDIN_REDIRECT_URI!,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    });

    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenBody.toString(),
    });

    if (!tokenRes.ok) {
      console.error("LinkedIn token exchange failed:", await tokenRes.text());
      return errorRedirect(wid, "connection_failed");
    }

    const tokenData = await tokenRes.json();
    const accessToken: string = tokenData.access_token;
    const expiresIn: number = tokenData.expires_in ?? 5184000; // ~60 days
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
    const refreshToken: string | undefined = tokenData.refresh_token;

    // Get LinkedIn profile via OpenID Connect userinfo endpoint
    const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileRes.ok) {
      console.error("LinkedIn userinfo failed:", await profileRes.text());
      return errorRedirect(wid, "connection_failed");
    }

    const profileData = await profileRes.json();
    const externalUserId: string = profileData.sub;
    const displayName = profileData.name ?? `${profileData.given_name ?? ""} ${profileData.family_name ?? ""}`.trim();
    const profileImageUrl: string | null = profileData.picture ?? null;

    const encryptedAccessToken = encryptToken(accessToken);
    const encryptedRefreshToken = refreshToken ? encryptToken(refreshToken) : null;

    const admin = createAdminClient();

    // Upsert OAuth connection
    const { data: connection, error: connErr } = await admin
      .from("smm_oauth_connections")
      .upsert(
        {
          workspace_id: wid,
          platform: "linkedin",
          authorized_by_user_id: user.id,
          external_user_id: externalUserId,
          encrypted_access_token: encryptedAccessToken,
          encrypted_refresh_token: encryptedRefreshToken,
          token_expires_at: tokenExpiresAt,
          granted_scopes: ["openid", "profile", "email", "w_member_social"],
          status: "active",
          last_verified_at: new Date().toISOString(),
        },
        {
          onConflict: "workspace_id,platform,external_user_id",
          ignoreDuplicates: false,
        },
      )
      .select("id")
      .single();

    if (connErr || !connection) {
      console.error("Failed to upsert LinkedIn oauth connection:", connErr);
      return errorRedirect(wid, "connection_failed");
    }

    // Upsert destination (LinkedIn personal profile)
    const { error: destErr } = await admin.from("smm_social_destinations").upsert(
      {
        workspace_id: wid,
        oauth_connection_id: connection.id,
        platform: "linkedin",
        external_destination_id: externalUserId,
        destination_type: "profile",
        display_name: displayName,
        username: null,
        profile_image_url: profileImageUrl,
        status: "active",
      },
      { onConflict: "workspace_id,platform,external_destination_id", ignoreDuplicates: false },
    );

    if (destErr) {
      console.error("Failed to upsert LinkedIn destination:", destErr);
    }

    // Try to fetch organization/company pages (requires r_organization_social scope)
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
              platform: "linkedin",
              external_destination_id: `org:${orgId}`,
              destination_type: "company",
              display_name: orgData.localizedName ?? `LinkedIn Page ${orgId}`,
              username: orgData.vanityName ?? null,
              profile_image_url: null,
              status: "active",
            },
            { onConflict: "workspace_id,platform,external_destination_id", ignoreDuplicates: false },
          );
        }
        console.log(`LinkedIn: fetched ${orgUrns.length} org page(s)`);
      }
    } catch (orgErr) {
      // Silently skip — org access requires Marketing Developer Platform approval
      console.log("LinkedIn org pages skipped:", orgErr);
    }

    // Audit log
    await admin.from("smm_audit_logs").insert({
      workspace_id: wid,
      actor_user_id: user.id,
      action: "connection:connected",
      entity_type: "oauth_connection",
      entity_id: connection.id,
      safe_metadata_json: {
        platform: "linkedin",
        display_name: displayName,
        external_user_id: externalUserId,
      },
    });

    return NextResponse.redirect(`${BASE_URL}/oauth/done?platform=linkedin`);
  } catch (err) {
    console.error("LinkedIn OAuth callback error:", err);
    return errorRedirect(workspaceId, "connection_failed");
  }
}

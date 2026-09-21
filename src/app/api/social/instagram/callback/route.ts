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
  const storedState = cookieStore.get("smm_ig_state")?.value ?? null;

  if (oauthError) return errorRedirect("oauth_denied");
  if (!code || !state) return errorRedirect("oauth_invalid");
  if (!storedState || state !== storedState) return errorRedirect("state_mismatch");

  const workspaceId = storedState.split(":")[0];
  cookieStore.set("smm_ig_state", "", { maxAge: 0, path: "/" });

  // Instagram uses the same Meta App — fall back to META creds if separate IG vars not set
  const appId = process.env.INSTAGRAM_APP_ID ?? process.env.META_APP_ID!;
  const appSecret = process.env.INSTAGRAM_APP_SECRET ?? process.env.META_APP_SECRET!;
  const redirectUri =
    process.env.INSTAGRAM_REDIRECT_URI ??
    `${BASE_URL}/api/social/instagram/callback`;

  try {
    let user: Awaited<ReturnType<typeof getUser>>
    try { user = await getUser() } catch { return errorRedirect("unauthenticated") }

    // Exchange code for short-lived token
    const tokenParams = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code,
    });

    const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenParams.toString(),
    });

    if (!tokenRes.ok) {
      console.error("Instagram token exchange failed:", await tokenRes.text());
      return errorRedirect("connection_failed");
    }

    const tokenData = await tokenRes.json();
    const shortLivedToken: string = tokenData.access_token;
    const externalUserId: string = String(tokenData.user_id);

    // Exchange for long-lived token (60 days)
    const longTokenParams = new URLSearchParams({
      grant_type: "ig_exchange_token",
      client_secret: appSecret,
      access_token: shortLivedToken,
    });

    const longTokenRes = await fetch(
      `https://graph.instagram.com/access_token?${longTokenParams.toString()}`,
    );

    if (!longTokenRes.ok) {
      console.error("Instagram long-lived token exchange failed:", await longTokenRes.text());
      return errorRedirect("connection_failed");
    }

    const longTokenData = await longTokenRes.json();
    const accessToken: string = longTokenData.access_token;
    const expiresIn: number = longTokenData.expires_in ?? 5183944;
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    // Fetch profile info
    const meRes = await fetch(
      `https://graph.instagram.com/me?fields=id,name,username,profile_picture_url&access_token=${accessToken}`,
    );

    if (!meRes.ok) {
      console.error("Instagram /me failed:", await meRes.text());
      return errorRedirect("connection_failed");
    }

    const meData = await meRes.json();
    const admin = createAdminClient();
    const encryptedToken = encryptToken(accessToken);

    // Upsert OAuth connection
    const { data: connection, error: connErr } = await admin
      .from("smm_oauth_connections")
      .upsert(
        {
          workspace_id: workspaceId,
          platform: "instagram",
          authorized_by_user_id: user.id,
          external_user_id: externalUserId,
          encrypted_access_token: encryptedToken,
          encrypted_refresh_token: null,
          token_expires_at: tokenExpiresAt,
          granted_scopes: [
            "instagram_business_basic",
            "instagram_business_content_publish",
            "instagram_business_manage_messages",
            "instagram_business_manage_comments",
          ],
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
      console.error("Failed to upsert Instagram oauth connection:", connErr);
      return errorRedirect("connection_failed");
    }

    // Upsert destination
    const { error: destErr } = await admin.from("smm_social_destinations").upsert(
      {
        workspace_id: workspaceId,
        oauth_connection_id: connection.id,
        platform: "instagram",
        external_destination_id: externalUserId,
        destination_type: "profile",
        display_name: meData.name ?? meData.username ?? "Instagram Profile",
        username: meData.username ?? null,
        profile_image_url: meData.profile_picture_url ?? null,
        status: "active",
      },
      {
        onConflict: "workspace_id,platform,external_destination_id",
        ignoreDuplicates: false,
      },
    );

    if (destErr) {
      console.error("Failed to upsert Instagram destination:", destErr);
    }

    // Audit log
    await admin.from("smm_audit_logs").insert({
      workspace_id: workspaceId,
      actor_user_id: user.id,
      action: "connection:connected",
      entity_type: "oauth_connection",
      entity_id: connection.id,
      safe_metadata_json: {
        platform: "instagram",
        username: meData.username,
        external_user_id: externalUserId,
      },
    });

    return NextResponse.redirect(`${BASE_URL}/oauth/done?platform=instagram`);
  } catch (err) {
    console.error("Instagram OAuth callback error:", err);
    return errorRedirect("connection_failed");
  }
}

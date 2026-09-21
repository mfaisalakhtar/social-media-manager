import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  }

  // Instagram uses the same Meta App as Facebook — fall back to META_APP_ID if
  // a separate INSTAGRAM_APP_ID is not configured.
  const appId = process.env.INSTAGRAM_APP_ID ?? process.env.META_APP_ID;
  const redirectUri =
    process.env.INSTAGRAM_REDIRECT_URI ??
    `${process.env.APP_BASE_URL}/api/social/instagram/callback`;

  if (!appId || !redirectUri) {
    return NextResponse.json({ error: "Instagram is not configured" }, { status: 503 });
  }

  const randomHex = randomBytes(16).toString("hex");
  const state = `${workspaceId}:${randomHex}`;

  const cookieStore = await cookies();
  cookieStore.set("smm_ig_state", state, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: [
      "instagram_business_basic",
      "instagram_business_content_publish",
      "instagram_business_manage_messages",
      "instagram_business_manage_comments",
    ].join(","),
    response_type: "code",
    state,
    // Force Instagram to always show the login screen so the user can
    // switch to a different account (erppakistan, codeinkstudio, etc.)
    force_authentication: "true",
  });

  const authUrl = `https://www.instagram.com/oauth/authorize?${params.toString()}`;
  return NextResponse.redirect(authUrl);
}

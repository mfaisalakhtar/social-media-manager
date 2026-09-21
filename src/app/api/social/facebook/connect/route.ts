import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  }

  const randomHex = randomBytes(16).toString("hex");
  const state = `${workspaceId}:${randomHex}`;

  const cookieStore = await cookies();
  cookieStore.set("smm_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: process.env.META_REDIRECT_URI!,
    state,
    scope: "public_profile,pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,business_management",
    response_type: "code",
  });

  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
  return NextResponse.redirect(authUrl);
}

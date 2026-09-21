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
  cookieStore.set("smm_linkedin_pages_state", state, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.LINKEDIN_PAGES_CLIENT_ID!,
    redirect_uri: process.env.LINKEDIN_PAGES_REDIRECT_URI!,
    state,
    scope: "r_organization_social w_organization_social",
  });

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  return NextResponse.redirect(authUrl);
}

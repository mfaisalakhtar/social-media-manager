import { NextRequest, NextResponse } from "next/server";
import { toApiError } from "@/lib/errors";
import { getAdapter } from "@/lib/adapters/registry";
import { encryptToken } from "@/lib/crypto";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> },
) {
  try {
    const { platform } = await params;
    const { searchParams } = request.nextUrl;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      // User denied the OAuth prompt
      return NextResponse.redirect(`${process.env.APP_BASE_URL}/dashboard?error=oauth_denied`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`${process.env.APP_BASE_URL}/dashboard?error=oauth_invalid`);
    }

    // TODO: Validate state against stored session value (CSRF check)
    // TODO: Retrieve workspaceId from session

    const redirectUri = `${process.env.APP_BASE_URL}/api/social/${platform}/callback`;
    const adapter = getAdapter(platform);

    const tokenResult = await adapter.exchangeAuthorizationCode({ code, state, redirectUri });

    // Encrypt tokens before storing — NEVER store plaintext
    const encryptedAccess = encryptToken(tokenResult.accessToken);
    const encryptedRefresh = tokenResult.refreshToken ? encryptToken(tokenResult.refreshToken) : null;

    // TODO:
    // 1. INSERT into smm_oauth_connections with encrypted tokens
    // 2. Call adapter.listDestinations() to discover pages/accounts
    // 3. INSERT into smm_social_destinations for each destination
    // 4. Write audit log (connection:connected)
    // 5. Redirect to connections page

    console.log("OAuth callback — encrypted tokens ready, destinations to discover");
    console.log({ encryptedAccess: encryptedAccess.slice(0, 12) + "…", encryptedRefresh: encryptedRefresh?.slice(0, 12) + "…" });

    return NextResponse.redirect(`${process.env.APP_BASE_URL}/dashboard?connected=${platform}`);
  } catch (err) {
    const e = toApiError(err);
    console.error("OAuth callback error:", e);
    return NextResponse.redirect(`${process.env.APP_BASE_URL}/dashboard?error=oauth_failed`);
  }
}

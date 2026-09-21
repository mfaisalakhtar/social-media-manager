import { NextResponse } from "next/server";
import { toApiError } from "@/lib/errors";
import { getAdapter } from "@/lib/adapters/registry";
import { v4 as uuidv4 } from "uuid";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ platform: string }> },
) {
  try {
    const { platform } = await params;
    const { workspaceId } = await request.json();

    // TODO: Validate session, assertCan(role, "connection:connect")

    const state = uuidv4(); // CSRF token — store in session/cookie before redirecting
    const redirectUri = `${process.env.APP_BASE_URL}/api/social/${platform}/callback`;

    const adapter = getAdapter(platform);
    const authUrl = await adapter.getAuthorizationUrl({
      workspaceId,
      redirectUri,
      state,
    });

    // TODO: Store state + workspaceId in a short-lived session cookie

    return NextResponse.json({ data: { authUrl, state }, error: null });
  } catch (err) {
    const e = toApiError(err);
    return NextResponse.json({ data: null, error: e }, { status: e.status });
  }
}

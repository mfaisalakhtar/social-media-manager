import { NextResponse } from "next/server";
import { toApiError } from "@/lib/errors";

// POST /api/posts/:postId/submit — move draft → pending_approval
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const { postId } = await params;

    // TODO:
    // 1. Validate session + assertCan(role, "post:submit")
    // 2. Fetch post, assert status is "draft" or "changes_requested"
    // 3. UPDATE smm_posts SET status = "pending_approval", submitted_at = NOW()
    // 4. Notify all workspace approvers (in-app notification)
    // 5. Write audit log

    return NextResponse.json({ data: { postId, status: "pending_approval" }, error: null });
  } catch (err) {
    const e = toApiError(err);
    return NextResponse.json({ data: null, error: e }, { status: e.status });
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { toApiError } from "@/lib/errors";

const ScheduleSchema = z.object({
  scheduled_at_utc: z.string().datetime(),
  timezone: z.string().default("Asia/Karachi"),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const { postId } = await params;
    const body = await request.json();
    const { scheduled_at_utc, timezone } = ScheduleSchema.parse(body);

    // Guard: cannot schedule in the past
    if (new Date(scheduled_at_utc) <= new Date()) {
      return NextResponse.json(
        { data: null, error: { code: "INVALID_TIME", message: "Scheduled time must be in the future.", status: 422 } },
        { status: 422 },
      );
    }

    // TODO:
    // 1. Validate session + assertCan(role, "post:schedule")
    // 2. Fetch post, assert status is "approved" (or "draft" if no approval required)
    // 3. UPDATE smm_posts SET status = "scheduled", scheduled_at_utc, timezone_at_scheduling
    // 4. UPDATE smm_publications SET status = "queued", scheduled_at_utc for all linked publications
    // 5. Write audit log

    return NextResponse.json({
      data: { postId, status: "scheduled", scheduled_at_utc, timezone },
      error: null,
    });
  } catch (err) {
    const e = toApiError(err);
    return NextResponse.json({ data: null, error: e }, { status: e.status });
  }
}

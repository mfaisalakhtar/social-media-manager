import { NextResponse } from "next/server";
import { z } from "zod";
import { toApiError } from "@/lib/errors";

const CreateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
  website_url: z.string().url().optional(),
  timezone: z.string().default("Asia/Karachi"),
  approval_required: z.boolean().default(true),
});

export async function GET() {
  try {
    // TODO: Get session user, query smm_workspaces + smm_workspace_members for their workspaces
    return NextResponse.json({ data: [], error: null });
  } catch (err) {
    const e = toApiError(err);
    return NextResponse.json({ data: null, error: e }, { status: e.status });
  }
}

export async function POST(request: Request) {
  try {
    // TODO: Validate session
    const body = await request.json();
    const input = CreateWorkspaceSchema.parse(body);

    // TODO:
    // 1. Create smm_organizations record if first workspace
    // 2. Create smm_workspaces record with slug = slugify(input.name)
    // 3. Create smm_workspace_members record with role = "owner"
    // 4. Write audit log
    console.log("Create workspace:", input);

    return NextResponse.json({ data: { id: "ws_new", ...input }, error: null }, { status: 201 });
  } catch (err) {
    const e = toApiError(err);
    return NextResponse.json({ data: null, error: e }, { status: e.status });
  }
}

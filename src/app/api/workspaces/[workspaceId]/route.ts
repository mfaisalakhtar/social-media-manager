import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { toApiError } from '@/lib/errors'
import { getUser } from '@/lib/auth'

const PatchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  website_url: z.string().url().nullable().optional(),
  timezone: z.string().optional(),
  approval_required: z.boolean().optional(),
})

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params
    let user: Awaited<ReturnType<typeof getUser>>
    try { user = await getUser() } catch { return NextResponse.json({ data: null, error: { message: 'Unauthorized' } }, { status: 401 }) }

    const db = createAdminClient()
    const { data, error } = await db
      .from('smm_workspaces')
      .select('id, name, slug, website_url, timezone, approval_required, status, created_at')
      .eq('id', workspaceId)
      .single()

    if (error || !data) return NextResponse.json({ data: null, error: { message: 'Workspace not found' } }, { status: 404 })

    return NextResponse.json({ data, error: null })
  } catch (err) {
    const e = toApiError(err)
    return NextResponse.json({ data: null, error: e }, { status: e.status })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params
    let user: Awaited<ReturnType<typeof getUser>>
    try { user = await getUser() } catch { return NextResponse.json({ data: null, error: { message: 'Unauthorized' } }, { status: 401 }) }

    const body = await request.json()
    const input = PatchSchema.parse(body)

    const db = createAdminClient()

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.name !== undefined) updates.name = input.name
    if (input.website_url !== undefined) updates.website_url = input.website_url
    if (input.timezone !== undefined) updates.timezone = input.timezone
    if (input.approval_required !== undefined) updates.approval_required = input.approval_required

    const { data, error } = await db
      .from('smm_workspaces')
      .update(updates)
      .eq('id', workspaceId)
      .select()
      .single()

    if (error) throw new Error(error.message)

    await db.from('smm_audit_logs').insert({
      workspace_id: workspaceId,
      actor_user_id: user.id,
      action: 'workspace:updated',
      entity_type: 'workspace',
      entity_id: workspaceId,
      safe_metadata_json: { description: 'Updated workspace settings', fields: Object.keys(input) },
    })

    return NextResponse.json({ data, error: null })
  } catch (err) {
    const e = toApiError(err)
    return NextResponse.json({ data: null, error: e }, { status: e.status })
  }
}

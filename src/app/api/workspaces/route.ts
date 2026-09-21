import { NextResponse } from 'next/server'
import { z } from 'zod'
import { toApiError } from '@/lib/errors'
import { getUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'

const CreateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
  timezone: z.string().default('Asia/Karachi'),
  approval_required: z.boolean().default(false),
})

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export async function POST(request: Request) {
  try {
    let user: Awaited<ReturnType<typeof getUser>>
    try { user = await getUser() } catch {
      return NextResponse.json({ data: null, error: { message: 'Unauthorized' } }, { status: 401 })
    }

    const body = await request.json()
    const input = CreateWorkspaceSchema.parse(body)

    const db = createAdminClient()

    // Find the user's organization (created at signup)
    const { data: orgMember } = await db
      .from('smm_organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    if (!orgMember) {
      return NextResponse.json({ data: null, error: { message: 'No organization found for user' } }, { status: 404 })
    }

    const orgId = orgMember.organization_id

    // Generate a unique slug — append a short random suffix if the base slug is taken
    const baseSlug = slugify(input.name) || 'workspace'
    const suffix = Math.random().toString(36).slice(2, 7)
    const slug = `${baseSlug}-${suffix}`

    // Create the workspace
    const { data: ws, error: wsErr } = await db
      .from('smm_workspaces')
      .insert({
        organization_id: orgId,
        name: input.name.trim(),
        slug,
        timezone: input.timezone,
        approval_required: input.approval_required,
      })
      .select('id, name, slug, timezone, approval_required')
      .single()

    if (wsErr || !ws) {
      console.error('[workspaces POST] insert error:', wsErr)
      return NextResponse.json({ data: null, error: { message: 'Failed to create workspace' } }, { status: 500 })
    }

    // Add creator as owner
    await db.from('smm_workspace_members').insert({
      workspace_id: ws.id,
      user_id: user.id,
      role: 'owner',
    })

    // Audit log
    await db.from('smm_audit_logs').insert({
      workspace_id: ws.id,
      actor_user_id: user.id,
      action: 'workspace:created',
      entity_type: 'workspace',
      entity_id: ws.id,
      safe_metadata_json: { name: ws.name },
    })

    return NextResponse.json({ data: ws, error: null }, { status: 201 })
  } catch (err) {
    const e = toApiError(err)
    return NextResponse.json({ data: null, error: e }, { status: e.status })
  }
}

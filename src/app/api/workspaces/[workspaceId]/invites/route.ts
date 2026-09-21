import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { toApiError } from '@/lib/errors'
import { getUser } from '@/lib/auth'

const InviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'editor', 'approver', 'viewer']),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params
    let user: Awaited<ReturnType<typeof getUser>>
    try { user = await getUser() } catch { return NextResponse.json({ data: null, error: { message: 'Unauthorized' } }, { status: 401 }) }

    const body = await request.json()
    const input = InviteSchema.parse(body)

    const db = createAdminClient()

    // Look up user by email in smm_users (SMM-specific registry)
    const { data: invitedUser } = await db
      .from('smm_users')
      .select('id, email, name')
      .eq('email', input.email.toLowerCase().trim())
      .maybeSingle()

    if (!invitedUser) {
      return NextResponse.json(
        { data: null, error: { message: 'No Social Manager account found for that email. The user must sign up first.' } },
        { status: 404 }
      )
    }

    // Check if already a member
    const { data: existing } = await db
      .from('smm_workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', invitedUser.id)
      .single()

    if (existing) {
      return NextResponse.json(
        { data: null, error: { message: 'User is already a member of this workspace.' } },
        { status: 409 }
      )
    }

    // Add to workspace
    const { data: member, error: memberErr } = await db
      .from('smm_workspace_members')
      .insert({
        workspace_id: workspaceId,
        user_id: invitedUser.id,
        role: input.role,
      })
      .select()
      .single()

    if (memberErr) throw new Error(memberErr.message)

    await db.from('smm_audit_logs').insert({
      workspace_id: workspaceId,
      actor_user_id: user.id,
      action: 'member:invited',
      entity_type: 'workspace_member',
      entity_id: invitedUser.id,
      safe_metadata_json: { description: `Invited ${input.email} as ${input.role}` },
    })

    return NextResponse.json({ data: member, error: null }, { status: 201 })
  } catch (err) {
    const e = toApiError(err)
    return NextResponse.json({ data: null, error: e }, { status: e.status })
  }
}

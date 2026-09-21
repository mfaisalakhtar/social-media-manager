import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { toApiError } from '@/lib/errors'
import { getUser } from '@/lib/auth'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ workspaceId: string; userId: string }> }
) {
  try {
    const { workspaceId, userId } = await params
    let user: Awaited<ReturnType<typeof getUser>>
    try { user = await getUser() } catch { return NextResponse.json({ data: null, error: { message: 'Unauthorized' } }, { status: 401 }) }

    const db = createAdminClient()

    // Prevent removing the owner
    const { data: target } = await db
      .from('smm_workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .single()

    if (!target) return NextResponse.json({ data: null, error: { message: 'Member not found' } }, { status: 404 })
    if (target.role === 'owner') return NextResponse.json({ data: null, error: { message: 'Cannot remove the workspace owner' } }, { status: 400 })

    const { error } = await db
      .from('smm_workspace_members')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)

    if (error) throw new Error(error.message)

    await db.from('smm_audit_logs').insert({
      workspace_id: workspaceId,
      actor_user_id: user.id,
      action: 'member:removed',
      entity_type: 'workspace_member',
      entity_id: userId,
      safe_metadata_json: { description: `Removed member ${userId} from workspace` },
    })

    return NextResponse.json({ data: { removed: true }, error: null })
  } catch (err) {
    const e = toApiError(err)
    return NextResponse.json({ data: null, error: e }, { status: e.status })
  }
}

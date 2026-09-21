import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { toApiError } from '@/lib/errors'
import { getUser } from '@/lib/auth'

/** PATCH — update a destination's status (activate pending, etc.) */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string; destinationId: string }> }
) {
  try {
    const { workspaceId, destinationId } = await params
    let user: Awaited<ReturnType<typeof getUser>>
    try { user = await getUser() } catch { return NextResponse.json({ data: null, error: { message: 'Unauthorized' } }, { status: 401 }) }

    const { status } = await request.json()
    if (!status) return NextResponse.json({ data: null, error: { message: 'status required' } }, { status: 422 })

    const db = createAdminClient()
    await db.from('smm_social_destinations')
      .update({ status })
      .eq('id', destinationId)
      .eq('workspace_id', workspaceId)

    return NextResponse.json({ data: { ok: true }, error: null })
  } catch (err) {
    const e = toApiError(err)
    return NextResponse.json({ data: null, error: e }, { status: e.status })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ workspaceId: string; destinationId: string }> }
) {
  try {
    const { workspaceId, destinationId } = await params
    let user: Awaited<ReturnType<typeof getUser>>
    try { user = await getUser() } catch { return NextResponse.json({ data: null, error: { message: 'Unauthorized' } }, { status: 401 }) }

    const db = createAdminClient()
    await db.from('smm_social_destinations')
      .update({ status: 'disconnected' })
      .eq('id', destinationId)
      .eq('workspace_id', workspaceId)

    await db.from('smm_audit_logs').insert({
      workspace_id: workspaceId,
      actor_user_id: user.id,
      action: 'connection:disconnected',
      entity_type: 'social_destination',
      entity_id: destinationId,
      safe_metadata_json: { description: 'Account disconnected' }
    })

    return NextResponse.json({ data: { ok: true }, error: null })
  } catch (err) {
    const e = toApiError(err)
    return NextResponse.json({ data: null, error: e }, { status: e.status })
  }
}

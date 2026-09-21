import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { toApiError } from '@/lib/errors'
import { getUser } from '@/lib/auth'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    let user: Awaited<ReturnType<typeof getUser>>
    try { user = await getUser() } catch { return NextResponse.json({ data: null, error: { message: 'Unauthorized' } }, { status: 401 }) }

    const db = createAdminClient()
    await db.from('smm_posts').update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by_user_id: user.id
    }).eq('id', postId)

    const { data: post } = await db.from('smm_posts').select('workspace_id').eq('id', postId).single()
    await db.from('smm_audit_logs').insert({
      workspace_id: post?.workspace_id,
      actor_user_id: user.id,
      action: 'post:approved',
      entity_type: 'post',
      entity_id: postId,
      safe_metadata_json: { description: 'Post approved' }
    })

    return NextResponse.json({ data: { postId, status: 'approved' }, error: null })
  } catch (err) {
    const e = toApiError(err)
    return NextResponse.json({ data: null, error: e }, { status: e.status })
  }
}

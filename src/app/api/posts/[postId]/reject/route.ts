import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { toApiError } from '@/lib/errors'
import { getUser } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const { comment } = await request.json()
    if (!comment?.trim()) {
      return NextResponse.json({ data: null, error: { message: 'Comment required' } }, { status: 422 })
    }

    let user: Awaited<ReturnType<typeof getUser>>
    try { user = await getUser() } catch { return NextResponse.json({ data: null, error: { message: 'Unauthorized' } }, { status: 401 }) }

    const db = createAdminClient()
    await db.from('smm_posts').update({ status: 'changes_requested' }).eq('id', postId)
    await db.from('smm_approval_comments').insert({
      post_id: postId,
      user_id: user.id,
      comment
    })

    const { data: post } = await db.from('smm_posts').select('workspace_id').eq('id', postId).single()
    await db.from('smm_audit_logs').insert({
      workspace_id: post?.workspace_id,
      actor_user_id: user.id,
      action: 'post:rejected',
      entity_type: 'post',
      entity_id: postId,
      safe_metadata_json: { description: 'Post rejected with changes requested' }
    })

    return NextResponse.json({ data: { postId, status: 'changes_requested' }, error: null })
  } catch (err) {
    const e = toApiError(err)
    return NextResponse.json({ data: null, error: e }, { status: e.status })
  }
}

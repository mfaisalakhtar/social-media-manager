import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { toApiError } from '@/lib/errors'
import { getUser } from '@/lib/auth'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ workspaceId: string; postId: string }> }
) {
  try {
    const { workspaceId, postId } = await params
    let user: Awaited<ReturnType<typeof getUser>>
    try { user = await getUser() } catch { return NextResponse.json({ data: null, error: { message: 'Unauthorized' } }, { status: 401 }) }

    const db = createAdminClient()

    const { data: post } = await db
      .from('smm_posts')
      .select(`
        id, common_caption, link_url, status, scheduled_at_utc, media_urls,
        smm_post_variations (
          id, social_destination_id, platform, caption
        )
      `)
      .eq('id', postId)
      .eq('workspace_id', workspaceId)
      .single()

    if (!post) return NextResponse.json({ data: null, error: 'Post not found' }, { status: 404 })

    return NextResponse.json({ data: post, error: null })
  } catch (err) {
    const e = toApiError(err)
    return NextResponse.json({ data: null, error: e }, { status: e.status })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ workspaceId: string; postId: string }> }
) {
  try {
    const { workspaceId, postId } = await params
    let user: Awaited<ReturnType<typeof getUser>>
    try { user = await getUser() } catch { return NextResponse.json({ data: null, error: { message: 'Unauthorized' } }, { status: 401 }) }

    const body = await req.json()
    const db = createAdminClient()

    const { data: post } = await db
      .from('smm_posts')
      .select('id')
      .eq('id', postId)
      .eq('workspace_id', workspaceId)
      .single()
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const updates: Record<string, unknown> = {}
    if (body.scheduled_at_utc !== undefined) updates.scheduled_at_utc = body.scheduled_at_utc

    const { data: updated } = await db
      .from('smm_posts')
      .update(updates)
      .eq('id', postId)
      .select()
      .single()

    return NextResponse.json({ data: updated, error: null })
  } catch (err) {
    const e = toApiError(err)
    return NextResponse.json({ error: e }, { status: e.status })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ workspaceId: string; postId: string }> }
) {
  try {
    const { workspaceId, postId } = await params
    let user: Awaited<ReturnType<typeof getUser>>
    try { user = await getUser() } catch { return NextResponse.json({ data: null, error: { message: 'Unauthorized' } }, { status: 401 }) }

    const db = createAdminClient()

    // Verify post belongs to this workspace
    const { data: post } = await db
      .from('smm_posts')
      .select('id, author_user_id')
      .eq('id', postId)
      .eq('workspace_id', workspaceId)
      .single()

    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

    // Delete post (cascade deletes variations + publications via FK)
    await db.from('smm_posts').delete().eq('id', postId)

    await db.from('smm_audit_logs').insert({
      workspace_id: workspaceId,
      actor_user_id: user.id,
      action: 'post:deleted',
      entity_type: 'post',
      entity_id: postId,
      safe_metadata_json: {},
    })

    return NextResponse.json({ data: { deleted: true }, error: null })
  } catch (err) {
    const e = toApiError(err)
    return NextResponse.json({ error: e }, { status: e.status })
  }
}

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { toApiError } from '@/lib/errors'
import { getUser } from '@/lib/auth'

const BUCKET = 'smm-media'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await params
    let user: Awaited<ReturnType<typeof getUser>>
    try { user = await getUser() } catch { return NextResponse.json({ data: null, error: { message: 'Unauthorized' } }, { status: 401 }) }

    const db = createAdminClient()

    // Verify ownership (user must be member of the workspace)
    const { data: asset } = await db
      .from('smm_media_assets')
      .select('id, workspace_id, storage_key')
      .eq('id', assetId)
      .single()

    if (!asset) return NextResponse.json({ data: null, error: { message: 'Not found' } }, { status: 404 })

    const { data: membership } = await db
      .from('smm_workspace_members')
      .select('id')
      .eq('workspace_id', asset.workspace_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!membership) return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })

    // Delete from storage
    await db.storage.from(BUCKET).remove([asset.storage_key])

    // Delete DB record
    await db.from('smm_media_assets').delete().eq('id', assetId)

    return NextResponse.json({ data: { ok: true }, error: null })
  } catch (err) {
    const e = toApiError(err)
    return NextResponse.json({ data: null, error: e }, { status: e.status })
  }
}

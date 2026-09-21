import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { toApiError } from '@/lib/errors'
import { getUser } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

const BUCKET = 'smm-media'
const MAX_SIZE = 50 * 1024 * 1024 // 50 MB
const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime']

export async function POST(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  try {
    const { workspaceId } = await params
    let user: Awaited<ReturnType<typeof getUser>>
    try { user = await getUser() } catch { return NextResponse.json({ data: null, error: { message: 'Unauthorized' } }, { status: 401 }) }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
    if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File too large (max 50 MB)' }, { status: 400 })

    const ext = file.name.split('.').pop() ?? 'bin'
    const storageKey = `${workspaceId}/${uuidv4()}.${ext}`

    const bytes = await file.arrayBuffer()
    const db = createAdminClient()

    const { error: uploadErr } = await db.storage
      .from(BUCKET)
      .upload(storageKey, bytes, { contentType: file.type, upsert: false })

    if (uploadErr) throw new Error(uploadErr.message)

    const { data: { publicUrl } } = db.storage.from(BUCKET).getPublicUrl(storageKey)

    // Record in smm_media_assets
    await db.from('smm_media_assets').insert({
      workspace_id: workspaceId,
      uploaded_by_user_id: user.id,
      storage_key: storageKey,
      original_filename: file.name,
      mime_type: file.type,
      size_bytes: file.size,
    })

    return NextResponse.json({ url: publicUrl, storageKey })
  } catch (err) {
    const e = toApiError(err)
    return NextResponse.json({ error: e.message }, { status: e.status })
  }
}

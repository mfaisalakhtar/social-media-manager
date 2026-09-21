import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { toApiError } from '@/lib/errors'
import { getUser } from '@/lib/auth'

const BUCKET = 'smm-media'

export async function GET() {
  try {
    let user: Awaited<ReturnType<typeof getUser>>
    try { user = await getUser() } catch { return NextResponse.json({ data: null, error: { message: 'Unauthorized' } }, { status: 401 }) }

    const db = createAdminClient()

    // Get all workspaces the user belongs to
    const { data: memberships } = await db
      .from('smm_workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)

    const workspaceIds = (memberships ?? []).map(m => m.workspace_id)
    if (!workspaceIds.length) return NextResponse.json({ data: [], error: null })

    // Get workspace names for tagging
    const { data: workspaces } = await db
      .from('smm_workspaces')
      .select('id, name')
      .in('id', workspaceIds)

    const wsMap: Record<string, string> = {}
    ;(workspaces ?? []).forEach(w => { wsMap[w.id] = w.name })

    // Get media assets across all workspaces
    const { data: assets } = await db
      .from('smm_media_assets')
      .select('id, workspace_id, original_filename, mime_type, size_bytes, storage_key, created_at')
      .in('workspace_id', workspaceIds)
      .order('created_at', { ascending: false })

    // Add public URL and workspace name
    const enriched = (assets ?? []).map(a => ({
      ...a,
      workspace_name: wsMap[a.workspace_id] ?? 'Unknown',
      public_url: db.storage.from(BUCKET).getPublicUrl(a.storage_key).data.publicUrl,
    }))

    return NextResponse.json({ data: enriched, error: null })
  } catch (err) {
    const e = toApiError(err)
    return NextResponse.json({ data: null, error: e }, { status: e.status })
  }
}

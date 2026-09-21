import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { toApiError } from '@/lib/errors'
import { getUser } from '@/lib/auth'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params
    let user: Awaited<ReturnType<typeof getUser>>
    try { user = await getUser() } catch { return NextResponse.json({ data: null, error: { message: 'Unauthorized' } }, { status: 401 }) }

    const db = createAdminClient()
    const { data, error } = await db
      .from('smm_workspace_members')
      .select('role, created_at, user:smm_users(id, name, email)')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: true })

    if (error) throw new Error(error.message)

    return NextResponse.json({ data, error: null })
  } catch (err) {
    const e = toApiError(err)
    return NextResponse.json({ data: null, error: e }, { status: e.status })
  }
}

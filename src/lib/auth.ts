import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'
import { verifySession, COOKIE_NAME } from '@/lib/session'
import { AuthError } from './errors'

export type SmmUser = {
  id: string
  email: string
  name: string
  avatar_url: string | null
}

/** Reads the smm_session JWT cookie and returns the authenticated SMM user.
 *  Throws AuthError if not authenticated. */
export async function getUser(): Promise<SmmUser> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) throw new AuthError()

  const session = await verifySession(token)
  if (!session) throw new AuthError()

  const db = createAdminClient()
  const { data: user } = await db
    .from('smm_users')
    .select('id, email, name, avatar_url')
    .eq('id', session.sub)
    .maybeSingle()

  if (!user) throw new AuthError()
  return user
}

export async function getUserWorkspaces(userId: string) {
  const db = createAdminClient()
  const { data } = await db
    .from('smm_workspace_members')
    .select('role, workspace:smm_workspaces(*)')
    .eq('user_id', userId)
  return data ?? []
}

export async function getWorkspaceMembership(userId: string, workspaceId: string) {
  const db = createAdminClient()
  const { data } = await db
    .from('smm_workspace_members')
    .select('role')
    .eq('user_id', userId)
    .eq('workspace_id', workspaceId)
    .single()
  return data
}

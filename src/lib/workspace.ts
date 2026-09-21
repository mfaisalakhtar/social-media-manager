import { cache } from 'react'
import { createAdminClient } from '@/lib/supabase/server'

type WorkspaceRow = { id: string; name: string; slug: string; organization_id: string }

/** Resolves a workspace slug OR UUID to the workspace row. Cached per request (React cache). */
export const getWorkspace = cache(async (slugOrId: string, userId: string): Promise<WorkspaceRow | null> => {
  const db = createAdminClient()

  // Get all workspace IDs this user is a member of
  const { data: memberships } = await db
    .from('smm_workspace_members')
    .select('workspace_id')
    .eq('user_id', userId)

  const workspaceIds = (memberships ?? []).map((m: any) => m.workspace_id)
  if (workspaceIds.length === 0) return null

  // Look up by slug scoped to user's memberships
  const { data: bySlug } = await db
    .from('smm_workspaces')
    .select('id, name, slug, organization_id')
    .eq('slug', slugOrId)
    .in('id', workspaceIds)
    .maybeSingle()

  if (bySlug) return bySlug

  // Fallback: look up by UUID (for old bookmarks / direct links)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(slugOrId)) return null

  const { data: byId } = await db
    .from('smm_workspaces')
    .select('id, name, slug, organization_id')
    .eq('id', slugOrId)
    .in('id', workspaceIds)
    .maybeSingle()

  return byId ?? null
})

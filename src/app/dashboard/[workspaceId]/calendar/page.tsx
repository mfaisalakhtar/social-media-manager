import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import CalendarClient from './CalendarClient'
import { getWorkspace } from '@/lib/workspace'

export default async function CalendarPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId: slugOrId } = await params
  let user: any
  try { user = await getUser() } catch { redirect('/sign-in') }

  const workspace = await getWorkspace(slugOrId, user.id)
  if (!workspace) redirect('/dashboard')

  return <CalendarClient workspaceId={workspace.id} />
}

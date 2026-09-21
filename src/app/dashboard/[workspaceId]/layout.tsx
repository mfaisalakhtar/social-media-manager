import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { ComposerModal } from '@/components/ComposerModal'
import { ComposerProvider } from '@/contexts/ComposerContext'
import { WorkspaceProvider } from '@/contexts/WorkspaceContext'
import { getUser } from '@/lib/auth'
import { getWorkspace } from '@/lib/workspace'

export default async function WorkspaceLayout({
  children, params
}: {
  children: React.ReactNode
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId: slugOrId } = await params

  let user: any
  try { user = await getUser() } catch { redirect('/dashboard') }

  const workspace = await getWorkspace(slugOrId, user.id)
  if (!workspace) redirect('/dashboard')

  // If UUID was used in URL, redirect to slug-based URL
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (uuidRegex.test(slugOrId) && workspace.slug) {
    const h = await headers()
    const fullPath = h.get('x-pathname') || h.get('x-invoke-path') || ''
    const restOfPath = fullPath.replace(`/dashboard/${slugOrId}`, '') || ''
    redirect(`/dashboard/${workspace.slug}${restOfPath}`)
  }

  return (
    <WorkspaceProvider workspaceId={workspace.id} workspaceSlug={workspace.slug}>
      <ComposerProvider>
        <div className="flex h-screen overflow-hidden bg-gray-50">
          <Sidebar workspaceSlug={workspace.slug} workspaceName={workspace.name} />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Header workspaceName={workspace.name} pageTitle="" />
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
          <ComposerModal />
        </div>
      </ComposerProvider>
    </WorkspaceProvider>
  )
}

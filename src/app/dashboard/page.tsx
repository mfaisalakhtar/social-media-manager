import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser, getUserWorkspaces } from '@/lib/auth'

export default async function WorkspaceSelectorPage() {
  let user, workspaces
  try {
    user = await getUser()
    workspaces = await getUserWorkspaces(user.id)

    // Workspace is created during signup — if somehow missing, redirect to sign-up
    if (workspaces.length === 0) redirect('/sign-up')
  } catch {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6c0 1.887.87 3.568 2.22 4.682L5 18h10l-1.22-5.318A6 6 0 0010 2z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900">Social Media Manager</span>
        </div>
        <form action="/api/auth/signout" method="POST">
          <button className="text-sm text-gray-500 hover:text-gray-700">Sign out</button>
        </form>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Select workspace</h1>
        <p className="text-sm text-gray-500 mb-8">Choose a brand to manage.</p>

        <div className="space-y-3">
          {workspaces.map(({ workspace, role }: any) => (
            <Link key={workspace.id} href={`/dashboard/${workspace.id}`}
              className="block bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-brand-500 hover:shadow-sm transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-brand-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {workspace.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{workspace.name}</div>
                  <div className="text-xs text-gray-400 capitalize">{role} &middot; {workspace.timezone}</div>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-brand-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Workspace = {
  id: string
  name: string
  slug: string
  timezone: string
}

type WorkspaceMember = {
  role: string
  workspace: Workspace
}

export default function WorkspaceSelectorPage() {
  const router = useRouter()
  const [workspaces, setWorkspaces] = useState<WorkspaceMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    const res = await fetch('/api/auth/me')
    if (!res.ok) { router.push('/sign-in'); return }
    const data = await res.json()
    setWorkspaces(data.workspaces ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function createWorkspace(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)
    setError(null)
    const res = await fetch('/api/workspaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    })
    const data = await res.json()
    setCreating(false)
    if (!res.ok) { setError(data.error?.message ?? 'Failed to create workspace'); return }
    // Navigate straight into the new workspace
    router.push(`/dashboard/${data.data.slug}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#26BB85' }}>
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6c0 1.887.87 3.568 2.22 4.682L5 18h10l-1.22-5.318A6 6 0 0010 2z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900">Social Manager</span>
        </div>
        <form action="/api/auth/signout" method="POST">
          <button className="text-sm text-gray-500 hover:text-gray-700">Sign out</button>
        </form>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Workspaces</h1>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
              style={{ backgroundColor: '#26BB85' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New workspace
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-8">Choose a brand to manage, or create a new one.</p>

        {/* New workspace form */}
        {showForm && (
          <form onSubmit={createWorkspace} className="bg-white border border-gray-200 rounded-xl px-5 py-4 mb-4 space-y-3">
            <p className="text-sm font-semibold text-gray-800">New workspace</p>
            <div>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. My Brand, Client Name…"
                autoFocus
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#26BB85' } as React.CSSProperties}
              />
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creating || !name.trim()}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all hover:opacity-90"
                style={{ backgroundColor: '#26BB85' }}
              >
                {creating ? 'Creating…' : 'Create workspace'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setName(''); setError(null) }}
                className="px-4 py-2 rounded-xl text-sm border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Workspace list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-white rounded-xl border border-gray-200 animate-pulse" />
            ))}
          </div>
        ) : workspaces.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No workspaces yet. Create one above.</div>
        ) : (
          <div className="space-y-3">
            {workspaces.map(({ workspace, role }: WorkspaceMember) => (
              <Link
                key={workspace.id}
                href={`/dashboard/${workspace.slug ?? workspace.id}`}
                className="block bg-white border border-gray-200 rounded-xl px-5 py-4 hover:shadow-sm transition-all group"
                style={{ borderColor: undefined }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#26BB85')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '')}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ backgroundColor: '#26BB85' }}
                  >
                    {workspace.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{workspace.name}</div>
                    <div className="text-xs text-gray-400 capitalize">{role} · {workspace.timezone}</div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

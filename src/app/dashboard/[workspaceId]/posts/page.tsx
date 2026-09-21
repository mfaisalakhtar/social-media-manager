'use client'

import { useState, useEffect } from 'react'
import { useWorkspaceId } from '@/contexts/WorkspaceContext'
import { useComposer } from '@/contexts/ComposerContext'

type Post = {
  id: string
  common_caption: string | null
  status: string
  scheduled_at_utc: string | null
  created_at: string
  author: { name: string } | null
}

const STATUS_TABS = [
  { key: 'all',               label: 'All' },
  { key: 'draft',             label: 'Drafts' },
  { key: 'scheduled',        label: 'Scheduled' },
  { key: 'published',        label: 'Published' },
  { key: 'pending_approval', label: 'Pending' },
  { key: 'failed',           label: 'Failed' },
]

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  draft:             { bg: 'bg-gray-100',    text: 'text-gray-600',   dot: 'bg-gray-400' },
  pending_approval:  { bg: 'bg-amber-50',    text: 'text-amber-700',  dot: 'bg-amber-400' },
  changes_requested: { bg: 'bg-orange-50',   text: 'text-orange-700', dot: 'bg-orange-400' },
  approved:          { bg: 'bg-blue-50',     text: 'text-blue-700',   dot: 'bg-blue-400' },
  scheduled:         { bg: 'bg-violet-50',   text: 'text-violet-700', dot: 'bg-violet-400' },
  publishing:        { bg: 'bg-emerald-50',  text: 'text-emerald-700',dot: 'bg-emerald-400' },
  published:         { bg: 'bg-emerald-50',  text: 'text-emerald-700',dot: 'bg-emerald-500' },
  failed:            { bg: 'bg-red-50',      text: 'text-red-700',    dot: 'bg-red-500' },
  canceled:          { bg: 'bg-gray-100',    text: 'text-gray-500',   dot: 'bg-gray-300' },
}

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.draft
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {label}
    </span>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

export default function PostsPage() {
  const workspaceId = useWorkspaceId()
  const { open: openComposer } = useComposer()

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null)

  function showToast(ok: boolean, text: string) {
    setToast({ ok, text })
    setTimeout(() => setToast(null), 3500)
  }

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/workspaces/${workspaceId}/posts`)
    const data = await res.json()
    setPosts(data.data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [workspaceId])

  async function deletePost(id: string) {
    if (!confirm('Delete this post?')) return
    setDeleting(id)
    const res = await fetch(`/api/workspaces/${workspaceId}/posts/${id}`, { method: 'DELETE' })
    setDeleting(null)
    if (res.ok) {
      showToast(true, 'Post deleted.')
      setPosts(p => p.filter(x => x.id !== id))
    } else {
      showToast(false, 'Failed to delete post.')
    }
  }

  const filtered = posts.filter(p => {
    const matchesTab = activeTab === 'all' || p.status === activeTab
    const matchesSearch = !search || (p.common_caption ?? '').toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesSearch
  })

  const counts = STATUS_TABS.reduce((acc, tab) => {
    acc[tab.key] = tab.key === 'all'
      ? posts.length
      : posts.filter(p => p.status === tab.key).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="flex flex-col h-full bg-gray-50/40">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${toast.ok ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {toast.ok
            ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
            : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}
          {toast.text}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-7 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-gray-900">Posts</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {posts.length} post{posts.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <button
            onClick={() => openComposer()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: '#26BB85' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Post
          </button>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="bg-white border-b border-gray-100 px-7">
        <div className="flex items-center justify-between">
          {/* Tabs */}
          <div className="flex items-center gap-0">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-[13px] font-medium border-b-2 transition-all ${
                  activeTab === tab.key
                    ? 'border-emerald-500 text-emerald-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {counts[tab.key] > 0 && (
                  <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${
                    activeTab === tab.key ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {counts[tab.key]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative py-2">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search posts…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-gray-50 w-52"
            />
          </div>
        </div>
      </div>

      {/* Post list */}
      <div className="flex-1 overflow-y-auto px-7 py-5">
        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-white rounded-xl border border-gray-200 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1">
              {search ? 'No posts match your search' : activeTab === 'all' ? 'No posts yet' : `No ${activeTab} posts`}
            </p>
            <p className="text-xs text-gray-400 mb-5">
              {activeTab === 'all' && !search ? 'Start by creating your first post.' : 'Try a different filter or search term.'}
            </p>
            {activeTab === 'all' && !search && (
              <button
                onClick={() => openComposer()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: '#26BB85' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Create your first post
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(post => (
              <div key={post.id}
                className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-start gap-4 hover:shadow-sm transition-shadow group">

                {/* Status dot */}
                <div className="mt-1 shrink-0">
                  <span className={`w-2 h-2 rounded-full block ${STATUS_COLORS[post.status]?.dot ?? 'bg-gray-400'}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-gray-800 leading-snug line-clamp-2">
                    {post.common_caption?.trim()
                      ? post.common_caption
                      : <span className="text-gray-400 italic">No caption</span>}
                  </p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <StatusBadge status={post.status} />
                    {post.scheduled_at_utc && (
                      <span className="flex items-center gap-1 text-[11px] text-gray-400">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                        {formatDateTime(post.scheduled_at_utc)}
                      </span>
                    )}
                    <span className="text-[11px] text-gray-300">
                      {formatDate(post.created_at)}
                    </span>
                    {post.author?.name && (
                      <span className="text-[11px] text-gray-400">by {post.author.name}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openComposer(post.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => deletePost(post.id)}
                    disabled={deleting === post.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-40">
                    {deleting === post.id
                      ? '…'
                      : <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>Delete</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

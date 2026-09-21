'use client'
import { useState, useEffect } from 'react'
import { useWorkspaceId } from '@/contexts/WorkspaceContext'

type Post = {
  id: string
  common_caption: string
  created_at: string
  author: { name: string } | null
}

export default function ApprovalsPage() {
  const workspaceId = useWorkspaceId()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<Record<string, string>>({})
  const [acting, setActing] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/workspaces/${workspaceId}/posts?status=pending_approval`)
    const data = await res.json()
    setPosts(data.data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [workspaceId])

  async function approve(postId: string) {
    setActing(postId)
    await fetch(`/api/posts/${postId}/approve`, { method: 'POST' })
    setActing(null)
    await load()
  }

  async function reject(postId: string) {
    const comment = comments[postId]
    if (!comment?.trim()) { alert('Please add a rejection comment.'); return }
    setActing(postId)
    await fetch(`/api/posts/${postId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment })
    })
    setActing(null)
    await load()
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-gray-900">Approvals</h1>
        {posts.length > 0 && (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
            {posts.length} pending
          </span>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading\u2026</div>
      ) : posts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl py-16 text-center text-gray-400 text-sm">
          Nothing pending approval.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm text-gray-800 mb-2">{post.common_caption}</p>
              <p className="text-xs text-gray-400 mb-4">
                By {post.author?.name ?? 'Unknown'} &middot;{' '}
                {new Date(post.created_at).toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })}
              </p>

              <input type="text" placeholder="Rejection comment (required to reject)\u2026"
                value={comments[post.id] ?? ''}
                onChange={e => setComments(c => ({ ...c, [post.id]: e.target.value }))}
                className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 mb-3" />

              <div className="flex gap-2">
                <button onClick={() => reject(post.id)} disabled={acting === post.id}
                  className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-100 disabled:opacity-50 transition-colors">
                  Reject
                </button>
                <button onClick={() => approve(post.id)} disabled={acting === post.id}
                  className="px-4 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 disabled:opacity-50 transition-colors">
                  {acting === post.id ? 'Processing\u2026' : 'Approve'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

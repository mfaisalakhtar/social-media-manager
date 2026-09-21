import { getUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { OpenComposerButton } from '@/components/ui/OpenComposerButton'
import { getWorkspace } from '@/lib/workspace'
import type { PostStatus } from '@/types'

export default async function DashboardPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId: slugOrId } = await params

  let user: any
  try { user = await getUser() } catch { redirect('/sign-in') }

  const workspace = await getWorkspace(slugOrId, user.id)
  if (!workspace) redirect('/dashboard')
  const workspaceId = workspace.id

  const db = createAdminClient()

  const now = new Date()
  const weekEnd = new Date(now); weekEnd.setDate(weekEnd.getDate() + 7)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [scheduledRes, pendingRes, publishedRes, failedRes, upcomingRes, auditRes] = await Promise.all([
    db.from('smm_posts').select('id', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId).eq('status', 'scheduled')
      .gte('scheduled_at_utc', now.toISOString()).lte('scheduled_at_utc', weekEnd.toISOString()),
    db.from('smm_posts').select('id', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId).eq('status', 'pending_approval'),
    db.from('smm_posts').select('id', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId).eq('status', 'published')
      .gte('updated_at', monthStart.toISOString()),
    db.from('smm_posts').select('id', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId).eq('status', 'failed'),
    db.from('smm_posts').select('id, common_caption, status, scheduled_at_utc')
      .eq('workspace_id', workspaceId)
      .in('status', ['scheduled', 'approved', 'pending_approval'])
      .order('scheduled_at_utc', { ascending: true }).limit(5),
    db.from('smm_audit_logs').select('action, safe_metadata_json, created_at')
      .eq('workspace_id', workspaceId).order('created_at', { ascending: false }).limit(6),
  ])

  const stats = {
    scheduled: scheduledRes.count ?? 0,
    pending: pendingRes.count ?? 0,
    published: publishedRes.count ?? 0,
    failed: failedRes.count ?? 0,
  }
  const upcoming = upcomingRes.data ?? []
  const activity = auditRes.data ?? []

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Scheduled this week" value={stats.scheduled} color="text-[#26BB85]" highlight />
        <StatCard label="Pending approval" value={stats.pending} color="text-yellow-600" />
        <StatCard label="Published this month" value={stats.published} color="text-green-600" />
        <StatCard label="Failed publications" value={stats.failed} color="text-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Upcoming posts</h2>
            <OpenComposerButton className="text-xs text-brand-600 hover:underline">+ New post</OpenComposerButton>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              No upcoming posts.{' '}
              <OpenComposerButton className="text-brand-600 hover:underline">Create one</OpenComposerButton>
            </p>
          ) : (
            <div className="space-y-3">
              {upcoming.map((post: any) => (
                <div key={post.id} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{post.common_caption || '(no caption)'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {post.scheduled_at_utc
                        ? new Date(post.scheduled_at_utc).toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })
                        : 'Not scheduled'}
                    </p>
                  </div>
                  <StatusBadge status={post.status as PostStatus} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Recent activity</h2>
          {activity.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No activity yet.</p>
          ) : (
            <div className="space-y-3">
              {activity.map((log: any, i: number) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-brand-400 shrink-0" />
                  <div>
                    <span className="text-gray-700">{log.safe_metadata_json?.description ?? log.action}</span>
                    <p className="text-xs text-gray-400">
                      {new Date(log.created_at).toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, highlight }: { label: string; value: number; color: string; highlight?: boolean }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-5 ${highlight ? 'border-l-4' : ''}`}
      style={highlight ? { borderLeftColor: '#DEF58A' } : {}}>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  )
}

import { createAdminClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

const PLATFORM_COLORS: Record<string, string> = {
  facebook: 'bg-blue-100 text-blue-700',
  instagram: 'bg-pink-100 text-pink-700',
  linkedin: 'bg-sky-100 text-sky-700',
  tiktok: 'bg-gray-100 text-gray-700',
  x: 'bg-gray-100 text-gray-700',
  youtube: 'bg-red-100 text-red-700',
  pinterest: 'bg-red-100 text-red-600',
}

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params

  let user; try { user = await getUser() } catch { redirect('/sign-in') }

  const db = createAdminClient()

  const [
    { count: publishedCount },
    { count: scheduledCount },
    { count: pendingCount },
    { count: failedCount },
    { data: variationsByPlatform },
    { data: recentPosts },
  ] = await Promise.all([
    db.from('smm_posts')
      .select('id', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .in('status', ['published', 'partially_published']),

    db.from('smm_posts')
      .select('id', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .eq('status', 'scheduled'),

    db.from('smm_posts')
      .select('id', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .eq('status', 'pending_approval'),

    db.from('smm_posts')
      .select('id', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .eq('status', 'failed'),

    db.from('smm_post_variations')
      .select('platform, post:smm_posts!inner(workspace_id)')
      .eq('smm_posts.workspace_id', workspaceId),

    db.from('smm_posts')
      .select('id, common_caption, status, created_at, smm_post_variations(platform)')
      .eq('workspace_id', workspaceId)
      .in('status', ['published', 'partially_published'])
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  // Count variations per platform
  const platformCounts: Record<string, number> = {}
  for (const row of variationsByPlatform ?? []) {
    platformCounts[row.platform] = (platformCounts[row.platform] ?? 0) + 1
  }

  const metrics = [
    { label: 'Published posts', value: publishedCount ?? 0 },
    { label: 'Scheduled', value: scheduledCount ?? 0 },
    { label: 'Pending approval', value: pendingCount ?? 0 },
    { label: 'Failed', value: failedCount ?? 0 },
  ]

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-lg font-semibold text-gray-900">Analytics</h1>

      {/* Status metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="text-2xl font-bold text-gray-900">{m.value.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Posts by platform */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Posts by platform</h2>
        {Object.keys(platformCounts).length === 0 ? (
          <p className="text-sm text-gray-400">No post variations yet.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {Object.entries(platformCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([platform, count]) => (
                <div key={platform} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 min-w-32">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${PLATFORM_COLORS[platform] ?? 'bg-gray-100 text-gray-600'}`}>
                    {platform}
                  </span>
                  <span className="text-lg font-bold text-gray-900">{count}</span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Recent published posts */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Recent published posts</h2>
        {!recentPosts || recentPosts.length === 0 ? (
          <p className="text-sm text-gray-400">No published posts yet.</p>
        ) : (
          <div className="space-y-3">
            {recentPosts.map((post) => {
              const platforms: string[] = Array.isArray(post.smm_post_variations)
                ? [...new Set(post.smm_post_variations.map((v: { platform: string }) => v.platform))]
                : []
              return (
                <div key={post.id} className="flex items-start gap-4 py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{post.common_caption}</p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      {platforms.map(p => (
                        <span key={p} className={`px-1.5 py-0.5 rounded text-xs font-medium capitalize ${PLATFORM_COLORS[p] ?? 'bg-gray-100 text-gray-600'}`}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 shrink-0 mt-0.5">
                    {new Date(post.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

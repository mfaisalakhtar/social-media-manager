'use client'

import { useState, useEffect } from 'react'

type Destination = {
  id: string
  platform: string
  display_name: string
  username: string | null
  status: string
  profile_image_url: string | null
}

const PLATFORMS = [
  { key: 'facebook',  label: 'Facebook',    color: '#1877F2' },
  { key: 'instagram', label: 'Instagram',   color: '#E1306C' },
  { key: 'linkedin',  label: 'LinkedIn',    color: '#0A66C2' },
  { key: 'x',         label: 'X (Twitter)', color: '#000000' },
  { key: 'threads',   label: 'Threads',     color: '#1c1c1e' },
]

function PlatformIcon({ platform, size = 16 }: { platform: string; size?: number }) {
  const s = size
  if (platform === 'facebook') return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073C24 5.406 18.627 0 12 0S0 5.406 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
  if (platform === 'instagram') return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
  if (platform === 'linkedin') return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
  if (platform === 'x') return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  if (platform === 'threads') return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.858-6.43 2.52-8.482C5.84 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.353 1.33-3.183.942-.847 2.273-1.336 3.749-1.397.544-.023 1.077-.011 1.598.033-.024-.293-.063-.571-.119-.833-.238-1.116-.81-1.717-1.728-1.788-.704-.055-1.356.123-1.883.5-.39.277-.675.66-.833 1.109l-1.96-.579c.248-.72.64-1.355 1.164-1.883.803-.803 1.878-1.271 3.117-1.391 2.21-.208 3.889.77 4.572 2.663.25.686.378 1.464.388 2.335.106.057.21.116.31.178 1.152.698 1.97 1.7 2.368 2.894.548 1.645.43 4.054-1.716 6.134-1.817 1.783-4.045 2.631-7.217 2.65z"/></svg>
  return null
}

interface ConnectModalProps {
  workspaceId: string
  onClose: () => void
  onConnected: () => void
}

function AccountAvatar({ acc, color }: { acc: Destination; color: string }) {
  if (acc.profile_image_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={acc.profile_image_url} alt="" className="w-7 h-7 rounded-full object-cover" />
    )
  }
  return (
    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
      style={{ backgroundColor: color }}>
      {acc.display_name[0]}
    </div>
  )
}

export function ConnectModal({ workspaceId, onClose, onConnected }: ConnectModalProps) {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [config, setConfig] = useState({ facebook: false, linkedin: false })
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null) // destinationId being patched

  // Mock form state
  const [mockForm, setMockForm] = useState<{ platform: string; name: string; username: string } | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const [d, c] = await Promise.all([
      fetch(`/api/workspaces/${workspaceId}/destinations`).then(r => r.json()),
      fetch('/api/social/config').then(r => r.json()),
    ])
    setDestinations(d.data ?? [])
    setConfig(c)
    setLoading(false)
  }

  useEffect(() => { load() }, [workspaceId])

  function startConnect(platform: string) {
    const hasRealOAuth = (platform === 'linkedin') ? config.linkedin : config.facebook
    if (hasRealOAuth) {
      window.open(`/api/social/${platform}/connect?workspaceId=${workspaceId}`, '_blank', 'width=600,height=700')
      // Poll for new destinations (including pending_selection) every 3s for up to 30s
      const interval = setInterval(async () => {
        const d = await fetch(`/api/workspaces/${workspaceId}/destinations`).then(r => r.json())
        const newDests: Destination[] = d.data ?? []
        if (newDests.length > destinations.length) {
          setDestinations(newDests)
          clearInterval(interval)
        }
      }, 3000)
      setTimeout(() => clearInterval(interval), 30000)
    } else {
      const existing = destinations.filter(d => d.platform === platform)
      const pLabel = PLATFORMS.find(p => p.key === platform)?.label ?? platform
      setMockForm({
        platform,
        name: existing.length > 0 ? `My ${pLabel} ${existing.length + 1}` : `My ${pLabel}`,
        username: '',
      })
    }
  }

  async function activateOne(id: string) {
    setActing(id)
    await fetch(`/api/workspaces/${workspaceId}/destinations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active' }),
    })
    setActing(null)
    setDestinations(prev => prev.map(d => d.id === id ? { ...d, status: 'active' } : d))
    onConnected()
  }

  async function skipOne(id: string) {
    setActing(id)
    await fetch(`/api/workspaces/${workspaceId}/destinations/${id}`, {
      method: 'DELETE',
    })
    setActing(null)
    setDestinations(prev => prev.filter(d => d.id !== id))
  }

  async function activateAllPending(platformKey: string) {
    const pending = destinations.filter(d => d.platform === platformKey && d.status === 'pending_selection')
    await Promise.all(pending.map(d => activateOne(d.id)))
  }

  async function skipAllPending(platformKey: string) {
    const pending = destinations.filter(d => d.platform === platformKey && d.status === 'pending_selection')
    await Promise.all(pending.map(d => skipOne(d.id)))
  }

  async function confirmMock() {
    if (!mockForm) return
    setSaving(true)
    await fetch(`/api/workspaces/${workspaceId}/destinations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform: mockForm.platform,
        display_name: mockForm.name,
        username: mockForm.username || mockForm.name.toLowerCase().replace(/\s+/g, ''),
      }),
    })
    setSaving(false)
    setMockForm(null)
    await load()
    onConnected()
  }

  async function disconnect(id: string) {
    await fetch(`/api/workspaces/${workspaceId}/destinations/${id}`, { method: 'DELETE' })
    setDestinations(prev => prev.filter(d => d.id !== id))
    onConnected()
  }

  const byPlatform = PLATFORMS.map(p => ({
    ...p,
    active: destinations.filter(d => d.platform === p.key && d.status === 'active'),
    pending: destinations.filter(d => d.platform === p.key && d.status === 'pending_selection'),
  }))

  const totalActive = destinations.filter(d => d.status === 'active').length

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Connect accounts</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">Connected here also appears in Connections page</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mock mode notice */}
        {!loading && !config.facebook && !config.linkedin && (
          <div className="mx-5 mt-3 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-700 flex items-start gap-2">
            <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <span>
              <strong>Mock mode</strong> — add META_APP_ID &amp; LINKEDIN_CLIENT_ID to env vars for real OAuth.
            </span>
          </div>
        )}

        {/* Platform list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {loading ? (
            <div className="py-8 text-center text-sm text-gray-400">Loading…</div>
          ) : (
            byPlatform.map(p => (
              <div key={p.key} className="border border-gray-200 rounded-xl overflow-hidden">

                {/* Platform header */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: p.color }}>
                      <PlatformIcon platform={p.key} size={15} />
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{p.label}</span>
                    {p.active.length > 0 && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        {p.active.length} connected
                      </span>
                    )}
                    {p.pending.length > 0 && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        {p.pending.length} new
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => startConnect(p.key === 'instagram' ? 'facebook' : p.key)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-85 shrink-0"
                    style={{ backgroundColor: p.color }}>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add
                  </button>
                </div>

                {/* Pending accounts — need user to pick */}
                {p.pending.length > 0 && (
                  <div className="border-b border-gray-100">
                    <div className="px-4 pt-2.5 pb-1 flex items-center justify-between">
                      <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide">
                        New — choose which to add
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => skipAllPending(p.key)}
                          className="text-[11px] text-gray-400 hover:text-gray-600 font-medium transition-colors">
                          Skip all
                        </button>
                        <button
                          onClick={() => activateAllPending(p.key)}
                          className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                          Add all
                        </button>
                      </div>
                    </div>
                    {p.pending.map(acc => (
                      <div key={acc.id} className="flex items-center justify-between px-4 py-2.5 bg-amber-50/40">
                        <div className="flex items-center gap-2.5">
                          <AccountAvatar acc={acc} color={p.color} />
                          <div>
                            <p className="text-[13px] font-medium text-gray-800">{acc.display_name}</p>
                            {acc.username && <p className="text-[11px] text-gray-400">@{acc.username}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => skipOne(acc.id)}
                            disabled={acting === acc.id}
                            className="text-[11px] font-medium text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-40">
                            Skip
                          </button>
                          <button
                            onClick={() => activateOne(acc.id)}
                            disabled={acting === acc.id}
                            className="flex items-center gap-1 text-[11px] font-semibold text-white px-2.5 py-1 rounded-lg transition-all hover:opacity-85 disabled:opacity-40"
                            style={{ backgroundColor: p.color }}>
                            {acting === acc.id ? '…' : (
                              <>
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                                Add
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Active (connected) accounts */}
                {p.active.length > 0 && (
                  <div className="divide-y divide-gray-100">
                    {p.active.map(acc => (
                      <div key={acc.id} className="flex items-center justify-between px-4 py-2.5 bg-white">
                        <div className="flex items-center gap-2.5">
                          <AccountAvatar acc={acc} color={p.color} />
                          <div>
                            <p className="text-[13px] font-medium text-gray-800">{acc.display_name}</p>
                            {acc.username && <p className="text-[11px] text-gray-400">@{acc.username}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-700">
                            active
                          </span>
                          <button
                            onClick={() => disconnect(acc.id)}
                            className="text-[11px] text-red-400 hover:text-red-600 font-medium transition-colors">
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {p.active.length === 0 && p.pending.length === 0 && (
                  <div className="px-4 py-2.5 bg-white">
                    <p className="text-[12px] text-gray-400">No {p.label} accounts connected yet.</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Mock form (inline) */}
        {mockForm && (
          <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/70">
            <p className="text-xs font-semibold text-gray-600 mb-3">
              Add {PLATFORMS.find(p => p.key === mockForm.platform)?.label} account
            </p>
            <div className="space-y-2">
              <input
                type="text"
                value={mockForm.name}
                onChange={e => setMockForm({ ...mockForm, name: e.target.value })}
                placeholder="Account / Page name"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
              />
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-400 px-2">@</span>
                <input
                  type="text"
                  value={mockForm.username}
                  onChange={e => setMockForm({ ...mockForm, username: e.target.value })}
                  placeholder="username (optional)"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => setMockForm(null)}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-all">
                Cancel
              </button>
              <button
                onClick={confirmMock}
                disabled={saving || !mockForm.name.trim()}
                className="flex-1 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40 transition-all hover:opacity-90"
                style={{ backgroundColor: PLATFORMS.find(p => p.key === mockForm.platform)?.color ?? '#26BB85' }}>
                {saving ? 'Adding…' : 'Add account'}
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-white rounded-b-2xl">
          <p className="text-[11px] text-gray-400">
            {totalActive} account{totalActive !== 1 ? 's' : ''} connected total
          </p>
          <button onClick={onClose}
            className="px-4 py-1.5 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-all"
            style={{ backgroundColor: '#26BB85' }}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useWorkspaceId } from '@/contexts/WorkspaceContext'

type Destination = {
  id: string
  platform: string
  display_name: string
  username: string | null
  destination_type: string
  status: string
  profile_image_url: string | null
}

type Config = {
  facebook: boolean
  instagram: boolean
  linkedin: boolean
  'linkedin-pages': boolean
  x: boolean
  threads: boolean
}

const PLATFORMS = [
  { key: 'facebook',       label: 'Facebook',         color: '#1877F2', hint: undefined },
  { key: 'instagram',      label: 'Instagram',        color: '#E1306C', hint: 'Also auto-links when you connect Facebook' },
  { key: 'linkedin',       label: 'LinkedIn',         color: '#0A66C2', hint: undefined },
  { key: 'linkedin-pages', label: 'LinkedIn Pages',   color: '#0A66C2', hint: 'Connect your LinkedIn company pages' },
  { key: 'x',              label: 'X (Twitter)',      color: '#000000', hint: undefined },
  { key: 'threads',        label: 'Threads',          color: '#1c1c1e', hint: undefined },
]

function PlatformIcon({ p, size = 18, color }: { p: string; size?: number; color?: string }) {
  const fill = color ?? 'currentColor'
  if (p === 'facebook')  return <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}><path d="M24 12.073C24 5.406 18.627 0 12 0S0 5.406 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
  if (p === 'instagram') return <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
  if (p === 'linkedin' || p === 'linkedin-pages')  return <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
  if (p === 'x')         return <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  if (p === 'threads')   return <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.858-6.43 2.52-8.482C5.84 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.353 1.33-3.183.942-.847 2.273-1.336 3.749-1.397.544-.023 1.077-.011 1.598.033-.024-.293-.063-.571-.119-.833-.238-1.116-.81-1.717-1.728-1.788-.704-.055-1.356.123-1.883.5-.39.277-.675.66-.833 1.109l-1.96-.579c.248-.72.64-1.355 1.164-1.883.803-.803 1.878-1.271 3.117-1.391 2.21-.208 3.889.77 4.572 2.663.25.686.378 1.464.388 2.335.106.057.21.116.31.178 1.152.698 1.97 1.7 2.368 2.894.548 1.645.43 4.054-1.716 6.134-1.817 1.783-4.045 2.631-7.217 2.65z"/></svg>
  return null
}

function ConnectionsContent() {
  const workspaceId = useWorkspaceId()
  const searchParams = useSearchParams()

  const [destinations, setDestinations] = useState<Destination[]>([])
  const [config, setConfig] = useState<Config>({ facebook: false, instagram: false, linkedin: false, 'linkedin-pages': false, x: false, threads: false })
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null)
  const [mockForm, setMockForm] = useState<{ platform: string; name: string; username: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null)
  const [confirmDisconnectPlatform, setConfirmDisconnectPlatform] = useState<string | null>(null)
  const [disconnectingPlatform, setDisconnectingPlatform] = useState<string | null>(null)
  const [igTipOpen, setIgTipOpen] = useState(false)

  function showToast(ok: boolean, text: string) {
    setToast({ ok, text })
    setTimeout(() => setToast(null), 4000)
  }

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

  useEffect(() => {
    const connected = searchParams.get('connected')
    const error = searchParams.get('error')
    if (connected) {
      const label = PLATFORMS.find(p => p.key === connected)?.label ?? connected
      showToast(true, `${label} connected successfully!`)
    } else if (error === 'no_pages_granted') {
      showToast(false, 'No Facebook Pages were granted. Please reconnect and tick the pages you want to manage.')
    } else if (error) {
      showToast(false, `Connection failed: ${error.replace(/_/g, ' ')}`)
    }
  }, [searchParams])

  function openOAuthPopup(platformKey: string) {
    const url = `/api/social/${platformKey}/connect?workspaceId=${workspaceId}`
    const popup = window.open(url, 'smm_oauth', 'width=520,height=680,scrollbars=yes,resizable=yes')

    const onMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      window.removeEventListener('message', onMessage)
      popup?.close()
      if (event.data?.type === 'oauth_success') {
        const label = PLATFORMS.find(p => p.key === event.data.platform)?.label ?? event.data.platform
        showToast(true, `${label} connected!`)
        await load()
      } else if (event.data?.type === 'oauth_error') {
        showToast(false, `Connection failed: ${(event.data.error ?? 'unknown').replace(/_/g, ' ')}`)
      }
    }
    window.addEventListener('message', onMessage)
    const interval = setInterval(() => {
      if (popup?.closed) { clearInterval(interval); window.removeEventListener('message', onMessage) }
    }, 1000)
  }

  function startConnect(platformKey: string) {
    const platform = PLATFORMS.find(p => p.key === platformKey)
    if (!platform) return
    const hasRealOAuth = config[platformKey as keyof Config] ?? false

    if (hasRealOAuth) {
      // Instagram: show account-switcher tip before opening popup
      if (platformKey === 'instagram' && destinations.some(d => d.platform === 'instagram')) {
        setIgTipOpen(true)
        return
      }
      openOAuthPopup(platformKey)
    } else {
      const existing = destinations.filter(d => d.platform === platformKey)
      setMockForm({
        platform: platformKey,
        name: existing.length > 0 ? `My ${platform.label} ${existing.length + 1}` : `My ${platform.label}`,
        username: '',
      })
    }
  }

  async function confirmMock() {
    if (!mockForm) return
    setSaving(true)
    const res = await fetch(`/api/workspaces/${workspaceId}/destinations`, {
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
    if (res.ok) {
      showToast(true, `${PLATFORMS.find(p => p.key === mockForm.platform)?.label} account added!`)
      setExpandedPlatform(mockForm.platform)
    } else {
      showToast(false, 'Failed to add account.')
    }
    await load()
  }

  async function disconnect(id: string, displayName: string) {
    setDisconnecting(id)
    await fetch(`/api/workspaces/${workspaceId}/destinations/${id}`, { method: 'DELETE' })
    setDisconnecting(null)
    showToast(true, `${displayName} disconnected.`)
    await load()
  }

  async function disconnectAllForPlatform(platformKey: string) {
    const accounts = destinations.filter(d => d.platform === platformKey)
    setDisconnectingPlatform(platformKey)
    setConfirmDisconnectPlatform(null)
    await Promise.all(
      accounts.map(acc =>
        fetch(`/api/workspaces/${workspaceId}/destinations/${acc.id}`, { method: 'DELETE' })
      )
    )
    setDisconnectingPlatform(null)
    const label = PLATFORMS.find(p => p.key === platformKey)?.label ?? platformKey
    showToast(true, `All ${label} accounts disconnected.`)
    await load()
  }

  const totalConnected = destinations.length
  // Only show demo mode after loading is complete — avoids false badge during initial fetch
  const isMockMode = !loading && !config.facebook && !config.linkedin && !config['linkedin-pages'] && !config.x && !config.threads

  return (
    <div className="flex flex-col h-full bg-gray-50/40">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${toast.ok ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {toast.ok
            ? <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
            : <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>}
          {toast.text}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-6">
        <div className="flex items-center justify-between max-w-3xl">
          <div>
            <h1 className="text-base font-semibold text-gray-900">Connected Accounts</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {totalConnected > 0
                ? `${totalConnected} account${totalConnected !== 1 ? 's' : ''} connected across ${new Set(destinations.map(d => d.platform)).size} platform${new Set(destinations.map(d => d.platform)).size !== 1 ? 's' : ''}`
                : 'Link your social accounts to start scheduling posts'}
            </p>
          </div>
          {isMockMode && (
            <span className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg font-medium">
              Demo mode
            </span>
          )}
        </div>
      </div>

      {/* Platform list */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-3xl space-y-2">

          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-white rounded-xl border border-gray-200 animate-pulse" />
            ))
          ) : (
            PLATFORMS.map(platform => {
              const accounts = destinations.filter(d => d.platform === platform.key)
              const isExpanded = expandedPlatform === platform.key || accounts.length > 0
              const isConnected = accounts.length > 0

              return (
                <div key={platform.key}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-sm">

                  {/* Platform row */}
                  <div className="flex items-center gap-4 px-5 py-4">
                    {/* Icon */}
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${platform.color}15` }}>
                      <PlatformIcon p={platform.key} size={18} color={platform.color} />
                    </div>

                    {/* Name + status */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{platform.label}</span>
                        {isConnected && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                            {accounts.length} connected
                          </span>
                        )}
                      </div>
                      {!isConnected && (
                        <p className="text-[12px] text-gray-400 mt-0.5">
                          {platform.hint ?? 'Not connected'}
                        </p>
                      )}
                    </div>

                    {/* Action buttons — always shown for every platform */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isConnected && (
                        <button
                          onClick={() => setConfirmDisconnectPlatform(platform.key)}
                          disabled={disconnectingPlatform === platform.key}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-red-200 text-red-500 hover:bg-red-50 transition-all disabled:opacity-40">
                          {disconnectingPlatform === platform.key ? (
                            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                          ) : (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                          )}
                          Disconnect
                        </button>
                      )}
                      <button
                        onClick={() => startConnect(platform.key)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all border"
                        style={isConnected
                          ? { borderColor: '#e5e7eb', color: '#6b7280' }
                          : { borderColor: platform.color, color: platform.color, backgroundColor: `${platform.color}08` }
                        }>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        {isConnected ? 'Add account' : 'Connect'}
                      </button>
                    </div>
                  </div>

                  {/* Connected accounts sub-list */}
                  {accounts.length > 0 && (
                    <div className="border-t border-gray-100 divide-y divide-gray-50">
                      {accounts.map(acc => (
                        <div key={acc.id}
                          className="flex items-center gap-3 px-5 py-3 bg-gray-50/50">
                          {/* Avatar */}
                          {acc.profile_image_url ? (
                            <img src={acc.profile_image_url} alt={acc.display_name}
                              className="w-7 h-7 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                              style={{ backgroundColor: platform.color }}>
                              {acc.display_name[0]?.toUpperCase()}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-gray-800 truncate">{acc.display_name}</p>
                            {acc.username && (
                              <p className="text-[11px] text-gray-400">@{acc.username}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {acc.status === 'expired' ? (
                              <button
                                onClick={() => startConnect(platform.key)}
                                className="text-[11px] px-2.5 py-1 rounded-full font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors">
                                Token expired — Reconnect
                              </button>
                            ) : (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                acc.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                              }`}>
                                {acc.status}
                              </span>
                            )}
                            <button
                              onClick={() => disconnect(acc.id, acc.display_name)}
                              disabled={disconnecting === acc.id}
                              className="text-[12px] text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40">
                              {disconnecting === acc.id ? '…' : 'Remove'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}

          {/* Help note */}
          {!loading && isMockMode && (
            <div className="flex items-start gap-3 mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <div>
                <p className="text-[13px] font-semibold text-amber-800">Running in demo mode</p>
                <p className="text-[12px] text-amber-700 mt-0.5">
                  Accounts you add here are for testing only. To connect real social profiles, add your API credentials in Vercel environment variables.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Disconnect all confirmation modal */}
      {confirmDisconnectPlatform && (() => {
        const p = PLATFORMS.find(pl => pl.key === confirmDisconnectPlatform)!
        const count = destinations.filter(d => d.platform === confirmDisconnectPlatform).length
        return (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setConfirmDisconnectPlatform(null)}>
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}>
              <div className="px-6 pt-6 pb-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <h2 className="text-sm font-semibold text-gray-900">Disconnect all {p.label} accounts?</h2>
                <p className="text-[13px] text-gray-500 mt-1.5">
                  This will remove all {count} connected {p.label} {count === 1 ? 'account' : 'accounts'} from this workspace. You can reconnect at any time.
                </p>
              </div>
              <div className="flex gap-3 px-6 pb-6">
                <button onClick={() => setConfirmDisconnectPlatform(null)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-all">
                  Cancel
                </button>
                <button
                  onClick={() => disconnectAllForPlatform(confirmDisconnectPlatform)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-all">
                  Disconnect all
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Instagram multi-account tip modal */}
      {igTipOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setIgTipOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E1306C15' }}>
                <PlatformIcon p="instagram" size={18} color="#E1306C" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Add another Instagram account</h2>
                <p className="text-[11px] text-gray-400">Follow these steps to connect a different account</p>
              </div>
              <button onClick={() => setIgTipOpen(false)}
                className="ml-auto w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-3">
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-600 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                <p className="text-[13px] text-gray-600">In the Instagram popup, tap <strong>Log into another account</strong> or log out and sign in with the account you want to add.</p>
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-600 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                <p className="text-[13px] text-gray-600">The account must be a <strong>Business or Creator</strong> account. Personal accounts cannot be connected.</p>
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-600 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                <p className="text-[13px] text-gray-600">Click <strong>Allow</strong> to grant access, then the account will appear in your connections.</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl text-[12px] text-blue-700">
                <strong>Tip:</strong> If your Instagram accounts are linked to Facebook Pages, connecting Facebook automatically discovers all linked Instagram accounts at once.
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setIgTipOpen(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button
                onClick={() => { setIgTipOpen(false); openOAuthPopup('instagram') }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ backgroundColor: '#E1306C' }}>
                Continue to Instagram
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mock connect form modal */}
      {mockForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setMockForm(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${PLATFORMS.find(p => p.key === mockForm.platform)?.color}15` }}>
                <PlatformIcon
                  p={mockForm.platform}
                  size={18}
                  color={PLATFORMS.find(p => p.key === mockForm.platform)?.color}
                />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Add {PLATFORMS.find(p => p.key === mockForm.platform)?.label} account
                </h2>
                <p className="text-[11px] text-gray-400">Demo mode</p>
              </div>
              <button onClick={() => setMockForm(null)}
                className="ml-auto w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Account name</label>
                <input
                  type="text"
                  value={mockForm.name}
                  onChange={e => setMockForm({ ...mockForm, name: e.target.value })}
                  placeholder="e.g. My Business Page"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Username <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-300">
                  <span className="px-3 py-2.5 bg-gray-50 text-gray-400 text-sm border-r border-gray-200">@</span>
                  <input
                    type="text"
                    value={mockForm.username}
                    onChange={e => setMockForm({ ...mockForm, username: e.target.value })}
                    placeholder="yourhandle"
                    className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setMockForm(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button
                onClick={confirmMock}
                disabled={saving || !mockForm.name.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all"
                style={{ backgroundColor: PLATFORMS.find(p => p.key === mockForm.platform)?.color }}>
                {saving ? 'Adding…' : 'Add account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ConnectionsPage() {
  return (
    <Suspense>
      <ConnectionsContent />
    </Suspense>
  )
}

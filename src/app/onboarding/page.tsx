'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const TIMEZONES = [
  { label: 'Karachi (PKT, UTC+5)', value: 'Asia/Karachi' },
  { label: 'Dubai (GST, UTC+4)', value: 'Asia/Dubai' },
  { label: 'London (GMT/BST)', value: 'Europe/London' },
  { label: 'New York (ET)', value: 'America/New_York' },
  { label: 'Los Angeles (PT)', value: 'America/Los_Angeles' },
  { label: 'Chicago (CT)', value: 'America/Chicago' },
  { label: 'Toronto (ET)', value: 'America/Toronto' },
  { label: 'Paris (CET)', value: 'Europe/Paris' },
  { label: 'Berlin (CET)', value: 'Europe/Berlin' },
  { label: 'Istanbul (TRT)', value: 'Europe/Istanbul' },
  { label: 'Riyadh (AST)', value: 'Asia/Riyadh' },
  { label: 'Mumbai (IST)', value: 'Asia/Kolkata' },
  { label: 'Singapore (SGT)', value: 'Asia/Singapore' },
  { label: 'Sydney (AEST)', value: 'Australia/Sydney' },
  { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
]

const PLATFORMS = [
  { key: 'facebook', label: 'Facebook', color: '#1877F2', bg: '#EEF4FF' },
  { key: 'instagram', label: 'Instagram', color: '#E1306C', bg: '#FFF0F5' },
  { key: 'linkedin', label: 'LinkedIn', color: '#0A66C2', bg: '#EFF6FF' },
  { key: 'x', label: 'X (Twitter)', color: '#000000', bg: '#F5F5F5' },
]

function PlatformIcon({ p, size = 20 }: { p: string; size?: number }) {
  if (p === 'facebook') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073C24 5.406 18.627 0 12 0S0 5.406 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
    </svg>
  )
  if (p === 'instagram') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  )
  if (p === 'linkedin') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
  if (p === 'x') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
  return null
}

function OnboardingInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const workspaceId = searchParams.get('workspaceId') ?? ''

  const [step, setStep] = useState(1)
  const [brandName, setBrandName] = useState('')
  const [timezone, setTimezone] = useState('Asia/Karachi')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showDismissWarning, setShowDismissWarning] = useState(false)

  async function saveAndContinue() {
    if (!brandName.trim()) { setError('Please enter your brand name'); return }
    setSaving(true)
    setError('')
    const res = await fetch(`/api/workspaces/${workspaceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: brandName.trim(), timezone }),
    })
    setSaving(false)
    if (!res.ok) { setError('Failed to save. Please try again.'); return }
    setStep(2)
  }

  function goToDashboard() {
    router.push(`/dashboard/${workspaceId}`)
  }

  function connectPlatform(platformKey: string) {
    const popup = window.open(
      `/api/social/${platformKey}/connect?workspaceId=${workspaceId}`,
      'smm_oauth',
      'width=520,height=680,scrollbars=yes,resizable=yes'
    )
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      window.removeEventListener('message', onMessage)
      popup?.close()
    }
    window.addEventListener('message', onMessage)
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .modal-enter { animation: fadeIn 0.3s ease forwards; }
        .warning-enter { animation: slideDown 0.25s ease forwards; }
        .shake { animation: shake 0.4s ease; }

        /* Fake blurred dashboard background */
        .bg-dashboard {
          background-color: #f8fafc;
          background-image:
            linear-gradient(135deg, #e2e8f020 25%, transparent 25%),
            linear-gradient(225deg, #e2e8f020 25%, transparent 25%),
            linear-gradient(45deg, #e2e8f020 25%, transparent 25%),
            linear-gradient(315deg, #e2e8f020 25%, #f8fafc 25%);
          background-size: 40px 40px;
        }
      `}</style>

      {/* Full-screen overlay with blurred app-like background */}
      <div className="bg-dashboard fixed inset-0 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(0px)' }}>

        {/* Fake dashboard chrome in background for depth */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none opacity-40">
          {/* Sidebar */}
          <div className="absolute left-0 top-0 bottom-0 w-56 bg-white border-r border-gray-200 flex flex-col gap-2 p-4 hidden md:flex">
            <div className="w-24 h-6 bg-gray-200 rounded-md mb-4" />
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-100 rounded-lg" style={{ width: `${70 + Math.random() * 30}%` }} />
            ))}
          </div>
          {/* Top bar */}
          <div className="absolute top-0 left-56 right-0 h-14 bg-white border-b border-gray-200 hidden md:block" />
          {/* Content area mockup */}
          <div className="absolute top-14 left-56 right-0 bottom-0 p-6 hidden md:block">
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-white rounded-2xl border border-gray-200" />
              ))}
            </div>
            <div className="h-48 bg-white rounded-2xl border border-gray-200" />
          </div>
        </div>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />

        {/* Modal */}
        <div className="modal-enter relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

          {/* Dismiss warning banner */}
          {showDismissWarning && (
            <div className="warning-enter absolute inset-x-0 top-0 z-10 bg-amber-50 border-b border-amber-200 px-6 py-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-amber-900">This step matters</p>
                  <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                    Your brand name and timezone help us schedule posts correctly and personalize your workspace. It only takes 20 seconds.
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => setShowDismissWarning(false)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-all hover:opacity-90"
                      style={{ backgroundColor: '#003b3d' }}
                    >
                      Complete setup
                    </button>
                    <button
                      onClick={goToDashboard}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Skip for now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* X close button */}
          <button
            onClick={() => {
              setShowDismissWarning(true)
            }}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all text-gray-500 hover:text-gray-700"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Modal header */}
          <div className="px-8 pt-8 pb-0">
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              {[1, 2].map(s => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    s < step ? 'text-white' :
                    s === step ? 'text-white' :
                    'text-gray-400'
                  }`} style={{
                    backgroundColor: s < step ? '#26bb85' : s === step ? '#003b3d' : '#e5e7eb'
                  }}>
                    {s < step ? (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : s}
                  </div>
                  {s < 2 && (
                    <div className="w-16 h-0.5 rounded-full transition-all" style={{ backgroundColor: s < step ? '#26bb85' : '#e5e7eb' }} />
                  )}
                </div>
              ))}
              <span className="ml-2 text-xs text-gray-400 font-medium">Step {step} of 2</span>
            </div>
          </div>

          {/* Step 1 — Brand setup */}
          {step === 1 && (
            <div className="px-8 pb-8">
              <div className="mb-6">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: '#f0fdf4' }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#26bb85" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Name your workspace</h2>
                <p className="text-sm text-gray-500 mt-1">This is how your brand will appear across the app.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                    Brand name <span className="text-red-400 normal-case tracking-normal font-medium">*</span>
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={e => { setBrandName(e.target.value); setError('') }}
                    placeholder="e.g. Codeink Studio, My Agency…"
                    autoFocus
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 transition-colors placeholder:text-gray-300"
                  />
                  {error && (
                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Timezone</label>
                  <div className="relative">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <select
                      value={timezone}
                      onChange={e => setTimezone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 transition-colors bg-white appearance-none"
                    >
                      {TIMEZONES.map(tz => (
                        <option key={tz.value} value={tz.value}>{tz.label}</option>
                      ))}
                    </select>
                    <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                onClick={saveAndContinue}
                disabled={saving || !brandName.trim()}
                className="mt-6 w-full py-3 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-40 hover:opacity-90"
                style={{ backgroundColor: '#003b3d' }}
              >
                {saving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    Continue
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400 mt-3">
                You can update this anytime in workspace settings
              </p>
            </div>
          )}

          {/* Step 2 — Connect accounts */}
          {step === 2 && (
            <div className="px-8 pb-8">
              <div className="mb-6">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: '#f0fdf4' }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#26bb85" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Connect your accounts</h2>
                <p className="text-sm text-gray-500 mt-1">Link your social profiles to start publishing. Skip for now and add them later.</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 mb-6">
                {PLATFORMS.map(p => (
                  <button
                    key={p.key}
                    onClick={() => connectPlatform(p.key)}
                    className="flex items-center gap-2.5 px-4 py-3 border-2 border-gray-100 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-200 hover:shadow-sm transition-all text-left"
                    style={{ '--hover-bg': p.bg } as React.CSSProperties}
                  >
                    <span style={{ color: p.color }}>
                      <PlatformIcon p={p.key} size={17} />
                    </span>
                    {p.label}
                  </button>
                ))}
              </div>

              <button
                onClick={goToDashboard}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{ backgroundColor: '#003b3d' }}
              >
                Go to my dashboard
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>

              <p className="text-center text-xs text-gray-400 mt-3">
                You can connect accounts anytime from the Connections page
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingInner />
    </Suspense>
  )
}

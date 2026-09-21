'use client'

import { useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function OAuthDoneInner() {
  const searchParams = useSearchParams()
  const platform = searchParams.get('platform') ?? ''
  const error = searchParams.get('error') ?? ''
  const sent = useRef(false)

  useEffect(() => {
    if (sent.current) return
    sent.current = true

    const payload = error
      ? { type: 'oauth_error', error }
      : { type: 'oauth_success', platform }

    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(payload, window.location.origin)
      window.close()
    } else {
      // Fallback: not opened as popup — go to dashboard
      window.location.href = '/dashboard'
    }
  }, [platform, error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {error ? (
          <>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">Connection failed</p>
            <p className="text-xs text-gray-400 mt-1">{error.replace(/_/g, ' ')}</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">Connected!</p>
            <p className="text-xs text-gray-400 mt-1">Closing window…</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function OAuthDonePage() {
  return (
    <Suspense>
      <OAuthDoneInner />
    </Suspense>
  )
}

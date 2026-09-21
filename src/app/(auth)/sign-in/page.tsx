'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

function SignInForm() {
  const searchParams = useSearchParams()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router = useRouter()

  useEffect(() => {
    const pre = searchParams.get('email')
    if (pre) setEmail(decodeURIComponent(pre))
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Invalid email or password.'); setLoading(false); return }
    router.push('/dashboard'); router.refresh()
  }

  const floatLabel = "absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 bg-white px-1 transition-all duration-150 pointer-events-none peer-focus:top-0 peer-focus:text-[11px] peer-focus:font-medium peer-focus:text-brand-600 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-medium peer-[:not(:placeholder-shown)]:text-gray-500"
  const baseCls = "peer w-full px-4 pt-5 pb-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition bg-white placeholder-transparent"

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mb-1">
        Welcome back
      </h1>
      <p className="text-sm text-gray-400 mb-7">
        New here?{' '}
        <Link href="/sign-up" className="text-brand-600 font-medium hover:underline">Create an account</Link>
      </p>

      {error && (
        <div className="mb-5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Email */}
        <div className="relative">
          <input id="email" type="email" required autoComplete="email" placeholder=" "
            value={email} onChange={e => setEmail(e.target.value)}
            className={baseCls} />
          <label htmlFor="email" className={floatLabel}>Email address</label>
        </div>

        {/* Password */}
        <div className="relative">
          <input id="password" type={showPw ? 'text' : 'password'} required autoComplete="current-password" placeholder=" "
            value={password} onChange={e => setPassword(e.target.value)}
            className={`${baseCls} pr-11`} />
          <label htmlFor="password" className={floatLabel}>Password</label>
          <button type="button" onClick={() => setShowPw(v => !v)}
            className="absolute inset-y-0 right-0 px-3.5 text-gray-400 hover:text-gray-600 transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              {showPw
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                : <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></>
              }
            </svg>
          </button>
        </div>

        {/* Row: Remember me + Forgot password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button type="button" role="checkbox" aria-checked={remember}
              onClick={() => setRemember(v => !v)}
              className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors"
              style={{ background: remember ? '#26bb85' : '#fff', borderColor: remember ? '#26bb85' : '#d1d5db' }}>
              {remember && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              )}
            </button>
            <span className="text-sm text-gray-500 cursor-pointer select-none"
              onClick={() => setRemember(v => !v)}>Remember me</span>
          </div>
          <Link href="/forgot-password" className="text-sm text-brand-600 hover:underline">Forgot password?</Link>
        </div>

        {/* Log in button */}
        <button type="submit" disabled={loading}
          className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-90 active:scale-[0.99]"
          style={{ background: '#00585b' }}>
          {loading
            ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Logging in…</>
            : 'Log in'}
        </button>

      </form>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-gray-100 rounded w-3/4" />
        <div className="h-5 bg-gray-100 rounded w-1/2" />
        <div className="h-12 bg-gray-100 rounded-xl" />
        <div className="h-12 bg-gray-100 rounded-xl" />
        <div className="h-12 bg-gray-100 rounded-xl" />
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}

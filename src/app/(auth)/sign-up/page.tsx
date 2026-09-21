'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function getStrength(p: string) {
  if (!p) return null
  let s = 0
  if (p.length >= 8) s++
  if (p.length >= 12) s++
  if (/[A-Z]/.test(p)) s++
  if (/[0-9]/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  if (s <= 1) return { label: 'Weak', color: '#f87171', w: '25%' }
  if (s === 2) return { label: 'Fair', color: '#fbbf24', w: '50%' }
  if (s === 3) return { label: 'Good', color: '#facc15', w: '75%' }
  return { label: 'Strong', color: '#26bb85', w: '100%' }
}

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const strength = getStrength(password)
  const mismatch = confirm.length > 0 && password !== confirm
  const matched = confirm.length > 0 && password === confirm

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (mismatch) return setError('Passwords do not match.')
    if (!agreed) return setError('Please accept the terms to continue.')
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Something went wrong.'); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  const inputCls = "w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition"

  return (
    <div className="animate-slide-up">
      <h1 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">Create your account</h1>
      <p className="text-sm text-gray-500 mb-7">
        Already have one?{' '}
        <Link href="/sign-in" className="text-brand-600 font-medium hover:underline">Log in</Link>
      </p>

      {error && (
        <div className="mb-5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
          <input type="text" required autoComplete="name" value={name}
            onChange={e => setName(e.target.value)} placeholder="Jane Smith" className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input type="email" required autoComplete="email" value={email}
            onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} required minLength={8} autoComplete="new-password"
              value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters"
              className={`${inputCls} pr-11`} />
            <button type="button" onClick={() => setShowPw(v => !v)}
              className="absolute inset-y-0 right-0 px-3.5 text-gray-400 hover:text-gray-600 transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                {showPw
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  : <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></>
                }
              </svg>
            </button>
          </div>
          {strength && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: strength.w, background: strength.color }} />
              </div>
              <span className="text-xs font-medium w-10 text-right" style={{ color: strength.color }}>
                {strength.label}
              </span>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
          <div className="relative">
            <input type="password" required autoComplete="new-password" value={confirm}
              onChange={e => setConfirm(e.target.value)} placeholder="Re-enter password"
              className={`${inputCls} pr-10 ${mismatch ? 'border-red-300 focus:border-red-400 focus:ring-red-300/20' : matched ? 'border-brand-400' : ''}`} />
            {confirm.length > 0 && (
              <div className="absolute inset-y-0 right-0 px-3.5 flex items-center pointer-events-none">
                {matched
                  ? <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  : <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                }
              </div>
            )}
          </div>
          {mismatch && <p className="mt-1 text-xs text-red-500">Passwords don&apos;t match</p>}
        </div>

        <div className="flex items-start gap-2.5">
          <button type="button" role="checkbox" aria-checked={agreed} onClick={() => setAgreed(v => !v)}
            className="mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors"
            style={{ background: agreed ? '#26bb85' : 'white', borderColor: agreed ? '#26bb85' : '#d1d5db' }}>
            {agreed && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
          </button>
          <p className="text-xs text-gray-500 leading-relaxed">
            I agree to the{' '}
            <Link href="/terms" className="text-brand-600 hover:underline" target="_blank">Terms</Link>
            {' '}&amp;{' '}
            <Link href="/privacy" className="text-brand-600 hover:underline" target="_blank">Privacy Policy</Link>
          </p>
        </div>

        <button type="submit" disabled={loading || mismatch}
          className="w-full py-3 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: '#a8e6c9', color: '#003b3d' }}>
          {loading
            ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Creating…</>
            : 'Create account'}
        </button>
      </form>
    </div>
  )
}

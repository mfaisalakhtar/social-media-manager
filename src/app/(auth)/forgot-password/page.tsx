'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="animate-scale-in">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: '#dff5eb' }}>
          <svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Check your inbox</h2>
        <p className="text-sm text-gray-500 mb-1 leading-relaxed">
          We sent a reset link to <span className="font-semibold text-gray-800">{email}</span>.
        </p>
        <p className="text-xs text-gray-400 mb-8">Didn&apos;t get it? Check your spam folder.</p>
        <Link href="/sign-in"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:underline">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Back to log in
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-slide-up">
      <h1 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">Reset your password</h1>
      <p className="text-sm text-gray-500 mb-7">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input type="email" required autoComplete="email" value={email}
            onChange={e => setEmail(e.target.value)} placeholder="Your email address"
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition" />
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: '#a8e6c9', color: '#003b3d' }}>
          {loading
            ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Sending…</>
            : 'Send reset link'}
        </button>
      </form>

      <p className="mt-6">
        <Link href="/sign-in"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-brand-600 transition">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Back to log in
        </Link>
      </p>
    </div>
  )
}

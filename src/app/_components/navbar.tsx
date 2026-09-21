'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={
        scrolled
          ? {
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 1px 24px rgba(0,0,0,0.05)',
            }
          : { background: 'transparent' }
      }
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #003b3d, #26bb85)' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" fill="#c5f06a" />
              <circle cx="8" cy="8" r="2.5" fill="#003b3d" />
            </svg>
          </div>
          <span
            className="font-black text-gray-950 tracking-tight"
            style={{ fontFamily: 'var(--font-bricolage)', fontSize: 17 }}
          >
            Social<span style={{ color: '#26bb85' }}>.</span>
          </span>
        </Link>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'Platforms', 'Pricing', 'Results'].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-sm font-medium text-gray-600 hover:text-gray-950 transition-colors"
            >
              {link}
            </a>
          ))}
        </div>

        {/* Right CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="hidden sm:block text-sm font-medium text-gray-600 hover:text-gray-950 transition-colors px-3 py-1.5"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="text-sm font-bold text-gray-950 px-4 py-2 rounded-full"
            style={{
              background: '#c5f06a',
              boxShadow: '0 2px 12px rgba(197,240,106,0.3)',
            }}
          >
            Get started free
          </Link>
        </div>
      </div>
    </nav>
  )
}

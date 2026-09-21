'use client'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const IG_PATH = 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z'
const FB_PATH = 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'
const LI_PATH = 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'
const X_PATH = 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'

/* ── SIGN-IN: Animated bar chart ────────────────────────── */
function SignInVisual() {
  const bars = [
    { month: 'Jan', pct: 52 },
    { month: 'Feb', pct: 71 },
    { month: 'Mar', pct: 44 },
    { month: 'Apr', pct: 83 },
    { month: 'May', pct: 60 },
    { month: 'Jun', pct: 88 },
  ]
  const CH = 80    // chart height
  const BW = 28    // bar width
  const GAP = 14   // gap between bars
  const SVG_W = bars.length * (BW + GAP) - GAP

  return (
    <div className="flex flex-col h-full">

      {/* Badge */}
      <div className="mb-5">
        <span className="text-[10px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded border"
          style={{ color: 'rgba(52,211,153,0.75)', borderColor: 'rgba(52,211,153,0.2)', background: 'rgba(52,211,153,0.06)' }}>
          Social Media Manager
        </span>
      </div>

      {/* Headline */}
      <div className="mb-5">
        <h2 className="text-[2.4rem] xl:text-[2.7rem] font-extrabold leading-[1.1] tracking-tight" style={{ color: '#DEF58A' }}>
          See what works.<br />Do more of it.
        </h2>
        <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Clear insights for every channel, in one view.
        </p>
      </div>

      {/* Stats row */}
      <div className="flex items-start gap-6 mb-6 pb-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        {[
          { val: '33,500', pct: '+24.5%', lbl: 'Impressions' },
          { val: '2,840',  pct: '+12.3%', lbl: 'Engagement' },
          { val: '120k',   pct: '+18.9%', lbl: 'Followers' },
        ].map((s, i) => (
          <div key={i} className={i > 0 ? 'pl-6 border-l' : ''} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-[11px] font-bold" style={{ color: '#4ade80' }}>{s.pct}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17l9.2-9.2M17 17V7H7"/>
              </svg>
            </div>
            <p className="text-xl font-extrabold text-white leading-none">{s.val}</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.lbl}</p>
          </div>
        ))}
      </div>

      {/* Animated bar chart */}
      <div className="flex-1 flex flex-col justify-end min-h-0 px-6">
        <svg
          width="100%"
          viewBox={`0 0 ${SVG_W} ${CH + 28}`}
          preserveAspectRatio="xMidYMax meet"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#26bb85" stopOpacity="1"/>
              <stop offset="100%" stopColor="#0d6e52" stopOpacity="0.7"/>
            </linearGradient>
            <linearGradient id="barGradHi" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#DEF58A" stopOpacity="1"/>
              <stop offset="100%" stopColor="#26bb85" stopOpacity="0.8"/>
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((t, i) => (
            <line key={i}
              x1={0} y1={CH - t * CH}
              x2={SVG_W} y2={CH - t * CH}
              stroke="rgba(255,255,255,0.05)" strokeWidth="1"
            />
          ))}

          {/* Bars */}
          {bars.map((b, i) => {
            const bH = (b.pct / 100) * CH
            const x  = i * (BW + GAP)
            const isLast = i === bars.length - 1
            return (
              <g key={i}>
                {/* Bar */}
                <rect
                  x={x} y={CH} width={BW} height={0} rx={6}
                  fill={isLast ? 'url(#barGradHi)' : 'url(#barGrad)'}
                  filter={isLast ? 'url(#glow)' : undefined}
                >
                  <animate attributeName="height" from="0" to={bH}   dur="0.7s" begin={`${i * 0.1}s`} fill="freeze" calcMode="spline" keySplines="0.4 0 0.2 1" keyTimes="0;1"/>
                  <animate attributeName="y"      from={CH} to={CH - bH} dur="0.7s" begin={`${i * 0.1}s`} fill="freeze" calcMode="spline" keySplines="0.4 0 0.2 1" keyTimes="0;1"/>
                </rect>

                {/* Value label on top */}
                <text
                  x={x + BW / 2} y={CH - bH - 5}
                  textAnchor="middle" fontSize="8" fontFamily="Inter,sans-serif"
                  fill={isLast ? '#DEF58A' : 'rgba(255,255,255,0.5)'} fontWeight={isLast ? '700' : '500'}
                >
                  <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin={`${i * 0.1 + 0.5}s`} fill="freeze"/>
                  {b.pct}%
                </text>

                {/* Month label */}
                <text
                  x={x + BW / 2} y={CH + 14}
                  textAnchor="middle" fontSize="8" fontFamily="Inter,sans-serif"
                  fill="rgba(255,255,255,0.3)"
                >
                  {b.month}
                </text>
              </g>
            )
          })}

        </svg>
      </div>

      <p className="mt-3 text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
        Analytics that show your next move
      </p>
    </div>
  )
}

/* ── SIGN-UP: Dashboard mockup ──────────────────────────── */
function SignUpVisual() {
  const posts = [
    { path: IG_PATH, color: '#E1306C', text: 'Launching our new collection — stay tuned!', time: 'Today 6:30 PM', status: 'Scheduled' },
    { path: FB_PATH, color: '#1877F2', text: 'Join us live for Q3 results walkthrough.',    time: 'Tomorrow 9 AM', status: 'Scheduled' },
    { path: LI_PATH, color: '#0A66C2', text: "We're hiring! Check out 3 open roles.",       time: 'Wed 10:00 AM', status: 'Draft'      },
  ]

  return (
    <div className="flex flex-col h-full">

      {/* Badge */}
      <div className="mb-5">
        <span className="text-[10px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded border"
          style={{ color: 'rgba(52,211,153,0.75)', borderColor: 'rgba(52,211,153,0.2)', background: 'rgba(52,211,153,0.06)' }}>
          Get Started Free
        </span>
      </div>

      {/* Headline */}
      <div className="mb-5">
        <h2 className="text-[2.4rem] xl:text-[2.7rem] font-extrabold leading-[1.1] tracking-tight" style={{ color: '#DEF58A' }}>
          Everything you need<br />to grow.
        </h2>
        <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Publish, schedule and analyze — all in one place.
        </p>
      </div>

      {/* Dashboard mockup window */}
      <div className="flex-1 rounded-2xl overflow-hidden min-h-0"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>

        {/* Window title bar */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
          <span className="ml-3 text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>social.codeinkstudio.com/dashboard</span>
        </div>

        <div className="flex h-full" style={{ maxHeight: 'calc(100% - 36px)' }}>

          {/* Sidebar */}
          <div className="w-10 flex flex-col items-center py-3 gap-3 border-r flex-shrink-0"
            style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.15)' }}>
            {/* Home */}
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(38,187,133,0.2)' }}>
              <svg className="w-3.5 h-3.5" style={{ color: '#26bb85' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
            </div>
            {[
              <path key="cal" strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>,
              <path key="chart" strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>,
              <path key="users" strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>,
            ].map((icon, i) => (
              <div key={i} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <svg className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.35)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {icon}
                </svg>
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 p-3 overflow-hidden">
            {/* Mini stat cards */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: 'Impressions', val: '33.5k', pct: '+24%', color: '#26bb85' },
                { label: 'Engagement',  val: '2,840', pct: '+12%', color: '#60a5fa' },
                { label: 'Followers',   val: '120k',  pct: '+18%', color: '#a78bfa' },
              ].map((s, i) => (
                <div key={i} className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-[8px] mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</p>
                  <p className="text-xs font-bold text-white">{s.val}</p>
                  <p className="text-[8px] font-semibold" style={{ color: s.color }}>{s.pct}</p>
                </div>
              ))}
            </div>

            {/* Scheduled posts */}
            <p className="text-[9px] font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>UPCOMING POSTS</p>
            <div className="flex flex-col gap-1.5">
              {posts.map((p, i) => (
                <div key={i} className="flex items-center gap-2 px-2.5 py-2 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ background: p.color }}>
                    <svg className="w-2.5 h-2.5" fill="white" viewBox="0 0 24 24"><path d={p.path}/></svg>
                  </div>
                  <p className="text-[9px] text-white flex-1 truncate" style={{ opacity: 0.7 }}>{p.text}</p>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                    p.status === 'Scheduled' ? 'text-emerald-300 bg-emerald-500/15' : 'text-yellow-300 bg-yellow-500/15'
                  }`}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-3 text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
        Trusted by 2,000+ teams already growing
      </p>
    </div>
  )
}

/* ── FORGOT-PASSWORD: Security visual ───────────────────── */
function ForgotPasswordVisual() {
  return (
    <div className="flex flex-col h-full">

      <div className="mb-5">
        <span className="text-[10px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded border"
          style={{ color: 'rgba(52,211,153,0.75)', borderColor: 'rgba(52,211,153,0.2)', background: 'rgba(52,211,153,0.06)' }}>
          Secure &amp; Private
        </span>
      </div>

      <div className="mb-6">
        <h2 className="text-[2.4rem] xl:text-[2.7rem] font-extrabold leading-[1.1] tracking-tight" style={{ color: '#DEF58A' }}>
          Your account is<br />in safe hands.
        </h2>
        <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          We take security seriously so you don&apos;t have to.
        </p>
      </div>

      {/* Glowing lock */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-3xl opacity-40" style={{ background: '#26bb85', transform: 'scale(1.6)' }} />
          <div className="relative w-24 h-24 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(38,187,133,0.1)', border: '1px solid rgba(38,187,133,0.3)' }}>
            <svg className="w-11 h-11" style={{ color: '#26bb85' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Trust points */}
      <div className="flex-1 flex flex-col gap-3">
        {[
          {
            icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>,
            title: '256-bit encryption',
            desc: 'All data encrypted at rest and in transit.',
          },
          {
            icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>,
            title: 'Zero-knowledge auth',
            desc: 'We never store your password in plain text.',
          },
          {
            icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>,
            title: 'SOC 2 compliant',
            desc: 'Enterprise-grade security standards enforced.',
          },
        ].map((pt, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(38,187,133,0.12)', border: '1px solid rgba(38,187,133,0.2)' }}>
              <svg className="w-4 h-4" style={{ color: '#26bb85' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {pt.icon}
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{pt.title}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>{pt.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
        Trusted by 2,000+ teams worldwide
      </p>
    </div>
  )
}

/* ── LAYOUT ─────────────────────────────────────────────── */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const RightVisual =
    pathname === '/sign-up'         ? SignUpVisual :
    pathname === '/forgot-password' ? ForgotPasswordVisual :
    SignInVisual

  return (
    <div className="min-h-screen flex bg-white">

      {/* LEFT */}
      <div className="flex flex-col w-full lg:w-[44%] px-10 sm:px-14 xl:px-16 py-10 bg-white">
        <div className="mb-10">
          <Image src="/logo-cis.svg" alt="CodeInk Studio" width={80} height={11} priority />
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto">
            {children}
          </div>
        </div>
        <div className="mt-8">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <a href="/terms" className="hover:text-gray-600 transition">Terms</a>
            <span>·</span>
            <a href="/privacy" className="hover:text-gray-600 transition">Privacy</a>
            <span>·</span>
            <span>Security</span>
            <span className="ml-auto">© 2026 CodeInk Studio</span>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden rounded-l-[28px] m-3"
        style={{ background: '#071c15' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(38,187,133,0.12) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }} />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(38,187,133,0.18) 0%, transparent 65%)' }} />
        <div className="relative z-10 flex flex-col h-full px-10 xl:px-12 py-10">
          <RightVisual />
        </div>
      </div>

    </div>
  )
}

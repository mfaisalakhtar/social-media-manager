import Link from 'next/link'
import { AnimatedStat } from './_components/animated-counter'
import { Navbar } from './_components/navbar'

// ─── Icons ────────────────────────────────────────────────────────────────────
function FacebookIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073C24 5.406 18.627 0 12 0S0 5.406 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" /></svg>
}
function InstagramIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
}
function LinkedInIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
}
function XIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
}
function ThreadsIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.858-6.43 2.52-8.482C5.84 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.353 1.33-3.183.942-.847 2.273-1.336 3.749-1.397.544-.023 1.077-.011 1.598.033-.024-.293-.063-.571-.119-.833-.238-1.116-.81-1.717-1.728-1.788-.704-.055-1.356.123-1.883.5-.39.277-.675.66-.833 1.109l-1.96-.579c.248-.72.64-1.355 1.164-1.883.803-.803 1.878-1.271 3.117-1.391 2.21-.208 3.889.77 4.572 2.663.25.686.378 1.464.388 2.335.106.057.21.116.31.178 1.152.698 1.97 1.7 2.368 2.894.548 1.645.43 4.054-1.716 6.134-1.817 1.783-4.045 2.631-7.217 2.65z" /></svg>
}
function YouTubeIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
}
function TikTokIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
}
function PinterestIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
}
function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
}

// ─── Dashboard SVG Mockup ─────────────────────────────────────────────────────
function DashboardMockup() {
  return (
    <svg viewBox="0 0 560 360" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full drop-shadow-2xl">
      {/* Window chrome */}
      <rect width="560" height="360" rx="12" fill="#0f1a1a" />
      <rect width="560" height="36" rx="12" fill="#1a2828" />
      <rect y="24" width="560" height="12" fill="#1a2828" />
      <circle cx="18" cy="18" r="5" fill="#ff5f57" />
      <circle cx="34" cy="18" r="5" fill="#febc2e" />
      <circle cx="50" cy="18" r="5" fill="#28c840" />

      {/* Left sidebar */}
      <rect x="0" y="36" width="140" height="324" fill="#0d1616" />
      {/* Sidebar logo */}
      <rect x="12" y="52" width="24" height="24" rx="6" fill="#003b3d" />
      <text x="24" y="67" textAnchor="middle" fill="#c5f06a" fontSize="10" fontWeight="bold">S</text>
      <rect x="44" y="57" width="56" height="6" rx="3" fill="#1e3333" />
      <rect x="44" y="66" width="36" height="4" rx="2" fill="#162828" />
      {/* Sidebar menu */}
      {[0,1,2,3,4,5].map(i => (
        <g key={i}>
          <rect x="12" y={96 + i * 34} width="116" height="26" rx="6" fill={i === 0 ? '#003b3d' : 'transparent'} />
          <rect x="22" y={103 + i * 34} width="12" height="12" rx="3" fill={i === 0 ? '#c5f06a' : '#1e3333'} />
          <rect x="40" y={106 + i * 34} width={[60,48,52,44,56,40][i]} height="6" rx="3" fill={i === 0 ? '#4a6b6b' : '#1e3333'} />
        </g>
      ))}

      {/* Main content area */}
      <rect x="140" y="36" width="420" height="324" fill="#111e1e" />

      {/* Top bar */}
      <rect x="140" y="36" width="420" height="44" fill="#0d1616" />
      <rect x="156" y="50" width="120" height="16" rx="8" fill="#1a2828" />
      <rect x="284" y="50" width="80" height="16" rx="8" fill="#1a2828" />
      <circle cx="530" cy="58" r="12" fill="#003b3d" />

      {/* Stat cards row */}
      {[
        { x: 156, label: 'Posts This Week', value: '24', color: '#c5f06a' },
        { x: 266, label: 'Total Reach', value: '142K', color: '#60a5fa' },
        { x: 376, label: 'Engagement', value: '8.4%', color: '#f59e0b' },
        { x: 486, label: 'Accounts', value: '12', color: '#a78bfa' },
      ].map(card => (
        <g key={card.x}>
          <rect x={card.x} y="96" width="96" height="58" rx="8" fill="#0d1616" stroke="#1e3333" strokeWidth="1" />
          <text x={card.x + 10} y="114" fill="#4a6b6b" fontSize="7">{card.label}</text>
          <text x={card.x + 10} y="134" fill={card.color} fontSize="18" fontWeight="bold">{card.value}</text>
          <rect x={card.x + 10} y="143" width="30" height="3" rx="1.5" fill={card.color} opacity="0.4" />
        </g>
      ))}

      {/* Chart area */}
      <rect x="156" y="168" width="240" height="120" rx="8" fill="#0d1616" stroke="#1e3333" strokeWidth="1" />
      <text x="168" y="184" fill="#4a6b6b" fontSize="8">Engagement Over Time</text>
      {/* Chart line */}
      <polyline
        points="168,268 188,250 208,256 228,234 248,238 268,218 288,224 308,206 328,212 348,196 368,200"
        fill="none" stroke="#c5f06a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
      <polyline
        points="168,268 188,250 208,256 228,234 248,238 268,218 288,224 308,206 328,212 348,196 368,200 368,276 168,276"
        fill="url(#chartGrad)" opacity="0.3"
      />
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c5f06a" />
          <stop offset="100%" stopColor="#c5f06a" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0,1,2,3].map(i => (
        <line key={i} x1="168" y1={196 + i * 20} x2="376" y2={196 + i * 20} stroke="#1a2828" strokeWidth="0.5" />
      ))}

      {/* Posts list */}
      <rect x="408" y="168" width="148" height="120" rx="8" fill="#0d1616" stroke="#1e3333" strokeWidth="1" />
      <text x="420" y="184" fill="#4a6b6b" fontSize="8">Upcoming Posts</text>
      {[
        { platform: '#1877F2', time: 'Today 3:00 PM' },
        { platform: '#E1306C', time: 'Today 5:30 PM' },
        { platform: '#0A66C2', time: 'Tomorrow 9:00 AM' },
        { platform: '#000', time: 'Tomorrow 2:00 PM' },
      ].map((post, i) => (
        <g key={i}>
          <rect x="420" y={193 + i * 22} width="8" height="8" rx="2" fill={post.platform} />
          <rect x="434" y={194 + i * 22} width="60" height="4" rx="2" fill="#1e3333" />
          <rect x="434" y={201 + i * 22} width="44" height="3" rx="1.5" fill="#152222" />
          <rect x="498" y={193 + i * 22} width="38" height="14" rx="4" fill="#003b3d" />
          <text x="517" y={203 + i * 22} textAnchor="middle" fill="#c5f06a" fontSize="5.5" fontWeight="bold">SCHEDULED</text>
        </g>
      ))}

      {/* Platform badges */}
      <rect x="156" y="300" width="400" height="48" rx="8" fill="#0d1616" stroke="#1e3333" strokeWidth="1" />
      <text x="168" y="316" fill="#4a6b6b" fontSize="8">Connected Platforms</text>
      {[
        { color: '#1877F2', x: 168 },
        { color: '#E1306C', x: 198 },
        { color: '#0A66C2', x: 228 },
        { color: '#000000', x: 258 },
        { color: '#1c1c1e', x: 288 },
      ].map((p, i) => (
        <g key={i}>
          <rect x={p.x} y="324" width="22" height="14" rx="4" fill={p.color} opacity="0.15" />
          <rect x={p.x + 3} y="328" width="16" height="6" rx="2" fill={p.color} opacity="0.6" />
        </g>
      ))}
      <rect x="320" y="322" width="60" height="18" rx="6" fill="#003b3d" />
      <text x="350" y="334" textAnchor="middle" fill="#c5f06a" fontSize="7" fontWeight="bold">+ Add more</text>
    </svg>
  )
}

// ─── Analytics SVG ────────────────────────────────────────────────────────────
function AnalyticsChart() {
  const bars = [42, 68, 54, 82, 76, 90, 65, 88, 72, 95, 84, 100]
  const months = ['Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep']
  return (
    <svg viewBox="0 0 480 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
      {/* Background */}
      <rect width="480" height="220" rx="16" fill="#0d1616" />
      {/* Grid */}
      {[0,1,2,3,4].map(i => (
        <line key={i} x1="40" y1={30 + i * 34} x2="460" y2={30 + i * 34} stroke="#1a2828" strokeWidth="0.8" strokeDasharray="4 4" />
      ))}
      {/* Bars */}
      {bars.map((h, i) => {
        const barH = (h / 100) * 136
        const x = 48 + i * 36
        return (
          <g key={i}>
            <rect x={x} y={166 - barH} width="20" height={barH} rx="4" fill={i === 10 || i === 11 ? '#c5f06a' : '#1e4040'} />
            {(i === 10 || i === 11) && (
              <rect x={x} y={166 - barH} width="20" height="4" rx="2" fill="#c5f06a" />
            )}
            <text x={x + 10} y="182" textAnchor="middle" fill="#2a4444" fontSize="7">{months[i]}</text>
          </g>
        )
      })}
      {/* Y axis labels */}
      {['100%','75%','50%','25%','0%'].map((l, i) => (
        <text key={i} x="35" y={34 + i * 34} textAnchor="end" fill="#2a4444" fontSize="7">{l}</text>
      ))}
      {/* Legend */}
      <rect x="280" y="196" width="10" height="10" rx="2" fill="#1e4040" />
      <text x="294" y="204" fill="#4a6b6b" fontSize="8">Previous months</text>
      <rect x="360" y="196" width="10" height="10" rx="2" fill="#c5f06a" />
      <text x="374" y="204" fill="#4a6b6b" fontSize="8">This period</text>
      {/* Title */}
      <text x="48" y="15" fill="#4a8080" fontSize="9" fontWeight="600">TOTAL REACH BY MONTH</text>
      {/* Trend badge */}
      <rect x="380" y="6" width="70" height="18" rx="9" fill="#003b3d" />
      <text x="415" y="18" textAnchor="middle" fill="#c5f06a" fontSize="8" fontWeight="bold">↑ 34% growth</text>
    </svg>
  )
}

// ─── Workflow SVG ─────────────────────────────────────────────────────────────
function WorkflowDiagram() {
  return (
    <svg viewBox="0 0 500 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-2xl mx-auto">
      {[
        { x: 60, label: 'Write', icon: '✏️' },
        { x: 190, label: 'Schedule', icon: '📅' },
        { x: 320, label: 'Approve', icon: '✓' },
        { x: 450, label: 'Publish', icon: '🚀' },
      ].map((step, i) => (
        <g key={i}>
          {i > 0 && (
            <>
              <line x1={step.x - 78} y1="40" x2={step.x - 22} y2="40" stroke="#1e3333" strokeWidth="1.5" strokeDasharray="4 3" />
              <polygon points={`${step.x - 22},36 ${step.x - 16},40 ${step.x - 22},44`} fill="#26bb85" />
            </>
          )}
          <circle cx={step.x} cy="40" r="22" fill="#0d1616" stroke="#1e3333" strokeWidth="1.5" />
          <circle cx={step.x} cy="40" r="22" fill={i === 3 ? '#003b3d' : 'transparent'} stroke={i === 3 ? '#c5f06a' : '#1e3333'} strokeWidth="1.5" />
          <text x={step.x} y="45" textAnchor="middle" fill={i === 3 ? '#c5f06a' : '#4a8080'} fontSize="14">{step.icon}</text>
          <text x={step.x} y="78" textAnchor="middle" fill="#4a8080" fontSize="9" fontWeight="600">{step.label}</text>
        </g>
      ))}
    </svg>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="bg-white min-h-screen font-sans overflow-x-hidden">
      <style>{`
        @keyframes fi1 { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-18px) rotate(1deg)} }
        @keyframes fi2 { 0%,100%{transform:translateY(0) rotate(1deg)} 50%{transform:translateY(-14px) rotate(-1.5deg)} }
        @keyframes fi3 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-22px) rotate(2deg)} }
        @keyframes fi4 { 0%,100%{transform:translateY(0) rotate(1.5deg)} 50%{transform:translateY(-12px) rotate(-1deg)} }
        @keyframes fi5 { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-16px) rotate(1.5deg)} }
        @keyframes fi6 { 0%,100%{transform:translateY(0) rotate(0.5deg)} 50%{transform:translateY(-20px) rotate(-0.5deg)} }
        @keyframes fi7 { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-10px) rotate(2deg)} }
        @keyframes fi8 { 0%,100%{transform:translateY(0) rotate(2deg)} 50%{transform:translateY(-15px) rotate(-2deg)} }
        @keyframes fi9 { 0%,100%{transform:translateY(0) rotate(-0.5deg)} 50%{transform:translateY(-19px) rotate(1deg)} }
        @keyframes fi10 { 0%,100%{transform:translateY(0) rotate(1deg)} 50%{transform:translateY(-13px) rotate(-1.5deg)} }
        @keyframes blobA { 0%,100%{transform:translate(0,0)scale(1)} 40%{transform:translate(50px,-30px)scale(1.07)} 70%{transform:translate(-20px,40px)scale(0.95)} }
        @keyframes blobB { 0%,100%{transform:translate(0,0)scale(1)} 35%{transform:translate(-40px,50px)scale(1.09)} 70%{transform:translate(60px,-25px)scale(0.93)} }
        @keyframes blobC { 0%,100%{transform:translate(0,0)scale(1)} 50%{transform:translate(-30px,-40px)scale(1.05)} }
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes ping-slow { 0%{transform:scale(1);opacity:0.8} 70%{transform:scale(1.7);opacity:0} 100%{transform:scale(1.7);opacity:0} }
        .fi1{animation:fi1 7s ease-in-out infinite}
        .fi2{animation:fi2 9s ease-in-out 1.2s infinite}
        .fi3{animation:fi3 8s ease-in-out 2.4s infinite}
        .fi4{animation:fi4 6.5s ease-in-out 0.8s infinite}
        .fi5{animation:fi5 10s ease-in-out 3s infinite}
        .fi6{animation:fi6 8.5s ease-in-out 1.8s infinite}
        .fi7{animation:fi7 7.5s ease-in-out 0.5s infinite}
        .fi8{animation:fi8 9.5s ease-in-out 4s infinite}
        .fi9{animation:fi9 8s ease-in-out 2s infinite}
        .fi10{animation:fi10 7s ease-in-out 3.5s infinite}
        .blob-a{animation:blobA 18s ease-in-out infinite}
        .blob-b{animation:blobB 22s ease-in-out 3s infinite}
        .blob-c{animation:blobC 16s ease-in-out 6s infinite}
        .marquee-track{animation:marquee 32s linear infinite}
        .gradient-text {
          background: linear-gradient(90deg, #c5f06a 0%, #4ade80 35%, #34d399 65%, #c5f06a 100%);
          background-size: 200% auto;
          animation: gradientShift 5s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .icon-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06);
          transition: transform 0.2s ease;
        }
        .glass {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .glass-light {
          background: rgba(255,255,255,0.07);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .card-hover { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.12); }
        .cta-primary {
          background: #c5f06a;
          box-shadow: 0 2px 16px rgba(197,240,106,0.3);
          transition: all 0.2s ease;
        }
        .cta-primary:hover { box-shadow: 0 6px 28px rgba(197,240,106,0.45); transform: translateY(-2px); }
        .ping-dot-wrap::before {
          content: ''; position: absolute; inset: -4px; border-radius: 9999px;
          background: #4ade80; animation: ping-slow 2.5s cubic-bezier(0,0,0.2,1) infinite;
        }
        .hero-glow {
          box-shadow: 0 0 0 1px rgba(197,240,106,0.12), 0 32px 80px rgba(197,240,106,0.10), 0 8px 32px rgba(38,187,133,0.08);
        }
        .nav-transparent {
          background: transparent;
          transition: background 0.3s ease, border-color 0.3s ease;
        }
      `}</style>

      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-white" style={{ minHeight: '94vh' }}>

        {/* Very subtle dot grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          opacity: 0.45,
        }} />

        {/* ─── Floating platform icon cards ─── */}

        {/* LEFT COLUMN */}
        {/* YouTube - large */}
        <div className="fi1 absolute icon-card hidden lg:flex" style={{ top: '12%', left: '4%', width: 64, height: 64, color: '#FF0000' }}>
          <YouTubeIcon size={30} />
        </div>
        {/* LinkedIn - medium */}
        <div className="fi2 absolute icon-card hidden md:flex" style={{ top: '38%', left: '2.5%', width: 54, height: 54, color: '#0A66C2' }}>
          <LinkedInIcon size={24} />
        </div>
        {/* WhatsApp - small */}
        <div className="fi3 absolute icon-card hidden lg:flex" style={{ top: '22%', left: '16%', width: 46, height: 46, color: '#25D366' }}>
          <WhatsAppIcon size={20} />
        </div>
        {/* Instagram - medium */}
        <div className="fi4 absolute icon-card hidden md:flex" style={{ top: '64%', left: '4%', width: 58, height: 58, color: '#E1306C' }}>
          <InstagramIcon size={26} />
        </div>
        {/* TikTok - no card, just icon */}
        <div className="fi5 absolute hidden lg:block" style={{ top: '78%', left: '18%', color: '#010101', opacity: 0.75 }}>
          <TikTokIcon size={38} />
        </div>

        {/* RIGHT COLUMN */}
        {/* Pinterest - large */}
        <div className="fi6 absolute icon-card hidden lg:flex" style={{ top: '10%', right: '4.5%', width: 64, height: 64, color: '#E60023' }}>
          <PinterestIcon size={28} />
        </div>
        {/* X - no card, big standalone */}
        <div className="fi7 absolute hidden md:block" style={{ top: '28%', right: '16%', color: '#0f172a', opacity: 0.8 }}>
          <XIcon size={46} />
        </div>
        {/* Threads - medium */}
        <div className="fi8 absolute icon-card hidden md:flex" style={{ top: '54%', right: '2.5%', width: 56, height: 56, color: '#1c1c1e' }}>
          <ThreadsIcon size={24} />
        </div>
        {/* Facebook - large */}
        <div className="fi9 absolute icon-card hidden lg:flex" style={{ top: '76%', right: '5%', width: 62, height: 62, color: '#1877F2' }}>
          <FacebookIcon size={28} />
        </div>
        {/* YouTube bottom right center */}
        <div className="fi10 absolute icon-card hidden lg:flex" style={{ top: '83%', left: '40%', width: 46, height: 46, color: '#FF0000' }}>
          <YouTubeIcon size={20} />
        </div>
        {/* Extra small floating icons for depth */}
        <div className="fi3 absolute icon-card hidden xl:flex" style={{ top: '48%', left: '14%', width: 40, height: 40, color: '#E1306C' }}>
          <InstagramIcon size={17} />
        </div>
        <div className="fi6 absolute icon-card hidden xl:flex" style={{ top: '43%', right: '14%', width: 40, height: 40, color: '#25D366' }}>
          <WhatsAppIcon size={17} />
        </div>

        {/* ── Center content ── */}
        <div className="relative flex flex-col items-center justify-center text-center px-6" style={{ minHeight: '94vh' }}>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white shadow-sm mb-8">
            <span className="relative flex h-2 w-2">
              <span className="ping-dot-wrap relative inline-flex rounded-full h-2 w-2 bg-green-400" />
            </span>
            <span className="text-xs font-semibold text-gray-600">The all-in-one social publishing platform</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#003b3d', color: '#c5f06a' }}>New</span>
          </div>

          {/* Headline */}
          <h1 className="text-6xl sm:text-7xl lg:text-[96px] font-black leading-[1.0] tracking-[-3px] mb-6 max-w-4xl" style={{ color: '#083a3d' }}>
            Your social media<br />
            <span className="gradient-text">workspace.</span>
          </h1>

          {/* Subtext */}
          <p className="text-xl text-gray-500 leading-relaxed mb-10 max-w-xl" style={{ fontFamily: 'var(--font-inter)' }}>
            Schedule, publish and track every post across Facebook, Instagram, LinkedIn, X and Threads — from one beautiful dashboard.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-10">
            <Link href="/sign-up"
              className="cta-primary inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm"
              style={{ color: '#001a0d' }}
            >
              Get started for free
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link href="/sign-in" className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors px-6 py-4">
              Sign in to your account →
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex -space-x-2">
              {['#26bb85','#60a5fa','#f472b6','#fb923c','#a78bfa'].map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${c}, ${c}99)`, color: '#fff', zIndex: 5 - i }}>
                  {['FA','MK','SR','JD','AL'][i]}
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">500+</span> teams already publishing smarter
              <span className="ml-2 inline-flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-3 h-3" fill="#f59e0b" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
                <span className="text-gray-400 text-xs ml-1">4.9</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof marquee ── */}
      <section className="py-10 bg-white border-b border-gray-100 overflow-hidden">
        <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">Trusted by teams at</p>
        <div className="relative overflow-hidden">
          <div className="flex marquee-track whitespace-nowrap gap-12">
            {[...Array(2)].map((_, rep) => (
              ['Agencies', 'E-commerce Brands', 'Media Companies', 'Startups', 'Marketing Teams', 'Content Creators', 'Digital Studios', 'PR Firms', 'SaaS Companies', 'Retail Chains'].map(name => (
                <span key={`${rep}-${name}`} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 px-6">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#26bb85' }} />
                  {name}
                </span>
              ))
            )).flat()}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #001a1a, #002828)' }}>
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle, #c5f06a 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <div className="relative max-w-5xl mx-auto px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#26bb85' }}>By the numbers</p>
          <h2 className="text-center text-3xl sm:text-4xl font-black text-white mb-16">Results that speak for themselves</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-4">
            <AnimatedStat value={50000} suffix="+" label="Posts Published" sublabel="across all platforms" />
            <AnimatedStat value={5} suffix="" prefix="" label="Platforms Supported" sublabel="with more coming soon" />
            <AnimatedStat value={34} suffix="%" label="Avg Reach Increase" sublabel="in first 90 days" />
            <AnimatedStat value={12} suffix="h" label="Saved Per Week" sublabel="per team member" />
          </div>
        </div>
      </section>

      {/* ── Features bento ── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#26bb85' }}>Everything your team needs</p>
            <h2 className="text-4xl sm:text-5xl font-black mb-4" style={{ color: '#083a3d' }}>Plan, approve and publish<br />without the chaos.</h2>
            <p className="text-gray-500 max-w-lg mx-auto text-base">One workspace for your content, conversations and results.</p>
          </div>

          {/* Top row: Calendar (large) + Composer */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">

            {/* Visual content calendar — spans 3 cols */}
            <div className="card-hover lg:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 pb-4">
                <div className="flex items-start gap-3 mb-1">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#e8faf3' }}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#26bb85" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Visual content calendar</h3>
                    <p className="text-gray-400 text-xs mt-0.5">See every campaign, deadline and channel in one clear view.</p>
                  </div>
                </div>
              </div>
              {/* Calendar UI */}
              <div className="mx-5 mb-5 rounded-xl border border-gray-100 overflow-hidden" style={{ background: '#fafafa' }}>
                {/* Calendar header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-700">April 2024</span>
                  <div className="flex gap-1">
                    {['Filter','Plan','List'].map((t, i) => (
                      <span key={t} className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: i === 0 ? '#26bb85' : '#f3f4f6', color: i === 0 ? '#fff' : '#9ca3af' }}>{t}</span>
                    ))}
                  </div>
                </div>
                {/* Day headers */}
                <div className="grid grid-cols-7 border-b border-gray-100">
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                    <div key={d} className="text-[9px] font-semibold text-gray-400 text-center py-1.5">{d}</div>
                  ))}
                </div>
                {/* Calendar rows */}
                {[
                  [null,1,2,3,4,5,6],
                  [7,8,9,10,11,12,13],
                  [14,15,16,17,18,19,20],
                  [21,22,23,24,25,26,27],
                ].map((week, wi) => (
                  <div key={wi} className="grid grid-cols-7 border-b border-gray-100 last:border-0">
                    {week.map((day, di) => {
                      const isToday = day === 15
                      const hasGreenBar = [2,9,22].includes(day as number)
                      const hasBlueBar = [5,12,19].includes(day as number)
                      const hasPinkBar = [8,17,24].includes(day as number)
                      const hasThumb = [10,16].includes(day as number)
                      return (
                        <div key={di} className="min-h-[52px] p-1 border-r border-gray-100 last:border-0" style={{ background: isToday ? '#f0fdf4' : 'transparent' }}>
                          {day && (
                            <>
                              <span className={`text-[9px] font-semibold block mb-0.5 ${isToday ? 'text-green-600' : 'text-gray-500'}`}>{day}</span>
                              {hasGreenBar && <div className="rounded text-[7px] font-semibold px-1 py-0.5 mb-0.5 truncate" style={{ background: '#dcfce7', color: '#16a34a' }}>● Instagram</div>}
                              {hasBlueBar && <div className="rounded text-[7px] font-semibold px-1 py-0.5 mb-0.5 truncate" style={{ background: '#dbeafe', color: '#2563eb' }}>● Facebook</div>}
                              {hasPinkBar && <div className="rounded text-[7px] font-semibold px-1 py-0.5 truncate" style={{ background: '#fce7f3', color: '#be185d' }}>● LinkedIn</div>}
                              {hasThumb && (
                                <div className="rounded overflow-hidden mt-0.5" style={{ height: 20, background: 'linear-gradient(135deg, #a3e635, #26bb85)' }}>
                                  <div className="w-full h-full flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-sm bg-white opacity-60" />
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Multi-platform composer — spans 2 cols */}
            <div className="card-hover lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 pb-3">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#e8faf3' }}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#26bb85" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Multi-platform composer</h3>
                    <p className="text-gray-400 text-xs mt-0.5">Create content once — tailor to platform, preview and schedule.</p>
                  </div>
                </div>
                {/* Platform icons row */}
                <div className="flex items-center gap-2 mb-3">
                  {[
                    { icon: <LinkedInIcon size={13} />, color: '#0A66C2', bg: '#dbeafe' },
                    { icon: <XIcon size={13} />, color: '#000', bg: '#f1f5f9' },
                    { icon: <FacebookIcon size={13} />, color: '#1877F2', bg: '#dbeafe' },
                    { icon: <TikTokIcon size={13} />, color: '#000', bg: '#f1f5f9' },
                    { icon: <InstagramIcon size={13} />, color: '#E1306C', bg: '#fce7f3' },
                    { icon: <ThreadsIcon size={13} />, color: '#000', bg: '#f1f5f9' },
                  ].map((p, i) => (
                    <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: p.bg, color: p.color }}>{p.icon}</div>
                  ))}
                </div>
                {/* Caption text area */}
                <div className="rounded-xl border border-gray-100 p-3 mb-3" style={{ background: '#fafafa' }}>
                  <p className="text-[11px] text-gray-600 leading-relaxed">Good content builds stronger brands. Looking behind the scenes look at our creative process.</p>
                </div>
                {/* Image preview */}
                <div className="rounded-xl overflow-hidden mb-3 relative" style={{ height: 90, background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 50%, #6ee7b7 100%)' }}>
                  <div className="absolute inset-0 flex items-center justify-center gap-3">
                    {/* Leaf / plant icon */}
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.6)' }}>
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#26bb85" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.5)' }}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" /></svg>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.8)', color: '#374151' }}>+ Add media</div>
                </div>
              </div>
              {/* Schedule bar */}
              <div className="mt-auto border-t border-gray-100 px-5 py-3 flex items-center justify-between" style={{ background: '#fafafa' }}>
                <div>
                  <p className="text-[9px] text-gray-400 font-medium">Scheduled for</p>
                  <p className="text-[11px] font-bold text-gray-700">Apr 11, 2024 · 09:00 AM</p>
                </div>
                <button className="text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1.5" style={{ background: '#26bb85', color: '#fff' }}>
                  Schedule post
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom row: 3 equal cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Approval workflows */}
            <div className="card-hover bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#f3e8ff' }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#9333ea" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Approval workflows</h3>
                  <p className="text-gray-400 text-xs mt-0.5">Get the right sign-offs before anything goes live.</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {[
                  { initials: 'SA', name: 'Sarah Ahmed', role: 'Content Lead', status: 'Approved', color: '#16a34a', bg: '#dcfce7' },
                  { initials: 'MK', name: 'Marcus King', role: 'Brand Manager', status: 'Approved', color: '#16a34a', bg: '#dcfce7' },
                  { initials: 'JD', name: 'Final approval', role: 'Director', status: 'Pending', color: '#d97706', bg: '#fef3c7' },
                ].map((a) => (
                  <div key={a.name} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #26bb85, #003b3d)' }}>{a.initials}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{a.name}</p>
                      <p className="text-[10px] text-gray-400">{a.role}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: a.bg, color: a.color }}>{a.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Media library */}
            <div className="card-hover bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#fef3c7' }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#d97706" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Media library</h3>
                  <p className="text-gray-400 text-xs mt-0.5">Keep assets organised, searchable and ready for reuse.</p>
                </div>
              </div>
              {/* Search bar */}
              <div className="flex items-center gap-2 border border-gray-100 rounded-lg px-3 py-2 mb-3" style={{ background: '#fafafa' }}>
                <svg className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/></svg>
                <span className="text-[11px] text-gray-300">Search assets...</span>
                <span className="ml-auto text-[10px] text-gray-400 font-medium">All types</span>
              </div>
              {/* Photo grid */}
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { bg: 'linear-gradient(135deg,#a7f3d0,#6ee7b7)', icon: '🌿' },
                  { bg: 'linear-gradient(135deg,#fde68a,#fca5a5)', icon: '☕' },
                  { bg: 'linear-gradient(135deg,#bfdbfe,#c4b5fd)', icon: '📸' },
                  { bg: 'linear-gradient(135deg,#fed7aa,#fca5a5)', icon: '🌺' },
                  { bg: 'linear-gradient(135deg,#d1fae5,#a7f3d0)', icon: '🪴' },
                  { bg: 'linear-gradient(135deg,#e0e7ff,#c7d2fe)', icon: '✨' },
                ].map((item, i) => (
                  <div key={i} className="aspect-square rounded-lg flex items-center justify-center text-lg" style={{ background: item.bg }}>{item.icon}</div>
                ))}
              </div>
            </div>

            {/* Performance analytics */}
            <div className="card-hover bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#dbeafe' }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900">Performance analytics</h3>
                  <p className="text-gray-400 text-xs mt-0.5">Measure what matters across every channel.</p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-1 rounded-full flex-shrink-0" style={{ background: '#f3f4f6', color: '#6b7280' }}>Last 30 days</span>
              </div>
              {/* Stats row */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: 'Total reach', value: '125.6K', delta: '↑4.1%', up: true },
                  { label: 'Clicks', value: '34%', delta: '↑1%', up: true },
                  { label: 'Engagement', value: '3.8K', delta: '↑8%', up: true },
                  { label: 'Scalability', value: '98', delta: '+12', up: true },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-[9px] text-gray-400 mb-0.5">{s.label}</p>
                    <p className="text-xs font-black text-gray-800">{s.value}</p>
                    <p className="text-[9px] font-semibold" style={{ color: '#16a34a' }}>{s.delta}</p>
                  </div>
                ))}
              </div>
              {/* Line chart SVG */}
              <div className="rounded-xl overflow-hidden" style={{ background: '#f8faff' }}>
                <svg viewBox="0 0 220 70" className="w-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#26bb85" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#26bb85" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,55 C20,50 35,45 50,38 C65,31 75,42 90,35 C105,28 115,20 130,18 C145,16 160,22 175,15 C190,8 205,10 220,8" stroke="#26bb85" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <path d="M0,55 C20,50 35,45 50,38 C65,31 75,42 90,35 C105,28 115,20 130,18 C145,16 160,22 175,15 C190,8 205,10 220,8 L220,70 L0,70 Z" fill="url(#chartGrad)" />
                  {/* Dot at peak */}
                  <circle cx="175" cy="15" r="3" fill="#26bb85" />
                  <circle cx="175" cy="15" r="5" fill="#26bb85" fillOpacity="0.2" />
                </svg>
              </div>
              {/* Platform breakdown */}
              <div className="flex items-center gap-3 mt-3">
                {[
                  { label: 'LinkedIn', color: '#0A66C2', pct: 45 },
                  { label: 'Facebook', color: '#1877F2', pct: 30 },
                  { label: 'Instagram', color: '#E1306C', pct: 25 },
                ].map((p) => (
                  <div key={p.label} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
                    <span className="text-[9px] text-gray-500">{p.label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Platforms ── */}
      <section id="platforms" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#26bb85' }}>Platform support</p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">Every platform.<br />One dashboard.</h2>
            <p className="text-gray-500 max-w-lg mx-auto">Connect via OAuth — we handle token refresh automatically so you never get disconnected mid-campaign.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { icon: <FacebookIcon size={32} />, color: '#1877F2', bg: 'linear-gradient(135deg, #1877F208, #1877F215)', name: 'Facebook', desc: 'Pages, posts & scheduling', features: ['Business pages', 'Photo & video', 'Scheduled posts'] },
              { icon: <InstagramIcon size={32} />, color: '#E1306C', bg: 'linear-gradient(135deg, #E1306C08, #fd1d1d15)', name: 'Instagram', desc: 'Business profiles & content', features: ['Business profiles', 'Photos & carousels', 'Reels support'] },
              { icon: <LinkedInIcon size={32} />, color: '#0A66C2', bg: 'linear-gradient(135deg, #0A66C208, #0A66C215)', name: 'LinkedIn', desc: 'Profiles & company pages', features: ['Personal profiles', 'Company pages', 'Articles & posts'] },
              { icon: <XIcon size={32} />, color: '#000', bg: 'linear-gradient(135deg, #00000008, #00000015)', name: 'X (Twitter)', desc: 'Tweets & threads', features: ['Tweet composer', 'Thread support', 'Real-time posting'] },
              { icon: <ThreadsIcon size={32} />, color: '#1c1c1e', bg: 'linear-gradient(135deg, #1c1c1e08, #1c1c1e15)', name: 'Threads', desc: 'Meta Threads content', features: ['Text posts', 'Image threads', 'Conversation posts'] },
            ].map(p => (
              <div key={p.name} className="card-hover rounded-3xl border border-gray-100 p-6 group cursor-default" style={{ background: p.bg }}>
                <div className="mb-5" style={{ color: p.color }}>
                  {p.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{p.name}</h3>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">{p.desc}</p>
                <ul className="space-y-1.5">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-1.5 text-xs text-gray-500">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="#26bb85" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="results" className="py-24" style={{ background: 'linear-gradient(160deg, #001a1a, #002828)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#26bb85' }}>Simple workflow</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">From idea to published<br />in minutes</h2>
          </div>
          <WorkflowDiagram />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16">
            {[
              { step: '01', title: 'Connect accounts', desc: 'Authorize with OAuth once. We pull all your pages and profiles automatically.' },
              { step: '02', title: 'Compose content', desc: 'Write captions, attach media, preview per platform — all from one editor.' },
              { step: '03', title: 'Set for approval', desc: 'Route through your team\'s approval workflow before anything goes public.' },
              { step: '04', title: 'Publish & track', desc: 'Posts go live on schedule. Analytics show what to double down on next week.' },
            ].map(s => (
              <div key={s.step} className="glass rounded-2xl p-6">
                <div className="text-4xl font-black mb-3" style={{ color: '#c5f06a20' }}>{s.step}</div>
                <h3 className="text-sm font-bold text-white mb-2">{s.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Analytics showcase ── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#26bb85' }}>Real results</p>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">Watch your reach<br />climb every month</h2>
              <p className="text-gray-500 text-base leading-relaxed mb-8">
                Teams using Social Manager consistently see 30–40% growth in organic reach within the first quarter. Consistent scheduling, better timing, and cross-platform coverage drive the numbers.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Avg engagement lift', value: '+41%', icon: '↑' },
                  { label: 'Time saved weekly', value: '12hrs', icon: '⏱' },
                  { label: 'Posting consistency', value: '98%', icon: '✓' },
                  { label: 'Accounts per team', value: '15+', icon: '🔗' },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="text-2xl font-black mb-1" style={{ color: '#003b3d' }}>{s.value}</div>
                    <div className="text-xs text-gray-500 font-medium">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gray-900 rounded-3xl p-6 shadow-2xl">
                <AnalyticsChart />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#26bb85' }}>Built for every team</p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900">Who uses Social Manager?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                emoji: '🏢',
                title: 'Agencies',
                subtitle: 'Manage all clients in one place',
                desc: 'Separate workspaces per client. Role-based access. Approval workflows. Deliver professional results without giving clients platform credentials.',
                items: ['Client workspaces', 'Role-based permissions', 'Approval workflows', 'Audit logs per client'],
                accent: '#003b3d',
              },
              {
                emoji: '🚀',
                title: 'Brand Teams',
                subtitle: 'One login for all your pages',
                desc: 'Manage every Facebook Page, Instagram profile, and LinkedIn company page from a single dashboard. No more platform-hopping.',
                items: ['All pages unified', 'Team collaboration', 'Content calendar', 'Cross-platform reach'],
                accent: '#7c3aed',
              },
              {
                emoji: '⚡',
                title: 'Freelancers',
                subtitle: 'Scale without the chaos',
                desc: 'Handle multiple clients confidently. Isolated workspaces mean client content never crosses wires. Onboard new clients in minutes.',
                items: ['Isolated workspaces', 'Clean account separation', 'Easy client onboarding', 'Predictable pricing'],
                accent: '#0a66c2',
              },
            ].map(w => (
              <div key={w.title} className="card-hover rounded-3xl border border-gray-100 p-8 hover:border-gray-200">
                <div className="text-4xl mb-5">{w.emoji}</div>
                <div className="w-12 h-1 rounded-full mb-4" style={{ backgroundColor: w.accent }} />
                <h3 className="text-2xl font-black text-gray-900 mb-1">{w.title}</h3>
                <p className="text-sm font-semibold mb-4" style={{ color: w.accent }}>{w.subtitle}</p>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">{w.desc}</p>
                <ul className="space-y-2.5">
                  {w.items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="#26bb85" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#26bb85' }}>Pricing</p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">Simple, honest pricing</h2>
            <p className="text-gray-500">No per-seat traps. No hidden fees. Cancel anytime.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Starter', price: 'Free', period: 'forever',
                desc: 'For individuals getting started.',
                features: ['1 workspace', '3 social accounts', '30 scheduled posts/mo', 'Basic analytics', '500MB media library'],
                cta: 'Get started free', href: '/sign-up', highlight: false,
              },
              {
                name: 'Pro', price: '$29', period: '/month',
                desc: 'For growing teams and agencies.',
                features: ['5 workspaces', 'Unlimited accounts', 'Unlimited posts', 'Approval workflows', 'Advanced analytics', '10GB media library', 'Priority support'],
                cta: 'Start Pro free trial', href: '/sign-up', highlight: true,
              },
              {
                name: 'Agency', price: '$79', period: '/month',
                desc: 'For agencies managing clients at scale.',
                features: ['Unlimited workspaces', 'Unlimited accounts', 'Unlimited posts', 'Client portals', 'White-label options', 'Audit logs', '100GB media library', 'Dedicated support'],
                cta: 'Contact us', href: '/sign-up', highlight: false,
              },
            ].map(plan => (
              <div
                key={plan.name}
                className={`card-hover rounded-3xl p-8 border transition-all ${plan.highlight ? 'scale-[1.03]' : 'border-gray-100 bg-white'}`}
                style={plan.highlight ? { background: 'linear-gradient(160deg, #001a1a, #003b3d)', border: '1px solid #26bb8440' } : {}}
              >
                {plan.highlight && (
                  <div className="inline-block text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-5" style={{ background: '#c5f06a', color: '#002020' }}>
                    Most popular
                  </div>
                )}
                <h3 className={`font-black text-xl mb-1 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                <p className={`text-xs mb-6 ${plan.highlight ? 'text-gray-400' : 'text-gray-500'}`}>{plan.desc}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className={`text-5xl font-black ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                  <span className={`text-sm ${plan.highlight ? 'text-gray-500' : 'text-gray-400'}`}>{plan.period}</span>
                </div>
                <Link href={plan.href}
                  className="block text-center py-3 rounded-2xl text-sm font-bold transition-all mb-7 hover:opacity-90 hover:-translate-y-0.5"
                  style={plan.highlight
                    ? { background: 'linear-gradient(135deg, #c5f06a, #9ae048)', color: '#002020' }
                    : { background: '#003b3d12', color: '#003b3d' }
                  }
                >
                  {plan.cta}
                </Link>
                <ul className="space-y-3">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke={plan.highlight ? '#c5f06a' : '#26bb85'} strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className={plan.highlight ? 'text-gray-300' : 'text-gray-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #001414, #002020, #003030)' }}>
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle, #c5f06a 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #c5f06a, transparent)' }} />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-5xl sm:text-6xl font-black text-white mb-6 leading-tight">
            Your competitors are<br />
            <span className="gradient-text">scheduling right now.</span>
          </h2>
          <p className="text-gray-400 mb-10 text-lg max-w-xl mx-auto leading-relaxed">
            Don&apos;t let inconsistency cost you reach. Start publishing smarter today — it&apos;s free to begin.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up"
              className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl font-black text-base transition-all hover:opacity-90 hover:-translate-y-1 hover:shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #c5f06a, #9ae048)', color: '#002020', boxShadow: '0 12px 40px #c5f06a40' }}
            >
              Create free account
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
          <p className="text-xs text-gray-600 mt-5">No credit card · Free plan available · Cancel anytime</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ backgroundColor: '#010c0c' }} className="py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #003b3d, #26bb85)' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c5f06a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13" /><path d="M22 2L15 22l-4-9-9-4 20-7z" />
                  </svg>
                </div>
                <span className="font-black text-white">Social Manager</span>
              </div>
              <p className="text-xs text-gray-600">by CodeInk Studio · social.codeinkstudio.com</p>
              <p className="text-xs text-gray-700 mt-1">The all-in-one social publishing platform.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-16 gap-y-3 text-sm">
              {[
                { label: 'Sign in', href: '/sign-in' },
                { label: 'Sign up', href: '/sign-up' },
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Data Deletion', href: '/data-deletion' },
              ].map(l => (
                <Link key={l.label} href={l.href} className="text-gray-600 hover:text-gray-300 transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ borderColor: '#ffffff08' }}>
            <p className="text-xs text-gray-700">© 2026 CodeInk Studio. All rights reserved.</p>
            <div className="flex items-center gap-3">
              {[
                { icon: <FacebookIcon size={13} />, color: '#1877F2' },
                { icon: <InstagramIcon size={13} />, color: '#E1306C' },
                { icon: <LinkedInIcon size={13} />, color: '#0A66C2' },
                { icon: <XIcon size={13} />, color: '#888' },
              ].map((s, i) => (
                <div key={i} className="w-7 h-7 rounded-lg flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity cursor-pointer" style={{ color: s.color, backgroundColor: `${s.color}15` } as React.CSSProperties}>
                  {s.icon}
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

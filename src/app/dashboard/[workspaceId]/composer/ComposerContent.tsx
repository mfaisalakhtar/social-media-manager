'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useWorkspaceId } from '@/contexts/WorkspaceContext'
import { cn } from '@/lib/utils'
import { ConnectModal } from '@/components/ConnectModal'
import { useComposer } from '@/contexts/ComposerContext'

type Destination = { id: string; platform: string; display_name: string; username: string | null; profile_image_url: string | null }
type Action = 'draft' | 'submit' | 'publish' | 'schedule'
type MediaFile = { file: File; previewUrl: string }

// Avatar with graceful fallback — routes through server proxy to avoid expired/CORS-blocked CDN URLs
function Avatar({ src, name, className, style }: { src: string | null; name: string; className?: string; style?: React.CSSProperties }) {
  const [failed, setFailed] = useState(false)
  const proxied = src ? `/api/avatar-proxy?url=${encodeURIComponent(src)}` : null
  if (proxied && !failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={proxied} alt={name} className={className} style={style} onError={() => setFailed(true)} />
  }
  return (
    <div className={`${className} flex items-center justify-center text-white text-[11px] font-bold`} style={style}>
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

const PLATFORM_META: Record<string, { label: string; color: string; maxChars: number; hint: string }> = {
  facebook:  { label: 'Facebook',    color: '#1877F2', maxChars: 63000, hint: 'Conversational & storytelling. 2–3 hashtags. Links work.' },
  instagram: { label: 'Instagram',   color: '#E1306C', maxChars: 2200,  hint: '10–20 hashtags at end. Strong hook. No clickable links.' },
  linkedin:  { label: 'LinkedIn',    color: '#0A66C2', maxChars: 3000,  hint: 'Professional insight. 3–5 hashtags. No slang.' },
  x:         { label: 'X (Twitter)', color: '#000000', maxChars: 280,   hint: 'Under 280 chars. Punchy. 1–2 hashtags max.' },
  threads:   { label: 'Threads',     color: '#1c1c1e', maxChars: 500,   hint: 'Casual & authentic. Under 500 chars.' },
}

const IMG_SPECS: Record<string, string> = {
  facebook:  '1200×630 · ratio 1.91:1 · max 4 MB',
  instagram: '1080×1080 · ratio 1:1 or 4:5 · max 8 MB',
  linkedin:  '1200×627 · ratio 1.91:1 · max 5 MB',
  x:         '1200×675 · ratio 16:9 · max 5 MB',
  threads:   '1080×1080 · ratio 1:1 · max 8 MB',
}

// ─── Icons ──────────────────────────────────────────────────────────────────
function PlatformIcon({ p, size = 15, white }: { p: string; size?: number; white?: boolean }) {
  const fill = white ? 'white' : 'currentColor'
  if (p === 'facebook')  return <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}><path d="M24 12.073C24 5.406 18.627 0 12 0S0 5.406 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
  if (p === 'instagram') return <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
  if (p === 'linkedin')  return <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
  if (p === 'x')         return <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  if (p === 'threads')   return <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.858-6.43 2.52-8.482C5.84 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.353 1.33-3.183.942-.847 2.273-1.336 3.749-1.397.544-.023 1.077-.011 1.598.033-.024-.293-.063-.571-.119-.833-.238-1.116-.81-1.717-1.728-1.788-.704-.055-1.356.123-1.883.5-.39.277-.675.66-.833 1.109l-1.96-.579c.248-.72.64-1.355 1.164-1.883.803-.803 1.878-1.271 3.117-1.391 2.21-.208 3.889.77 4.572 2.663.25.686.378 1.464.388 2.335.106.057.21.116.31.178 1.152.698 1.97 1.7 2.368 2.894.548 1.645.43 4.054-1.716 6.134-1.817 1.783-4.045 2.631-7.217 2.65z"/></svg>
  return null
}

// ─── Media upload zone ───────────────────────────────────────────────────────
function MediaZone({ files, onAdd, onRemove, compact }: {
  files: MediaFile[]; onAdd: (m: MediaFile) => void; onRemove: (i: number) => void; compact?: boolean
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)
  const pick = (fl: FileList | null) => {
    Array.from(fl ?? []).forEach(f => {
      if (f.type.startsWith('image/') || f.type.startsWith('video/'))
        onAdd({ file: f, previewUrl: URL.createObjectURL(f) })
    })
  }
  return (
    <div className={cn('flex gap-2 flex-wrap', compact ? 'mt-1' : 'mt-2')}>
      {files.map((f, i) => (
        <div key={i} className={cn('relative rounded-xl overflow-hidden border border-gray-200 group shrink-0', compact ? 'w-16 h-16' : 'w-24 h-24')}>
          {f.file.type.startsWith('video/')
            ? <video src={f.previewUrl} className="w-full h-full object-cover" muted />
            /* eslint-disable-next-line @next/next/no-img-element */
            : <img src={f.previewUrl} alt="" className="w-full h-full object-cover" />
          }
          <button onClick={() => onRemove(i)}
            className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
        </div>
      ))}
      <div
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files) }}
        onClick={() => ref.current?.click()}
        className={cn(
          'rounded-xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center transition-all shrink-0',
          compact ? 'w-16 h-16 gap-0.5' : 'w-24 h-24 gap-1',
          drag ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100'
        )}>
        <svg className={cn('text-gray-300', compact ? 'w-5 h-5' : 'w-6 h-6')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        {!compact && <span className="text-[10px] text-gray-400 text-center leading-tight">Drag & drop<br/>or select</span>}
      </div>
      <input ref={ref} type="file" accept="image/*,video/*" multiple className="hidden" onChange={e => pick(e.target.files)} />
    </div>
  )
}

// ─── Platform preview cards ──────────────────────────────────────────────────
function PreviewCard({ dest, text, media, link }: { dest: Destination; text: string; media: MediaFile[]; link: string }) {
  const m = PLATFORM_META[dest.platform]
  if (!m) return null

  // Renders uploaded media — handles video, single image, and multi-image grid (Facebook-style)
  const MediaPreview = ({ files, square }: { files: MediaFile[]; square?: boolean }) => {
    if (!files.length) return null
    const first = files[0]
    if (first.file.type.startsWith('video/')) {
      return <video src={first.previewUrl} className="w-full" controls />
    }
    if (files.length === 1) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={first.previewUrl} alt="" className={square ? 'w-full aspect-square object-cover' : 'w-full'} />
    }
    if (files.length === 2) {
      return (
        <div className="grid grid-cols-2 gap-0.5">
          {files.map((f, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={f.previewUrl} alt="" className="w-full aspect-square object-cover" />
          ))}
        </div>
      )
    }
    if (files.length === 3) {
      return (
        <div className="flex gap-0.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={files[0].previewUrl} alt="" className="w-2/3 object-cover" style={{ aspectRatio: '1/1' }} />
          <div className="flex flex-col gap-0.5 w-1/3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={files[1].previewUrl} alt="" className="flex-1 w-full object-cover" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={files[2].previewUrl} alt="" className="flex-1 w-full object-cover" />
          </div>
        </div>
      )
    }
    // 4+ images — 2×2 grid with overflow count
    return (
      <div className="grid grid-cols-2 gap-0.5">
        {files.slice(0, 3).map((f, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={f.previewUrl} alt="" className="w-full aspect-square object-cover" />
        ))}
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={files[3].previewUrl} alt="" className="w-full aspect-square object-cover" />
          {files.length > 4 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-lg font-bold">
              +{files.length - 4}
            </div>
          )}
        </div>
      </div>
    )
  }

  const avatarClass = "w-9 h-9 rounded-full shrink-0 object-cover"
  const header = (
    <div className="flex items-center gap-2 px-3 pt-3 pb-2">
      <Avatar src={dest.profile_image_url} name={dest.display_name} className={avatarClass} style={{ backgroundColor: m.color }} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-gray-900 truncate">{dest.display_name}</p>
        <p className="text-[11px] text-gray-400">Just now</p>
      </div>
    </div>
  )

  const isEmpty = !text && !media.length && !link
  const body = (
    <>
      {isEmpty
        ? <p className="px-3 pb-3 text-[12px] text-gray-300 italic">Write something to see preview…</p>
        : <>
            {text && <p className="px-3 pb-2 text-[13px] text-gray-800 whitespace-pre-wrap leading-snug line-clamp-6">{text}</p>}
            {media.length > 0 && <MediaPreview files={media} />}
            {!media.length && link && (
              <div className="mx-3 mb-2 rounded-lg border border-gray-200 px-3 py-2 bg-gray-50">
                <p className="text-[11px] text-blue-500 truncate">{link}</p>
              </div>
            )}
          </>
      }
    </>
  )

  if (dest.platform === 'instagram') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2.5">
          <Avatar src={dest.profile_image_url} name={dest.display_name}
            className="w-8 h-8 rounded-full object-cover shrink-0"
            style={{ background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', outline: '2px solid #bc1888', outlineOffset: '1px' }} />
          <p className="text-[13px] font-semibold text-gray-900 flex-1 truncate">{dest.display_name}</p>
          <span className="text-gray-300">···</span>
        </div>
        {media.length > 0
          ? <MediaPreview files={media} square />
          : <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
        }
        <div className="px-3 py-2 text-lg flex gap-3">❤️ 💬 ↗ <span className="ml-auto">🔖</span></div>
        {(text || !media.length) && <p className="px-3 pb-3 text-[12px] text-gray-700 line-clamp-3">
          {text
            ? <><span className="font-semibold">{dest.display_name} </span>{text}</>
            : <span className="text-gray-300 italic">Write something to see preview…</span>
          }
        </p>}
      </div>
    )
  }

  if (dest.platform === 'x') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex gap-2.5 px-3 pt-3 pb-3">
          <Avatar src={dest.profile_image_url} name={dest.display_name} className="w-9 h-9 rounded-full shrink-0" style={{ backgroundColor: '#000' }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[13px] font-bold text-gray-900">{dest.display_name}</span>
              <span className="text-[12px] text-gray-400">@{dest.username ?? dest.display_name.toLowerCase().replace(/\s/g,'')}</span>
            </div>
            {text && <p className="mt-0.5 text-[13px] text-gray-800 whitespace-pre-wrap leading-snug line-clamp-6">{text}</p>}
            {media.length > 0 && (
              <div className="mt-2 rounded-xl overflow-hidden">
                <MediaPreview files={media} />
              </div>
            )}
            <div className="flex gap-5 mt-2 text-gray-400 text-sm">
              {['💬','🔁','♡','📊','↗'].map(i => <button key={i} className="hover:text-blue-500">{i}</button>)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (dest.platform === 'linkedin') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {header}{body}
        <div className="flex border-t border-gray-100 text-[11px] text-gray-500 divide-x divide-gray-100">
          {['👍 Like','💬 Comment','🔁 Repost','↗ Send'].map(a => (
            <button key={a} className="flex-1 py-2 text-center hover:bg-gray-50">{a}</button>
          ))}
        </div>
      </div>
    )
  }

  // Facebook / Threads / default
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {header}{body}
      <div className="flex border-t border-gray-100 text-[12px] text-gray-500 divide-x divide-gray-100">
        {['👍 Like','💬 Comment','↗ Share'].map(a => (
          <button key={a} className="flex-1 py-2 text-center hover:bg-gray-50">{a}</button>
        ))}
      </div>
    </div>
  )
}

// ─── Per-platform row (customize mode) ──────────────────────────────────────
function PlatformRow({ dest, text, onChange, media, onAddMedia, onRemoveMedia, focused, onFocus }: {
  dest: Destination
  text: string
  onChange: (v: string) => void
  media: MediaFile[]
  onAddMedia: (m: MediaFile) => void
  onRemoveMedia: (i: number) => void
  focused: boolean
  onFocus: () => void
}) {
  const m = PLATFORM_META[dest.platform]
  const chars = [...text].length
  const over = chars > (m?.maxChars ?? 9999)

  return (
    <div
      onClick={onFocus}
      className={cn(
        'rounded-xl border transition-all cursor-text',
        focused ? 'border-gray-300 shadow-sm ring-1 ring-gray-200' : 'border-gray-200 hover:border-gray-300'
      )}>
      {/* Row header */}
      <div className="flex items-center gap-2.5 px-3 pt-3 pb-1">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0"
          style={{ backgroundColor: m?.color ?? '#6b7280' }}>
          <PlatformIcon p={dest.platform} size={14} white />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-gray-700 truncate">{dest.display_name}</p>
          <p className="text-[10px] text-gray-400">{m?.label}</p>
        </div>
        <span className={cn('text-[11px] font-medium tabular-nums', over ? 'text-red-500' : 'text-gray-400')}>
          {chars}/{(m?.maxChars ?? 0) >= 10000 ? '∞' : m?.maxChars}
        </span>
      </div>

      {/* Textarea */}
      <textarea
        value={text}
        onChange={e => onChange(e.target.value)}
        placeholder={`Write for ${m?.label ?? 'this platform'}…`}
        rows={3}
        style={{ color: '#1f2937' }}
        className="w-full px-3 py-2 text-[14px] placeholder-gray-300 resize-none focus:outline-none bg-transparent leading-relaxed"
      />

      {/* Hint */}
      {focused && m?.hint && (
        <p className="px-3 pb-1 text-[10px] text-gray-400">{m.hint}</p>
      )}
      {focused && IMG_SPECS[dest.platform] && (
        <p className="px-3 pb-1 text-[10px] text-blue-400">
          <span className="font-medium">Image:</span> {IMG_SPECS[dest.platform]}
        </p>
      )}

      {/* Media row */}
      <div className="px-3 pb-3">
        <MediaZone files={media} onAdd={onAddMedia} onRemove={onRemoveMedia} compact />
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
export function ComposerContent({ isModal = false, onClose, postId: postIdProp }: { isModal?: boolean; onClose?: () => void; postId?: string } = {}) {
  const workspaceId = useWorkspaceId()
  const searchParams = useSearchParams()
  const editPostId = postIdProp ?? searchParams.get('postId')

  const [destinations, setDestinations] = useState<Destination[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [globalText, setGlobalText] = useState('')
  const [platformText, setPlatformText] = useState<Record<string, string>>({})  // AI adapt: keyed by platform
  const [destText, setDestText] = useState<Record<string, string>>({})          // manual edits: keyed by dest.id
  const [globalMedia, setGlobalMedia] = useState<MediaFile[]>([])
  const [platformMedia, setPlatformMedia] = useState<Record<string, MediaFile[]>>({})
  const [destMedia, setDestMedia] = useState<Record<string, MediaFile[]>>({})   // per-dest media: keyed by dest.id
  const [existingMediaUrls, setExistingMediaUrls] = useState<string[]>([])     // already-uploaded URLs from saved post

  const [activeDestId, setActiveDestId] = useState<string | null>(null)  // null = global editor

  const [showConnect, setShowConnect] = useState(false)
  const [adapting, setAdapting] = useState(false)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(!!editPostId)
  const [showScheduler, setShowScheduler] = useState(false)
  const [scheduledAt, setScheduledAt] = useState('')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null)
  const [successPopup, setSuccessPopup] = useState<{ action: string } | null>(null)

  const showToast = useCallback((ok: boolean, text: string) => {
    if (!ok) { setToast({ ok, text }); setTimeout(() => setToast(null), 4000) }
  }, [])

  // Auto-save draft when modal is closed without explicitly saving
  // Only applies to new posts (not edits) with content
  const { _registerAutoSave, initialDate } = useComposer()

  const autoSaveDraft = useCallback(async () => {
    // Skip: editing existing post, no content, or already saved/published
    if (editPostId || !globalText.trim() || !selectedIds.length || successPopup) return
    try {
      await fetch(`/api/workspaces/${workspaceId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          common_caption: globalText,
          destination_ids: selectedIds,
          action: 'draft',
        }),
      })
    } catch { /* silent — best effort */ }
  }, [editPostId, globalText, selectedIds, successPopup, workspaceId])

  useEffect(() => {
    _registerAutoSave(autoSaveDraft)
  }, [autoSaveDraft, _registerAutoSave])

  async function loadDests() {
    const d = await fetch(`/api/workspaces/${workspaceId}/destinations?status=active`).then(r => r.json())
    const dests: Destination[] = d.data ?? []
    setDestinations(dests)
    // In edit mode we'll set selectedIds after loading the post
    if (!editPostId) setSelectedIds(dests.map(x => x.id))
    return dests
  }

  useEffect(() => {
    async function init() {
      if (!editPostId) {
        await loadDests()
        // Pre-fill date if opened from calendar day click — only for future dates
        if (initialDate) {
          const today = new Date(); today.setHours(0, 0, 0, 0)
          if (initialDate >= today) {
            const pad = (n: number) => String(n).padStart(2, '0')
            const d = initialDate
            setScheduledAt(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T09:00`)
            setShowScheduler(true)
          }
        }
        return
      }

      // Fetch destinations and post data in parallel
      try {
        const [dests, postRes] = await Promise.all([
          fetch(`/api/workspaces/${workspaceId}/destinations?status=active`).then(r => r.json()),
          fetch(`/api/workspaces/${workspaceId}/posts/${editPostId}`),
        ])
        const destList: Destination[] = dests.data ?? []
        setDestinations(destList)

        const { data: post } = await postRes.json()
        if (!post) { setLoading(false); return }

        setGlobalText(post.common_caption ?? '')

        // Pre-select destinations that have variations in this post
        const variationDestIds: string[] = (post.smm_post_variations ?? []).map(
          (v: { social_destination_id: string }) => v.social_destination_id
        )
        const validDestIds = destList.map(d => d.id)
        const toSelect = variationDestIds.filter(id => validDestIds.includes(id))
        setSelectedIds(toSelect.length > 0 ? toSelect : destList.map(d => d.id))

        // Populate per-destination caption overrides
        const overrides: Record<string, string> = {}
        for (const v of (post.smm_post_variations ?? [])) {
          if (v.caption && v.caption !== post.common_caption) {
            overrides[v.social_destination_id] = v.caption
          }
        }
        if (Object.keys(overrides).length > 0) setDestText(overrides)

        // Restore previously uploaded media URLs
        if (post.media_urls?.length) {
          setExistingMediaUrls(post.media_urls)
        }

        // Restore scheduled time if applicable
        if (post.scheduled_at_utc) {
          const d = new Date(post.scheduled_at_utc)
          const pad = (n: number) => String(n).padStart(2, '0')
          setScheduledAt(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`)
          setShowScheduler(true)
        }
      } catch {
        showToast(false, 'Could not load post data.')
      } finally {
        setLoading(false)
      }
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, editPostId, initialDate])

  const selected = destinations.filter(d => selectedIds.includes(d.id))
  const unselected = destinations.filter(d => !selectedIds.includes(d.id))

  function toggleId(id: string) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function addGlobalMedia(m: MediaFile) { setGlobalMedia(p => [...p, m]) }
  function removeGlobalMedia(i: number) {
    setGlobalMedia(p => { URL.revokeObjectURL(p[i].previewUrl); return p.filter((_, j) => j !== i) })
  }

  function addPlatformMedia(platform: string, m: MediaFile) {
    setPlatformMedia(p => ({ ...p, [platform]: [...(p[platform] ?? []), m] }))
  }
  function removePlatformMedia(platform: string, i: number) {
    setPlatformMedia(p => {
      const arr = [...(p[platform] ?? [])]
      URL.revokeObjectURL(arr[i].previewUrl)
      arr.splice(i, 1)
      return { ...p, [platform]: arr }
    })
  }

  // Effective text/media for a destination — dest override > platform (AI) override > global
  function effectiveText(destId: string, platform: string) {
    if (destText[destId] !== undefined) return destText[destId]
    if (platformText[platform] !== undefined) return platformText[platform]
    return globalText
  }
  function effectiveMedia(destId: string, platform: string): MediaFile[] {
    const dm = destMedia[destId]
    if (dm?.length) return dm
    const pm = platformMedia[platform]
    if (pm?.length) return pm
    if (globalMedia.length) return globalMedia
    // When editing a saved post, show existing uploaded media in the preview
    return existingMediaUrls.map(url => ({ file: null as unknown as File, previewUrl: url }))
  }

  async function adaptWithAI() {
    if (!globalText.trim()) { showToast(false, 'Write your content first.'); return }
    const platforms = [...new Set(selected.map(d => d.platform))]
    if (platforms.length < 2) { showToast(false, 'Select multiple platforms to adapt for.'); return }

    setAdapting(true)
    try {
      const res = await fetch('/api/ai/adapt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masterContent: globalText, masterPlatform: platforms[0], targetPlatforms: platforms }),
      })
      const data = await res.json()
      if (res.ok && data.data) {
        setPlatformText(data.data)
        setActiveDestId(null)
        showToast(true, `AI adapted for ${Object.keys(data.data).length} platforms — click a preview card to edit.`)
      } else {
        showToast(false, data.error?.message ?? 'AI error. Try again.')
      }
    } catch { showToast(false, 'Network error.') }
    finally { setAdapting(false) }
  }

  async function submit(action: Action) {
    if (action === 'schedule' && !scheduledAt) { showToast(false, 'Pick a date and time.'); return }
    if (action === 'schedule' && new Date(scheduledAt) <= new Date()) { showToast(false, 'Scheduled time must be in the future.'); return }
    if (!globalText.trim()) { showToast(false, 'Write something first.'); return }
    if (!selectedIds.length) { showToast(false, 'Select at least one account.'); return }
    setBusy(true)

    // Upload media files to storage and collect public URLs
    let mediaUrls: string[] = []
    if (globalMedia.length > 0) {
      try {
        mediaUrls = await Promise.all(
          globalMedia.map(async (m) => {
            const fd = new FormData()
            fd.append('file', m.file)
            const r = await fetch(`/api/workspaces/${workspaceId}/media/upload`, { method: 'POST', body: fd })
            const d = await r.json()
            if (!r.ok) throw new Error(d.error ?? 'Upload failed')
            return d.url as string
          })
        )
      } catch (uploadErr) {
        setBusy(false)
        showToast(false, uploadErr instanceof Error ? uploadErr.message : 'Media upload failed.')
        return
      }
    }

    // Build per-destination captions (dest override > platform AI adapt override)
    const destinationCaptions: Record<string, string> = {}
    for (const dest of selected) {
      const t = destText[dest.id] ?? platformText[dest.platform]
      if (t !== undefined) destinationCaptions[dest.id] = t
    }
    // Merge kept existing URLs + newly uploaded URLs
    const allMediaUrls = [...existingMediaUrls, ...mediaUrls]
    const body: Record<string, unknown> = {
      common_caption: globalText, link_url: null,
      destination_ids: selectedIds, action,
      platform_captions: platformText,
      destination_captions: destinationCaptions,
      ...(allMediaUrls.length > 0 ? { media_urls: allMediaUrls } : {}),
    }
    if (action === 'schedule') body.scheduled_at_utc = new Date(scheduledAt).toISOString()

    const res = await fetch(`/api/workspaces/${workspaceId}/posts`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })
    const data = await res.json()
    setBusy(false)

    if (res.ok) {
      setSuccessPopup({ action })
      setGlobalText(''); setPlatformText({}); setDestText({}); setActiveDestId(null)
      globalMedia.forEach(f => URL.revokeObjectURL(f.previewUrl)); setGlobalMedia([])
      setPlatformMedia({}); setDestMedia({}); setExistingMediaUrls([]); setScheduledAt(''); setShowScheduler(false)
    } else showToast(false, data.error?.message ?? 'Failed.')
  }

  const canPost = !busy && globalText.trim().length > 0 && selectedIds.length > 0
  const minDatetime = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16)

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center bg-white', isModal ? 'h-full' : 'h-screen')}>
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-gray-400">Loading post…</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col bg-white overflow-hidden', isModal ? 'h-full' : 'h-screen')}>

      {/* ── Success popup ── */}
      {successPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center text-center max-w-sm w-full mx-4 relative">
            <button
              onClick={() => { setSuccessPopup(null); onClose?.() }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: '#e8faf3' }}>
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#26bb85" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2" style={{ fontFamily: 'var(--font-bricolage)' }}>
              {successPopup.action === 'publish' ? 'Post published!' :
               successPopup.action === 'schedule' ? 'Post scheduled!' :
               successPopup.action === 'submit' ? 'Submitted for approval' :
               'Draft saved!'}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {successPopup.action === 'publish' ? 'Your post is live across all selected platforms.' :
               successPopup.action === 'schedule' ? 'Your post will go live at the scheduled time.' :
               successPopup.action === 'submit' ? 'Your post is awaiting approval from the team.' :
               'Your draft has been saved. You can finish it anytime.'}
            </p>
            <button
              onClick={() => { setSuccessPopup(null); onClose?.() }}
              className="w-full py-3 rounded-2xl text-sm font-bold text-gray-950"
              style={{ background: '#c5f06a' }}
            >
              {onClose ? 'Close' : 'Create another post'}
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={cn(
          'fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white',
          toast.ok ? 'bg-emerald-600' : 'bg-red-600'
        )}>
          {toast.ok
            ? <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
            : <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>}
          {toast.text}
        </div>
      )}

      {/* Connect modal */}
      {showConnect && (
        <ConnectModal
          workspaceId={workspaceId}
          onClose={() => setShowConnect(false)}
          onConnected={loadDests}
        />
      )}

      <div className="flex flex-1 overflow-hidden">

        {/* ══ LEFT ════════════════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-gray-100">

          {/* Account avatars */}
          <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-gray-100 flex-wrap">
            {selected.map(d => {
              const m = PLATFORM_META[d.platform]
              return (
                <button key={d.id} onClick={() => toggleId(d.id)} title={`Remove ${d.display_name}`}
                  className="relative group shrink-0">
                  <Avatar src={d.profile_image_url} name={d.display_name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                    style={{ backgroundColor: m?.color ?? '#6b7280' }} />
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center"
                    style={{ backgroundColor: m?.color ?? '#6b7280' }}>
                    <PlatformIcon p={d.platform} size={9} white />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-red-500/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white text-xs font-bold">✕</span>
                  </div>
                </button>
              )
            })}

            {/* Add account dropdown */}
            <div className="relative group shrink-0">
              <button
                onClick={() => setShowConnect(true)}
                className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-emerald-400 hover:text-emerald-500 transition-all"
                title="Add account">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </div>

            {destinations.length === 0 && (
              <button onClick={() => setShowConnect(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-emerald-400 hover:text-emerald-600 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Connect accounts
              </button>
            )}

          </div>

          {/* Writing area */}
          <div className="flex-1 overflow-y-auto">
            {activeDestId ? (() => {
              const activeDest = selected.find(d => d.id === activeDestId)
              if (!activeDest) return null
              const activeDestMedia = destMedia[activeDestId] ?? []
              return (
                /* ── Editing a specific destination (clicked from preview) ── */
                <div className="px-5 pt-4 pb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      onClick={() => setActiveDestId(null)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                      Back
                    </button>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold text-white"
                      style={{ backgroundColor: PLATFORM_META[activeDest.platform]?.color ?? '#6b7280' }}>
                      <PlatformIcon p={activeDest.platform} size={11} white />
                      {PLATFORM_META[activeDest.platform]?.label}
                    </div>
                    <span className="text-[11px] font-medium text-gray-600 truncate">{activeDest.display_name}</span>
                  </div>
                  <textarea
                    value={destText[activeDestId] ?? platformText[activeDest.platform] ?? globalText}
                    onChange={e => setDestText(p => ({ ...p, [activeDestId]: e.target.value }))}
                    placeholder={`Write for ${activeDest.display_name}…`}
                    style={{ color: '#1f2937' }}
                    className="w-full min-h-[140px] text-[15px] placeholder-gray-300 resize-none focus:outline-none bg-transparent leading-relaxed"
                  />
                  {/* Media for this destination */}
                  <div className="mt-3">
                    <MediaZone
                      files={activeDestMedia.length > 0 ? activeDestMedia : (globalMedia.length > 0 ? globalMedia : [])}
                      onAdd={m => setDestMedia(p => ({ ...p, [activeDestId]: [...(p[activeDestId] ?? []), m] }))}
                      onRemove={i => setDestMedia(p => {
                        const arr = [...(p[activeDestId] ?? [])]
                        URL.revokeObjectURL(arr[i].previewUrl)
                        arr.splice(i, 1)
                        return { ...p, [activeDestId]: arr }
                      })}
                    />
                    {globalMedia.length > 0 && activeDestMedia.length === 0 && (
                      <p className="text-[10px] text-gray-400 mt-1">Using global image — upload above to override for {activeDest.display_name}</p>
                    )}
                  </div>
                </div>
              )
            })() : (
              /* ── Global master textarea ── */
              <div className="px-5 pt-4 pb-0">
                <textarea
                  value={globalText}
                  onChange={e => setGlobalText(e.target.value)}
                  placeholder="What would you like to share?"
                  className="w-full min-h-[160px] text-[15px] text-gray-800 placeholder-gray-300 resize-none focus:outline-none bg-transparent leading-relaxed"
                />
                <div className="pb-4">
                  {/* Existing uploaded images (edit mode) */}
                  {existingMediaUrls.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-2">
                      {existingMediaUrls.map((url, i) => (
                        <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 group shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={() => setExistingMediaUrls(p => p.filter((_, j) => j !== i))}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                          >×</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <MediaZone files={globalMedia} onAdd={addGlobalMedia} onRemove={removeGlobalMedia} />
                </div>
              </div>
            )}
          </div>

          {/* Bottom toolbar */}
          <div className="flex items-center gap-1.5 px-5 py-3 border-t border-gray-100">
            <button onClick={() => setGlobalText(t => t + ' 😊')}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all" title="Emoji">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
              </svg>
            </button>
            <button onClick={() => setGlobalText(t => t + ' #')}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all" title="Hashtag">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" />
              </svg>
            </button>

            <button
              onClick={adaptWithAI}
              disabled={adapting || !globalText.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 ml-1 rounded-lg text-xs font-semibold border-2 transition-all disabled:opacity-40"
              style={{ borderColor: '#26BB85', color: '#26BB85' }}>
              {adapting
                ? <><svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Adapting…</>
                : <><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>AI adapt</>}
            </button>

          </div>
        </div>

        {/* ══ RIGHT: all preview cards (click to edit on left) ══════════ */}
        <div className="w-[360px] shrink-0 flex flex-col bg-gray-50/50 overflow-hidden">
          <div className="px-4 pt-3 pb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              {selected.length > 0 ? 'Preview — click a card to edit' : 'Post Preview'}
            </p>
            {/* Desktop / Mobile toggle */}
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden text-[11px] font-medium">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={cn('flex items-center gap-1 px-2.5 py-1 transition-colors', previewMode === 'desktop' ? 'text-white' : 'text-gray-500 hover:bg-gray-100')}
                style={previewMode === 'desktop' ? { backgroundColor: '#26BB85' } : {}}>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
                </svg>
                Desktop
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={cn('flex items-center gap-1 px-2.5 py-1 border-l border-gray-200 transition-colors', previewMode === 'mobile' ? 'text-white' : 'text-gray-500 hover:bg-gray-100')}
                style={previewMode === 'mobile' ? { backgroundColor: '#26BB85' } : {}}>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3" />
                </svg>
                Mobile
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {selected.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.641 0-8.573-3.007-9.964-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-400">Connect an account to see preview</p>
              </div>
            ) : (
              <div className="space-y-5">
                {selected.map(dest => {
                  const cardText = effectiveText(dest.id, dest.platform)
                  const hasOverride = destText[dest.id] !== undefined || platformText[dest.platform] !== undefined
                  return (
                    <div key={dest.id}
                      onClick={() => setActiveDestId(dest.id)}
                      className={cn(
                        'cursor-pointer rounded-2xl transition-all ring-offset-2',
                        activeDestId === dest.id
                          ? 'ring-2 ring-emerald-400'
                          : 'hover:ring-1 hover:ring-gray-300'
                      )}>
                      {/* Platform + account label */}
                      <div className="flex items-center gap-1.5 mb-1.5 px-1">
                        <span style={{ color: PLATFORM_META[dest.platform]?.color }}>
                          <PlatformIcon p={dest.platform} size={12} />
                        </span>
                        <span className="text-[11px] font-semibold text-gray-500">{dest.display_name}</span>
                        {hasOverride && (
                          <span className="ml-auto text-[10px] text-emerald-500 font-medium">
                            {destText[dest.id] !== undefined ? 'edited' : 'AI adapted'}
                          </span>
                        )}
                      </div>

                      {/* Preview — desktop browser or phone frame */}
                      {previewMode === 'mobile' ? (
                        /* ── iPhone frame ── */
                        <div className="flex justify-center py-1">
                          <div className="relative" style={{ width: 215 }}>
                            {/* Side buttons */}
                            <div className="absolute -left-[3px] top-16 w-[3px] h-6 bg-gray-600 rounded-l" />
                            <div className="absolute -left-[3px] top-28 w-[3px] h-10 bg-gray-600 rounded-l" />
                            <div className="absolute -left-[3px] top-40 w-[3px] h-10 bg-gray-600 rounded-l" />
                            <div className="absolute -right-[3px] top-24 w-[3px] h-14 bg-gray-600 rounded-r" />
                            {/* Phone shell */}
                            <div className="rounded-[34px] shadow-2xl overflow-hidden" style={{ background: '#1a1a1a', padding: '3px', boxShadow: '0 0 0 1px #333, 0 20px 60px rgba(0,0,0,0.5)' }}>
                              <div className="rounded-[31px] overflow-hidden bg-black">
                                {/* Dynamic island */}
                                <div className="bg-black flex justify-center pt-2.5 pb-1">
                                  <div className="w-[80px] h-[26px] bg-black rounded-full border border-gray-800 flex items-center justify-between px-2">
                                    <div className="w-3 h-3 rounded-full border border-gray-700" />
                                    <div className="w-8 h-4 rounded-full bg-gray-900" />
                                  </div>
                                </div>
                                {/* Status bar */}
                                <div className="bg-white flex items-center justify-between px-5 py-[3px]">
                                  <span className="text-[9px] font-bold text-gray-900">9:41</span>
                                  <div className="flex items-center gap-[3px]">
                                    <svg viewBox="0 0 24 16" width="13" fill="#111"><rect x="0" y="5" width="3" height="11" rx="1"/><rect x="5" y="3" width="3" height="13" rx="1"/><rect x="10" y="1" width="3" height="15" rx="1"/><rect x="15" y="0" width="3" height="16" rx="1" opacity=".3"/></svg>
                                    <svg viewBox="0 0 24 16" width="13" fill="#111"><path d="M12 3C8 3 4.5 4.7 2 7.4l2.2 2.2C5.9 7.5 8.8 6 12 6s6.1 1.5 7.8 3.6L22 7.4C19.5 4.7 16 3 12 3zm0 5c-2.5 0-4.7 1-6.3 2.7l2.1 2.1C9 11.7 10.4 11 12 11s3 .7 4.2 1.8l2.1-2.1C16.7 9 14.5 8 12 8zm0 5c-1.3 0-2.4.5-3.2 1.3L12 17.5l3.2-3.2C14.4 13.5 13.3 13 12 13z"/></svg>
                                    <div className="flex items-center gap-[2px]">
                                      <div className="rounded-sm bg-gray-900" style={{ width: 18, height: 9, padding: '1.5px', display: 'flex', alignItems: 'center' }}>
                                        <div className="bg-gray-900 rounded-sm h-full" style={{ width: '80%', background: '#111' }} />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {/* App content */}
                                <div className="overflow-y-auto bg-white" style={{ maxHeight: 370 }}>
                                  <div style={{ zoom: 0.72 }}>
                                    <PreviewCard dest={dest} text={cardText} media={effectiveMedia(dest.id, dest.platform)} link="" />
                                  </div>
                                </div>
                                {/* Home indicator */}
                                <div className="bg-white pt-1.5 pb-2 flex justify-center">
                                  <div className="w-24 h-[5px] bg-gray-200 rounded-full" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* ── Browser chrome (desktop) ── */
                        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-md">
                          {/* Browser toolbar */}
                          <div className="bg-gray-100 border-b border-gray-200 px-3 py-2 flex items-center gap-2">
                            <div className="flex gap-1.5 shrink-0">
                              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                            </div>
                            <div className="flex items-center gap-1 text-gray-400 shrink-0">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                            </div>
                            <div className="flex-1 bg-white rounded-md px-2.5 py-0.5 flex items-center gap-1.5 border border-gray-200">
                              <svg className="w-2.5 h-2.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15V3m0 0L8 7m4-4l4 4M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2" /></svg>
                              <span className="text-[9px] text-gray-400 truncate">
                                {dest.platform === 'instagram' ? 'instagram.com' : dest.platform === 'linkedin' ? 'linkedin.com' : dest.platform === 'x' ? 'x.com' : dest.platform === 'facebook' ? 'facebook.com' : `${dest.platform}.com`}
                              </span>
                            </div>
                          </div>
                          {/* Page content */}
                          <div className="bg-gray-50 p-3">
                            <div style={{ zoom: 0.72 }}>
                              <PreviewCard dest={dest} text={cardText} media={effectiveMedia(dest.id, dest.platform)} link="" />
                            </div>
                          </div>
                        </div>
                      )}
                      <p className="text-[10px] text-gray-400 mt-1 px-1">Click to edit</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ Footer bar ══════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-2 px-5 py-3 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <input type="checkbox" id="again" className="rounded" />
          <label htmlFor="again" className="text-sm text-gray-600 select-none">Create another</label>
        </div>
        <button onClick={() => submit('draft')} disabled={busy || !globalText.trim()}
          className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition-all">
          Save draft
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => submit('submit')} disabled={!canPost}
            className="px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 disabled:opacity-40">
            Submit for approval
          </button>

          {showScheduler ? (
            <div className="flex items-center gap-2">
              <input type="datetime-local" value={scheduledAt} min={minDatetime} onChange={e => setScheduledAt(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300" />
              <button onClick={() => submit('schedule')} disabled={!canPost || !scheduledAt}
                className="px-4 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-40 hover:opacity-90"
                style={{ backgroundColor: '#00585B' }}>Confirm</button>
              <button onClick={() => setShowScheduler(false)} className="text-gray-400 hover:text-gray-600 px-1 text-sm">✕</button>
            </div>
          ) : (
            <button onClick={() => setShowScheduler(true)} disabled={!canPost}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              Schedule
            </button>
          )}


          <button onClick={() => submit('publish')} disabled={!canPost}
            className="px-5 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-40 hover:opacity-90 shadow-sm"
            style={{ backgroundColor: '#26BB85' }}>
            {busy ? 'Working…' : 'Publish now'}
          </button>
        </div>
      </div>
    </div>
  )
}

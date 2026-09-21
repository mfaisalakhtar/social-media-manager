'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useComposer } from '@/contexts/ComposerContext'

type CalendarView = 'week' | 'month'

type Post = {
  id: string
  common_caption: string | null
  status: string
  scheduled_at_utc: string | null
  created_at: string
  media_urls: string[] | null
}

type DropConfirm = {
  postId: string
  caption: string | null
  date: string   // 'YYYY-MM-DD'
  time: string   // 'HH:MM'
}

const STATUS_STYLE: Record<string, { border: string; bg: string; badge: string; dot: string }> = {
  draft:             { border: 'border-l-gray-300',    bg: 'bg-white',         badge: 'bg-gray-100 text-gray-600',    dot: 'bg-gray-400' },
  pending_approval:  { border: 'border-l-amber-400',   bg: 'bg-amber-50/40',   badge: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-400' },
  changes_requested: { border: 'border-l-orange-400',  bg: 'bg-orange-50/40',  badge: 'bg-orange-100 text-orange-700',dot: 'bg-orange-400' },
  approved:          { border: 'border-l-blue-400',    bg: 'bg-blue-50/40',    badge: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-400' },
  scheduled:         { border: 'border-l-violet-400',  bg: 'bg-violet-50/40',  badge: 'bg-violet-100 text-violet-700',dot: 'bg-violet-400' },
  publishing:        { border: 'border-l-emerald-400', bg: 'bg-emerald-50/40', badge: 'bg-emerald-100 text-emerald-700',dot:'bg-emerald-400' },
  published:         { border: 'border-l-emerald-500', bg: 'bg-emerald-50/40', badge: 'bg-emerald-100 text-emerald-700',dot:'bg-emerald-500' },
  failed:            { border: 'border-l-red-400',     bg: 'bg-red-50/40',     badge: 'bg-red-100 text-red-700',      dot: 'bg-red-500' },
  canceled:          { border: 'border-l-gray-200',    bg: 'bg-gray-50',       badge: 'bg-gray-100 text-gray-500',    dot: 'bg-gray-300' },
}

function getPostDate(post: Post): Date {
  return post.scheduled_at_utc ? new Date(post.scheduled_at_utc) : new Date(post.created_at)
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ─── Post Card (week view) ───────────────────────────────────────────────────
function PostCard({ post, onEdit, onDelete, onDragStart, onDragEnd, isDragging }: {
  post: Post
  onEdit: () => void
  onDelete: () => void
  onDragStart: (e: React.DragEvent) => void
  onDragEnd: () => void
  isDragging: boolean
}) {
  const s = STATUS_STYLE[post.status] ?? STATUS_STYLE.draft
  const d = getPostDate(post)
  const timeLabel = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const caption = post.common_caption?.trim() || ''
  const thumb = post.media_urls?.[0] ?? null
  const statusLabel = post.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', post.id); onDragStart(e) }}
      onDragEnd={onDragEnd}
      onClick={e => { e.stopPropagation(); onEdit() }}
      className={cn(
        'group relative rounded-lg border border-gray-200 border-l-4 overflow-hidden cursor-pointer select-none transition-all',
        'hover:shadow-md hover:-translate-y-0.5',
        s.border, s.bg,
        isDragging ? 'opacity-40 scale-95' : ''
      )}
    >
      {thumb && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumb} alt="" className="w-full h-20 object-cover" draggable={false} />
      )}
      <div className="px-2.5 py-2">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', s.dot)} />
          <span className="text-[11px] font-semibold text-gray-500">{timeLabel}</span>
        </div>
        {caption ? (
          <p className="text-[12px] text-gray-800 leading-snug line-clamp-2">{caption}</p>
        ) : (
          <p className="text-[12px] text-gray-400 italic">No caption</p>
        )}
        <div className="mt-2">
          <span className={cn('inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium', s.badge)}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Delete button — appears on hover */}
      <button
        onClick={e => { e.stopPropagation(); onDelete() }}
        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-white shadow border border-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:border-red-200"
      >
        <svg className="w-3 h-3 text-gray-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
      </button>
    </div>
  )
}

// ─── Schedule Placeholder ────────────────────────────────────────────────────
function SchedulePlaceholder({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={e => { e.stopPropagation(); onClick() }}
      className="rounded-lg border-2 border-dashed border-gray-200 p-3 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors group"
    >
      <div className="flex flex-col items-center text-center gap-1.5 py-2">
        <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
          <svg className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        <p className="text-[11px] text-gray-400 group-hover:text-emerald-700 font-medium leading-snug">Schedule a post</p>
      </div>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function CalendarClient({ workspaceId }: { workspaceId: string }) {
  const { open: openComposer } = useComposer()
  const now = new Date()

  const [view, setView] = useState<CalendarView>('week')
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)   // initial skeleton only
  const [refreshing, setRefreshing] = useState(false) // silent nav fetch

  // Animation state
  const [direction, setDirection] = useState<'left' | 'right' | null>(null)
  const [animKey, setAnimKey] = useState(0)

  // Drop confirmation modal state
  const [dropConfirm, setDropConfirm] = useState<DropConfirm | null>(null)
  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; caption: string | null } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [weekStart, setWeekStart] = useState<Date>(() => {
    const d = new Date(now)
    d.setDate(now.getDate() - now.getDay())
    d.setHours(0, 0, 0, 0)
    return d
  })

  // Drag state stored in refs to avoid stale closures / re-render issues
  const draggedPostIdRef = useRef<string | null>(null)
  const [dragOverDate, setDragOverDate] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const isFirstFetch = useRef(true)

  const fetchPosts = useCallback(async (from: Date, to: Date) => {
    if (isFirstFetch.current) {
      setLoading(true)
    } else {
      setRefreshing(true)
    }
    const res = await fetch(`/api/workspaces/${workspaceId}/posts?from=${from.toISOString()}&to=${to.toISOString()}`)
    const data = await res.json()
    setPosts(data.data ?? [])
    setLoading(false)
    setRefreshing(false)
    isFirstFetch.current = false
  }, [workspaceId])

  useEffect(() => {
    if (view === 'week') {
      const end = new Date(weekStart)
      end.setDate(weekStart.getDate() + 6)
      end.setHours(23, 59, 59)
      fetchPosts(weekStart, end)
    } else {
      fetchPosts(new Date(year, month, 1), new Date(year, month + 1, 0, 23, 59, 59))
    }
  }, [view, weekStart, year, month, fetchPosts])

  // Navigation — with slide animation
  function prevWeek() { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d) }
  function nextWeek() { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d) }
  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1)
  }
  function goToday() {
    setDirection('left')
    setAnimKey(k => k + 1)
    const t = new Date()
    setYear(t.getFullYear()); setMonth(t.getMonth())
    const ws = new Date(t); ws.setDate(t.getDate() - t.getDay()); ws.setHours(0, 0, 0, 0)
    setWeekStart(ws)
  }
  function prev() {
    setDirection('right')
    setAnimKey(k => k + 1)
    view === 'week' ? prevWeek() : prevMonth()
  }
  function next() {
    setDirection('left')
    setAnimKey(k => k + 1)
    view === 'week' ? nextWeek() : nextMonth()
  }

  const centerLabel = view === 'week'
    ? `${weekStart.toLocaleString('en-US', { month: 'long' })} ${weekStart.getFullYear()}`
    : new Date(year, month, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })

  // Drag callbacks
  const handleDragStart = useCallback((postId: string) => {
    draggedPostIdRef.current = postId
    setDraggingId(postId)
  }, [])
  const handleDragEnd = useCallback(() => {
    draggedPostIdRef.current = null
    setDraggingId(null)
    setDragOverDate(null)
  }, [])
  const handleDragOver = useCallback((e: React.DragEvent, dateStr: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverDate(dateStr)
  }, [])

  const handleDrop = useCallback((dateStr: string) => {
    const pid = draggedPostIdRef.current
    setDragOverDate(null)
    setDraggingId(null)
    draggedPostIdRef.current = null
    if (!pid) return

    setPosts(prev => {
      const post = prev.find(p => p.id === pid)
      if (!post) return prev
      let time = '09:00'
      if (post.scheduled_at_utc) {
        const d = new Date(post.scheduled_at_utc)
        time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      }
      setDropConfirm({
        postId: pid,
        caption: post.common_caption,
        date: dateStr,
        time,
      })
      return prev // no optimistic update yet
    })
  }, [])

  async function confirmDelete() {
    if (!deleteConfirm) return
    setDeleting(true)
    await fetch(`/api/workspaces/${workspaceId}/posts/${deleteConfirm.id}`, { method: 'DELETE' })
    setPosts(prev => prev.filter(p => p.id !== deleteConfirm.id))
    setDeleting(false)
    setDeleteConfirm(null)
  }

  async function confirmReschedule() {
    if (!dropConfirm) return
    const { postId, date, time } = dropConfirm
    const newIso = new Date(`${date}T${time}:00`).toISOString()
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, scheduled_at_utc: newIso, status: p.status === 'draft' ? 'scheduled' : p.status }
        : p
    ))
    setDropConfirm(null)
    await fetch(`/api/workspaces/${workspaceId}/posts/${postId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduled_at_utc: newIso }),
    })
  }

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5]">
      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(60px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(-60px); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        .slide-in-left  { animation: slideInLeft  0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94) both; }
        .slide-in-right { animation: slideInRight 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94) both; }
      `}</style>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4 shrink-0">
        {/* View tabs */}
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden text-[13px] font-medium">
          <button
            onClick={() => setView('week')}
            className={cn('px-4 py-1.5 transition-colors', view === 'week' ? 'text-white' : 'text-gray-600 hover:bg-gray-50')}
            style={view === 'week' ? { backgroundColor: '#26BB85' } : {}}>
            Week
          </button>
          <button
            onClick={() => setView('month')}
            className={cn('px-4 py-1.5 border-l border-gray-200 transition-colors', view === 'month' ? 'text-white' : 'text-gray-600 hover:bg-gray-50')}
            style={view === 'month' ? { backgroundColor: '#26BB85' } : {}}>
            Month
          </button>
        </div>

        {/* Prev / Today / Next */}
        <div className="flex items-center gap-1">
          <button onClick={prev}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </button>
          <button onClick={goToday}
            className="px-3 py-1.5 text-[13px] font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            Today
          </button>
          <button onClick={next}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
          </button>
        </div>

        {/* Month/Year title */}
        <h2 className="flex-1 text-center text-[15px] font-semibold text-gray-800">{centerLabel}</h2>

        {/* Create post */}
        <button
          onClick={() => openComposer()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: '#26BB85' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Create post
        </button>
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      {/* Thin loading bar for nav refreshes — doesn't block animation */}
      {refreshing && (
        <div className="h-0.5 shrink-0 overflow-hidden" style={{ backgroundColor: '#e8f8f2' }}>
          <div className="h-full animate-pulse" style={{ backgroundColor: '#DEF58A', width: '60%' }} />
        </div>
      )}

      {loading ? (
        <div className="flex-1 grid grid-cols-7 gap-px bg-gray-200 m-0">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="bg-white animate-pulse" />
          ))}
        </div>
      ) : view === 'week' ? (
        <div key={animKey} className={cn('flex-1 flex flex-col overflow-hidden', direction === 'left' ? 'slide-in-left' : direction === 'right' ? 'slide-in-right' : '')}>
          <WeekView
            posts={posts}
            weekStart={weekStart}
            now={now}
            draggingId={draggingId}
            dragOverDate={dragOverDate}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClickDay={(date) => openComposer(undefined, date)}
            onClickPost={(id) => openComposer(id)}
            onDeletePost={(id, caption) => setDeleteConfirm({ id, caption })}
          />
        </div>
      ) : (
        <div key={animKey} className={cn('flex-1 overflow-hidden', direction === 'left' ? 'slide-in-left' : direction === 'right' ? 'slide-in-right' : '')}>
          <MonthView
            posts={posts}
            year={year}
            month={month}
            now={now}
            draggingId={draggingId}
            dragOverDate={dragOverDate}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClickDay={(date) => openComposer(undefined, date)}
            onClickPost={(id) => openComposer(id)}
            onDeletePost={(id, caption) => setDeleteConfirm({ id, caption })}
          />
        </div>
      )}

      {/* ── Delete Confirmation Modal ───────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-72 flex flex-col gap-4">
            <div>
              <h3 className="text-[15px] font-semibold text-gray-900">Delete post?</h3>
              <p className="text-[12px] text-gray-400 mt-0.5">This action cannot be undone.</p>
              {deleteConfirm.caption && (
                <p className="text-[12px] text-gray-500 mt-2 line-clamp-2 border-l-2 border-gray-200 pl-2">{deleteConfirm.caption}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={deleting}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white rounded-xl bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60">
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Drop Confirmation Modal ─────────────────────────── */}
      {dropConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-72 flex flex-col gap-4">
            <div>
              <h3 className="text-[15px] font-semibold text-gray-900">Confirm reschedule</h3>
              <p className="text-[12px] text-gray-400 mt-0.5">
                Moving to <span className="font-medium text-gray-600">{new Date(dropConfirm.date + 'T00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              </p>
              {dropConfirm.caption && (
                <p className="text-[12px] text-gray-500 mt-2 line-clamp-2 border-l-2 border-gray-200 pl-2">{dropConfirm.caption}</p>
              )}
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Publish time</label>
              <input
                type="time"
                value={dropConfirm.time}
                onChange={e => setDropConfirm(d => d ? { ...d, time: e.target.value } : d)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDropConfirm(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={confirmReschedule}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-90"
                style={{ backgroundColor: '#26BB85' }}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Week View ────────────────────────────────────────────────────────────────
function WeekView({ posts, weekStart, now, draggingId, dragOverDate, onDragStart, onDragEnd, onDragOver, onDrop, onClickDay, onClickPost, onDeletePost }: {
  posts: Post[]
  weekStart: Date
  now: Date
  draggingId: string | null
  dragOverDate: string | null
  onDragStart: (id: string) => void
  onDragEnd: () => void
  onDragOver: (e: React.DragEvent, dateStr: string) => void
  onDrop: (dateStr: string) => void
  onClickDay: (date: Date) => void
  onClickPost: (id: string) => void
  onDeletePost: (id: string, caption: string | null) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollAnimRef = useRef<number | null>(null)

  // Auto-scroll the week container when dragging near the left/right edges
  useEffect(() => {
    if (!draggingId) {
      if (scrollAnimRef.current) { cancelAnimationFrame(scrollAnimRef.current); scrollAnimRef.current = null }
      return
    }

    const EDGE_SIZE = 80   // px from edge that triggers scrolling
    const MAX_SPEED = 14   // max px per animation frame
    let cursorX = 0

    function onDocDragOver(e: DragEvent) { cursorX = e.clientX }

    function tick() {
      const el = scrollRef.current
      if (el) {
        const { left, right } = el.getBoundingClientRect()
        let speed = 0
        if (cursorX < left + EDGE_SIZE) {
          // near left edge — scroll left
          speed = -Math.max(1, Math.round(MAX_SPEED * (1 - (cursorX - left) / EDGE_SIZE)))
        } else if (cursorX > right - EDGE_SIZE) {
          // near right edge — scroll right
          speed = Math.max(1, Math.round(MAX_SPEED * (1 - (right - cursorX) / EDGE_SIZE)))
        }
        if (speed !== 0) el.scrollLeft += speed
      }
      scrollAnimRef.current = requestAnimationFrame(tick)
    }

    document.addEventListener('dragover', onDocDragOver)
    scrollAnimRef.current = requestAnimationFrame(tick)

    return () => {
      document.removeEventListener('dragover', onDocDragOver)
      if (scrollAnimRef.current) { cancelAnimationFrame(scrollAnimRef.current); scrollAnimRef.current = null }
    }
  }, [draggingId])

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  const postsByDay: Record<string, Post[]> = {}
  days.forEach(d => {
    const key = d.toDateString()
    postsByDay[key] = posts
      .filter(p => getPostDate(p).toDateString() === key)
      .sort((a, b) => getPostDate(a).getTime() - getPostDate(b).getTime())
  })

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Horizontally scrollable container — ensures all 7 cols are always reachable */}
      <div ref={scrollRef} className="flex-1 overflow-x-auto overflow-y-auto">
        <div style={{ minWidth: 840 }} className="flex flex-col h-full">

        {/* Day headers — sticky so they stay visible while scrolling down */}
        <div className="grid grid-cols-7 bg-white border-b border-gray-200 shrink-0 sticky top-0 z-10">
          {days.map(d => {
            const isToday = d.toDateString() === now.toDateString()
            return (
              <div key={d.toDateString()}
                className={cn(
                  'text-center py-2.5 border-r border-gray-100 last:border-0',
                  isToday ? 'bg-[#00585B]' : 'bg-white'
                )}>
                <div className={cn('text-[11px] font-medium uppercase tracking-wide', isToday ? 'text-white/70' : 'text-gray-400')}>
                  {d.toLocaleString('en-US', { weekday: 'short' })} {d.getDate()}
                </div>
                {isToday && <div className="w-1 h-1 rounded-full mx-auto mt-0.5" style={{ backgroundColor: '#DEF58A' }} />}
              </div>
            )
          })}
        </div>

        {/* Day columns */}
        <div className="flex-1 flex flex-col">
          <div className="grid grid-cols-7 divide-x divide-gray-200 flex-1" style={{ minHeight: 'calc(100vh - 160px)' }}>
          {days.map(d => {
            const key = d.toDateString()
            const dateStr = toDateStr(d)
            const isToday = d.toDateString() === now.toDateString()
            const isDragOver = dragOverDate === dateStr
            const dayPosts = postsByDay[key] ?? []

            return (
              <div
                key={key}
                onClick={() => onClickDay(d)}
                onDragOver={e => onDragOver(e, dateStr)}
                onDragLeave={e => {
                  // Only clear if leaving the column (not entering a child)
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    // don't clear here, let onDrop handle it
                  }
                }}
                onDrop={e => { e.preventDefault(); onDrop(dateStr) }}
                className={cn(
                  'p-2 space-y-2 cursor-pointer transition-colors min-h-[500px]',
                  isToday ? 'bg-[#00585B]/5' : 'bg-white hover:bg-gray-50/60',
                  isDragOver ? 'bg-emerald-50 ring-2 ring-inset ring-emerald-400' : ''
                )}
              >
                {dayPosts.map(p => (
                  <PostCard
                    key={p.id}
                    post={p}
                    onEdit={() => onClickPost(p.id)}
                    onDelete={() => onDeletePost(p.id, p.common_caption)}
                    onDragStart={e => { e.stopPropagation(); onDragStart(p.id) }}
                    onDragEnd={onDragEnd}
                    isDragging={draggingId === p.id}
                  />
                ))}
                {dayPosts.length === 0 && (
                  <SchedulePlaceholder onClick={() => onClickDay(d)} />
                )}
              </div>
            )
          })}
          </div>
        </div>

        </div>{/* end minWidth wrapper */}
      </div>{/* end overflow-x scroll container */}
    </div>
  )
}

// ─── Month View ───────────────────────────────────────────────────────────────
function MonthView({ posts, year, month, now, draggingId, dragOverDate, onDragStart, onDragEnd, onDragOver, onDrop, onClickDay, onClickPost, onDeletePost }: {
  posts: Post[]
  year: number
  month: number
  now: Date
  draggingId: string | null
  dragOverDate: string | null
  onDragStart: (id: string) => void
  onDragEnd: () => void
  onDragOver: (e: React.DragEvent, dateStr: string) => void
  onDrop: (dateStr: string) => void
  onClickDay: (date: Date) => void
  onClickPost: (id: string) => void
  onDeletePost: (id: string, caption: string | null) => void
}) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7

  const postsByDay: Record<number, Post[]> = {}
  posts.forEach(post => {
    const d = getPostDate(post)
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate()
      if (!postsByDay[day]) postsByDay[day] = []
      postsByDay[day].push(post)
    }
  })

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Day labels */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-2 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{d}</div>
          ))}
        </div>
        {/* Grid */}
        <div className="grid grid-cols-7 divide-x divide-gray-100">
          {Array.from({ length: totalCells }, (_, idx) => {
            const dayNum = idx - firstDayOfWeek + 1
            const isValid = dayNum >= 1 && dayNum <= daysInMonth
            if (!isValid) return <div key={idx} className="min-h-24 bg-gray-50/50 border-b border-gray-100" />

            const dayPosts = postsByDay[dayNum] ?? []
            const isToday = dayNum === now.getDate() && month === now.getMonth() && year === now.getFullYear()
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
            const isDragOver = dragOverDate === dateStr

            return (
              <div
                key={idx}
                onClick={() => onClickDay(new Date(year, month, dayNum))}
                onDragOver={e => onDragOver(e, dateStr)}
                onDrop={e => { e.preventDefault(); onDrop(dateStr) }}
                className={cn(
                  'min-h-24 border-b border-gray-100 p-1.5 cursor-pointer group transition-colors',
                  isDragOver ? 'bg-emerald-50 ring-2 ring-inset ring-emerald-400' : 'hover:bg-gray-50/60'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      'inline-flex w-6 h-6 items-center justify-center text-xs font-semibold rounded-full',
                      isToday ? 'font-bold' : 'text-gray-500 group-hover:text-gray-700'
                    )}
                    style={isToday ? { backgroundColor: '#DEF58A', color: '#00585B' } : {}}
                  >{dayNum}</span>
                  <span className="opacity-0 group-hover:opacity-100 text-[10px] text-emerald-600 font-medium transition-opacity">+ add</span>
                </div>
                <div className="space-y-0.5">
                  {dayPosts.slice(0, 3).map(p => {
                    const s = STATUS_STYLE[p.status] ?? STATUS_STYLE.draft
                    const caption = p.common_caption?.trim() || '(no caption)'
                    return (
                      <div
                        key={p.id}
                        draggable
                        onDragStart={e => { e.stopPropagation(); e.dataTransfer.effectAllowed = 'move'; onDragStart(p.id) }}
                        onDragEnd={onDragEnd}
                        onClick={e => { e.stopPropagation(); onClickPost(p.id) }}
                        className={cn(
                          'text-[11px] px-1.5 py-0.5 rounded truncate cursor-pointer flex items-center gap-1 border-l-2',
                          s.badge, s.border,
                          draggingId === p.id ? 'opacity-40' : 'hover:opacity-80'
                        )}
                      >
                        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', s.dot)} />
                        <span className="truncate">{caption}</span>
                      </div>
                    )
                  })}
                  {dayPosts.length > 3 && (
                    <div className="text-[10px] text-gray-400 px-1.5">+{dayPosts.length - 3} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

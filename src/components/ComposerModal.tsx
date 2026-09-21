'use client'

import { useEffect } from 'react'
import { useComposer } from '@/contexts/ComposerContext'
import { ComposerContent } from '@/app/dashboard/[workspaceId]/composer/ComposerContent'

export function ComposerModal() {
  const { isOpen, postId, requestClose } = useComposer()

  // Close on Escape — auto-saves draft
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') requestClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, requestClose])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop — intentionally not clickable (user must use X or Escape) */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full rounded-2xl overflow-hidden shadow-2xl"
        style={{ maxWidth: 1100, height: 'min(88vh, 760px)' }}
      >
        {/* Close button */}
        <button
          onClick={requestClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ background: 'rgba(0,0,0,0.08)' }}
          title="Close (auto-saves draft)"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <ComposerContent isModal onClose={requestClose} postId={postId ?? undefined} />
      </div>
    </div>
  )
}

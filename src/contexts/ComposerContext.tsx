'use client'

import { createContext, useContext, useState, useRef, type ReactNode } from 'react'

type ComposerContextType = {
  isOpen: boolean
  postId: string | null
  initialDate: Date | null
  open: (postId?: string, initialDate?: Date) => void
  close: () => void
  /** Saves draft if there's unsaved content, then closes. Use for ESC / X button. */
  requestClose: () => Promise<void>
  /** Internal — ComposerContent registers its auto-save handler here. */
  _registerAutoSave: (fn: (() => Promise<void>) | null) => void
}

const ComposerContext = createContext<ComposerContextType | null>(null)

export function ComposerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [postId, setPostId] = useState<string | null>(null)
  const [initialDate, setInitialDate] = useState<Date | null>(null)
  const autoSaveFnRef = useRef<(() => Promise<void>) | null>(null)

  function open(pid?: string, date?: Date) {
    setPostId(pid ?? null)
    setInitialDate(date ?? null)
    setIsOpen(true)
  }

  function close() {
    setIsOpen(false)
    setPostId(null)
    setInitialDate(null)
    autoSaveFnRef.current = null
  }

  async function requestClose() {
    if (autoSaveFnRef.current) {
      try { await autoSaveFnRef.current() } catch { /* silent */ }
    }
    close()
  }

  function _registerAutoSave(fn: (() => Promise<void>) | null) {
    autoSaveFnRef.current = fn
  }

  return (
    <ComposerContext.Provider value={{ isOpen, postId, initialDate, open, close, requestClose, _registerAutoSave }}>
      {children}
    </ComposerContext.Provider>
  )
}

export function useComposer() {
  const ctx = useContext(ComposerContext)
  if (!ctx) throw new Error('useComposer must be used within ComposerProvider')
  return ctx
}

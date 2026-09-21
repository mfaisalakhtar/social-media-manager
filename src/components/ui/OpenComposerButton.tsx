'use client'

import { useComposer } from '@/contexts/ComposerContext'
import type { ReactNode } from 'react'

interface OpenComposerButtonProps {
  postId?: string
  className?: string
  style?: React.CSSProperties
  children: ReactNode
}

export function OpenComposerButton({ postId, className, style, children }: OpenComposerButtonProps) {
  const { open } = useComposer()
  return (
    <button onClick={() => open(postId)} className={className} style={style}>
      {children}
    </button>
  )
}

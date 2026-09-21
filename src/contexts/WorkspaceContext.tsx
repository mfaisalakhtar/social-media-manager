'use client'
import { createContext, useContext, type ReactNode } from 'react'

const WorkspaceContext = createContext<{ workspaceId: string; workspaceSlug: string } | null>(null)

export function WorkspaceProvider({ workspaceId, workspaceSlug, children }: { workspaceId: string; workspaceSlug: string; children: ReactNode }) {
  return <WorkspaceContext.Provider value={{ workspaceId, workspaceSlug }}>{children}</WorkspaceContext.Provider>
}

export function useWorkspaceId(): string {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspaceId must be used inside WorkspaceProvider')
  return ctx.workspaceId
}

export function useWorkspaceSlug(): string {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspaceSlug must be used inside WorkspaceProvider')
  return ctx.workspaceSlug
}

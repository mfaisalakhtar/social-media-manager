import { NextResponse } from 'next/server'
import { getUser, getUserWorkspaces } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getUser()
    const memberships = await getUserWorkspaces(user.id)
    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
      workspaces: memberships.map((m: any) => ({
        role: m.role,
        workspace: m.workspace,
      })),
    })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

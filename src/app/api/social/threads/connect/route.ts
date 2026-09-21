import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get('workspaceId')
  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 })
  }

  const randomHex = randomBytes(16).toString('hex')
  const state = `${workspaceId}:${randomHex}`

  const cookieStore = await cookies()
  cookieStore.set('smm_threads_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })

  const redirectUri =
    process.env.THREADS_REDIRECT_URI ??
    `${process.env.APP_BASE_URL}/api/social/threads/callback`

  // Threads has its own App ID (falls back to META_APP_ID for legacy setups)
  const appId = process.env.THREADS_APP_ID ?? process.env.META_APP_ID!
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: 'threads_basic,threads_content_publish',
    response_type: 'code',
    state,
  })

  return NextResponse.redirect(`https://www.threads.net/oauth/authorize?${params.toString()}`)
}

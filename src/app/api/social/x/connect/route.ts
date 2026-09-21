import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { randomBytes, createHash } from 'crypto'

function base64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get('workspaceId')
  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 })
  }

  // PKCE: code verifier + challenge
  const codeVerifier = base64url(randomBytes(32))
  const codeChallenge = base64url(
    Buffer.from(createHash('sha256').update(codeVerifier).digest()),
  )

  const randomHex = randomBytes(16).toString('hex')
  const state = `${workspaceId}:${randomHex}`

  const cookieStore = await cookies()
  cookieStore.set('smm_x_state', state, { httpOnly: true, sameSite: 'lax', maxAge: 600, path: '/' })
  cookieStore.set('smm_x_pkce', codeVerifier, { httpOnly: true, sameSite: 'lax', maxAge: 600, path: '/' })

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.TWITTER_CLIENT_ID!,
    redirect_uri: process.env.TWITTER_REDIRECT_URI!,
    scope: 'tweet.read tweet.write users.read offline.access',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })

  return NextResponse.redirect(`https://twitter.com/i/oauth2/authorize?${params.toString()}`)
}

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'
import { encryptToken } from '@/lib/crypto'
import { getUser } from '@/lib/auth'

const BASE_URL = process.env.APP_BASE_URL!

function errorRedirect(_workspaceId: string | null, code = 'connection_failed') {
  return NextResponse.redirect(`${BASE_URL}/oauth/done?error=${code}`)
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const oauthError = searchParams.get('error')

  const cookieStore = await cookies()
  const storedState = cookieStore.get('smm_x_state')?.value ?? null
  const codeVerifier = cookieStore.get('smm_x_pkce')?.value ?? null

  const workspaceId = storedState ? storedState.split(':')[0] : null

  if (oauthError) return errorRedirect(workspaceId, 'oauth_denied')
  if (!code || !state) return errorRedirect(workspaceId, 'oauth_invalid')
  if (!storedState || state !== storedState) return errorRedirect(workspaceId, 'state_mismatch')
  if (!codeVerifier) return errorRedirect(workspaceId, 'pkce_missing')

  const wid = workspaceId!

  // Clear cookies
  cookieStore.set('smm_x_state', '', { maxAge: 0, path: '/' })
  cookieStore.set('smm_x_pkce', '', { maxAge: 0, path: '/' })

  try {
    let user: Awaited<ReturnType<typeof getUser>>
    try { user = await getUser() } catch { return errorRedirect(wid, 'unauthenticated') }

    // Exchange code for token (PKCE, Basic Auth with client credentials)
    const credentials = Buffer.from(
      `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`,
    ).toString('base64')

    const tokenBody = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.TWITTER_REDIRECT_URI!,
      code_verifier: codeVerifier,
    })

    const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: tokenBody.toString(),
    })

    if (!tokenRes.ok) {
      console.error('X token exchange failed:', await tokenRes.text())
      return errorRedirect(wid, 'connection_failed')
    }

    const tokenData = await tokenRes.json()
    const accessToken: string = tokenData.access_token
    const refreshToken: string | undefined = tokenData.refresh_token
    const expiresIn: number = tokenData.expires_in ?? 7200
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

    // Get Twitter user info
    const userRes = await fetch('https://api.twitter.com/2/users/me?user.fields=name,username,profile_image_url', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!userRes.ok) {
      console.error('X /users/me failed:', await userRes.text())
      return errorRedirect(wid, 'connection_failed')
    }

    const userData = await userRes.json()
    const xUser = userData.data
    const externalUserId: string = xUser.id
    const displayName: string = xUser.name
    const username: string = xUser.username
    const profileImageUrl: string | undefined = xUser.profile_image_url

    const encryptedAccessToken = encryptToken(accessToken)
    const encryptedRefreshToken = refreshToken ? encryptToken(refreshToken) : null

    const admin = createAdminClient()

    const { data: connection, error: connErr } = await admin
      .from('smm_oauth_connections')
      .upsert(
        {
          workspace_id: wid,
          platform: 'x',
          authorized_by_user_id: user.id,
          external_user_id: externalUserId,
          encrypted_access_token: encryptedAccessToken,
          encrypted_refresh_token: encryptedRefreshToken,
          token_expires_at: tokenExpiresAt,
          granted_scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
          status: 'active',
          last_verified_at: new Date().toISOString(),
        },
        { onConflict: 'workspace_id,platform,external_user_id', ignoreDuplicates: false },
      )
      .select('id')
      .single()

    if (connErr || !connection) {
      console.error('Failed to upsert X oauth connection:', connErr)
      return errorRedirect(wid, 'connection_failed')
    }

    const { error: destErr } = await admin.from('smm_social_destinations').upsert(
      {
        workspace_id: wid,
        oauth_connection_id: connection.id,
        platform: 'x',
        external_destination_id: externalUserId,
        destination_type: 'profile',
        display_name: displayName,
        username: username ?? null,
        profile_image_url: profileImageUrl ?? null,
        status: 'active',
      },
      { onConflict: 'workspace_id,platform,external_destination_id', ignoreDuplicates: false },
    )

    if (destErr) console.error('Failed to upsert X destination:', destErr)

    await admin.from('smm_audit_logs').insert({
      workspace_id: wid,
      actor_user_id: user.id,
      action: 'connection:connected',
      entity_type: 'oauth_connection',
      entity_id: connection.id,
      safe_metadata_json: { platform: 'x', username, external_user_id: externalUserId },
    })

    return NextResponse.redirect(`${BASE_URL}/oauth/done?platform=x`)
  } catch (err) {
    console.error('X OAuth callback error:', err)
    return errorRedirect(workspaceId, 'connection_failed')
  }
}

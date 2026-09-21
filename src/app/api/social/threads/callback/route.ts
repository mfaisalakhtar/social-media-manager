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
  const storedState = cookieStore.get('smm_threads_state')?.value ?? null

  const workspaceId = storedState ? storedState.split(':')[0] : null

  if (oauthError) return errorRedirect(workspaceId, 'oauth_denied')
  if (!code || !state) return errorRedirect(workspaceId, 'oauth_invalid')
  if (!storedState || state !== storedState) return errorRedirect(workspaceId, 'state_mismatch')

  const wid = workspaceId!
  cookieStore.set('smm_threads_state', '', { maxAge: 0, path: '/' })

  try {
    let user: Awaited<ReturnType<typeof getUser>>
    try { user = await getUser() } catch { return errorRedirect(wid, 'unauthenticated') }

    const redirectUri =
      process.env.THREADS_REDIRECT_URI ??
      `${BASE_URL}/api/social/threads/callback`

    // Step 1: Exchange code for short-lived token
    const threadsAppId = process.env.THREADS_APP_ID ?? process.env.META_APP_ID!
    const threadsAppSecret = process.env.THREADS_APP_SECRET ?? process.env.META_APP_SECRET!
    const shortTokenBody = new URLSearchParams({
      client_id: threadsAppId,
      client_secret: threadsAppSecret,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code,
    })

    const shortTokenRes = await fetch('https://graph.threads.net/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: shortTokenBody.toString(),
    })

    if (!shortTokenRes.ok) {
      console.error('Threads short token exchange failed:', await shortTokenRes.text())
      return errorRedirect(wid, 'connection_failed')
    }

    const shortTokenData = await shortTokenRes.json()
    const shortLivedToken: string = shortTokenData.access_token
    const externalUserId: string = String(shortTokenData.user_id)

    // Step 2: Exchange for long-lived token (~60 days)
    const longTokenParams = new URLSearchParams({
      grant_type: 'th_exchange_token',
      client_secret: threadsAppSecret,
      access_token: shortLivedToken,
    })

    const longTokenRes = await fetch(
      `https://graph.threads.net/access_token?${longTokenParams.toString()}`,
    )

    if (!longTokenRes.ok) {
      console.error('Threads long token exchange failed:', await longTokenRes.text())
      return errorRedirect(wid, 'connection_failed')
    }

    const longTokenData = await longTokenRes.json()
    const accessToken: string = longTokenData.access_token
    const expiresIn: number = longTokenData.expires_in ?? 5184000
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

    // Step 3: Get Threads user profile
    const profileRes = await fetch(
      `https://graph.threads.net/v1.0/me?fields=id,username,name,threads_profile_picture_url&access_token=${accessToken}`,
    )

    if (!profileRes.ok) {
      console.error('Threads /me failed:', await profileRes.text())
      return errorRedirect(wid, 'connection_failed')
    }

    const profileData = await profileRes.json()
    const displayName: string = profileData.name ?? profileData.username ?? 'Threads User'
    const username: string | undefined = profileData.username
    const profileImageUrl: string | undefined = profileData.threads_profile_picture_url

    const encryptedAccessToken = encryptToken(accessToken)
    const admin = createAdminClient()

    const { data: connection, error: connErr } = await admin
      .from('smm_oauth_connections')
      .upsert(
        {
          workspace_id: wid,
          platform: 'threads',
          authorized_by_user_id: user.id,
          external_user_id: externalUserId,
          encrypted_access_token: encryptedAccessToken,
          encrypted_refresh_token: null,
          token_expires_at: tokenExpiresAt,
          granted_scopes: ['threads_basic', 'threads_content_publish'],
          status: 'active',
          last_verified_at: new Date().toISOString(),
        },
        { onConflict: 'workspace_id,platform,external_user_id', ignoreDuplicates: false },
      )
      .select('id')
      .single()

    if (connErr || !connection) {
      console.error('Failed to upsert Threads oauth connection:', connErr)
      return errorRedirect(wid, 'connection_failed')
    }

    const { error: destErr } = await admin.from('smm_social_destinations').upsert(
      {
        workspace_id: wid,
        oauth_connection_id: connection.id,
        platform: 'threads',
        external_destination_id: externalUserId,
        destination_type: 'profile',
        display_name: displayName,
        username: username ?? null,
        profile_image_url: profileImageUrl ?? null,
        status: 'active',
      },
      { onConflict: 'workspace_id,platform,external_destination_id', ignoreDuplicates: false },
    )

    if (destErr) console.error('Failed to upsert Threads destination:', destErr)

    await admin.from('smm_audit_logs').insert({
      workspace_id: wid,
      actor_user_id: user.id,
      action: 'connection:connected',
      entity_type: 'oauth_connection',
      entity_id: connection.id,
      safe_metadata_json: { platform: 'threads', username, external_user_id: externalUserId },
    })

    return NextResponse.redirect(`${BASE_URL}/oauth/done?platform=threads`)
  } catch (err) {
    console.error('Threads OAuth callback error:', err)
    return errorRedirect(workspaceId, 'connection_failed')
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { encryptToken, decryptToken } from '@/lib/crypto'

export const runtime = 'nodejs'
export const maxDuration = 300

// ── Per-platform refresh helpers ────────────────────────────────────────────

async function refreshFacebook(token: string) {
  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    fb_exchange_token: token,
  })
  const res = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?${params}`)
  if (!res.ok) return null
  const data = await res.json()
  if (!data.access_token) return null
  const expiresIn: number = data.expires_in ?? 5184000
  return { token: data.access_token as string, expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString() }
}

async function refreshInstagram(token: string) {
  // Instagram Business Login long-lived tokens — try IG refresh first
  const params = new URLSearchParams({ grant_type: 'ig_refresh_token', access_token: token })
  const res = await fetch(`https://graph.instagram.com/refresh_access_token?${params}`)
  if (!res.ok) {
    // Fall back to Meta exchange (for tokens obtained via Facebook page token)
    return refreshFacebook(token)
  }
  const data = await res.json()
  if (!data.access_token) return refreshFacebook(token)
  const expiresIn: number = data.expires_in ?? 5184000
  return { token: data.access_token as string, expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString() }
}

async function refreshThreads(token: string) {
  const params = new URLSearchParams({ grant_type: 'th_refresh_token', access_token: token })
  const res = await fetch(`https://graph.threads.net/refresh_access_token?${params}`)
  if (!res.ok) return null
  const data = await res.json()
  if (!data.access_token) return null
  const expiresIn: number = data.expires_in ?? 5184000
  return { token: data.access_token as string, expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString() }
}

async function refreshLinkedIn(refreshToken: string) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: process.env.LINKEDIN_CLIENT_ID!,
    client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
  })
  const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  if (!res.ok) return null
  const data = await res.json()
  if (!data.access_token) return null
  const expiresIn: number = data.expires_in ?? 5184000
  return {
    token: data.access_token as string,
    newRefreshToken: (data.refresh_token as string | undefined) ?? refreshToken,
    expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
  }
}

async function refreshX(refreshToken: string) {
  const credentials = Buffer.from(
    `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`,
  ).toString('base64')
  const body = new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken })
  const res = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: body.toString(),
  })
  if (!res.ok) return null
  const data = await res.json()
  if (!data.access_token) return null
  const expiresIn: number = data.expires_in ?? 7200
  return {
    token: data.access_token as string,
    newRefreshToken: (data.refresh_token as string | undefined) ?? refreshToken,
    expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
  }
}

// ── Cron handler ─────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  // Verify Vercel cron secret (Vercel sends this automatically)
  const auth = request.headers.get('authorization')
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  // Find all active connections expiring within the next 8 days
  const cutoff = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString()

  const { data: connections, error } = await admin
    .from('smm_oauth_connections')
    .select('id, platform, encrypted_access_token, encrypted_refresh_token, token_expires_at')
    .eq('status', 'active')
    .lt('token_expires_at', cutoff)

  if (error) {
    console.error('[cron/refresh-tokens] DB error:', error)
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  }

  const stats = { refreshed: 0, failed: 0, skipped: 0 }

  for (const conn of connections ?? []) {
    try {
      const accessToken = decryptToken(conn.encrypted_access_token)
      const refreshToken = conn.encrypted_refresh_token
        ? decryptToken(conn.encrypted_refresh_token)
        : null

      let newAccessToken: string | null = null
      let newRefreshToken: string | null = null
      let newExpiresAt: string | null = null

      if (conn.platform === 'facebook') {
        const r = await refreshFacebook(accessToken)
        if (r) { newAccessToken = r.token; newExpiresAt = r.expiresAt }
      } else if (conn.platform === 'instagram') {
        const r = await refreshInstagram(accessToken)
        if (r) { newAccessToken = r.token; newExpiresAt = r.expiresAt }
      } else if (conn.platform === 'threads') {
        const r = await refreshThreads(accessToken)
        if (r) { newAccessToken = r.token; newExpiresAt = r.expiresAt }
      } else if (conn.platform === 'linkedin' && refreshToken) {
        const r = await refreshLinkedIn(refreshToken)
        if (r) { newAccessToken = r.token; newRefreshToken = r.newRefreshToken; newExpiresAt = r.expiresAt }
      } else if (conn.platform === 'x' && refreshToken) {
        const r = await refreshX(refreshToken)
        if (r) { newAccessToken = r.token; newRefreshToken = r.newRefreshToken; newExpiresAt = r.expiresAt }
      } else {
        // No refresh path available (e.g. X without refresh token stored)
        stats.skipped++
        continue
      }

      if (newAccessToken && newExpiresAt) {
        const patch: Record<string, string> = {
          encrypted_access_token: encryptToken(newAccessToken),
          token_expires_at: newExpiresAt,
          last_verified_at: new Date().toISOString(),
        }
        if (newRefreshToken) patch.encrypted_refresh_token = encryptToken(newRefreshToken)

        const { error: updateErr } = await admin
          .from('smm_oauth_connections')
          .update(patch)
          .eq('id', conn.id)

        if (updateErr) {
          console.error(`[cron] Failed to update connection ${conn.id}:`, updateErr)
          stats.failed++
        } else {
          stats.refreshed++
        }
      } else {
        // Refresh failed — mark connection as expired so the user is prompted to reconnect
        await admin
          .from('smm_oauth_connections')
          .update({ status: 'expired' })
          .eq('id', conn.id)

        // Also mark associated destinations as expired
        await admin
          .from('smm_social_destinations')
          .update({ status: 'expired' })
          .eq('oauth_connection_id', conn.id)

        console.warn(`[cron] Token refresh failed for connection ${conn.id} (${conn.platform}) — marked expired`)
        stats.failed++
      }
    } catch (err) {
      console.error(`[cron] Error processing connection ${conn.id}:`, err)
      stats.failed++
    }
  }

  console.log('[cron/refresh-tokens] Done:', stats)
  return NextResponse.json({ ok: true, processed: (connections ?? []).length, ...stats })
}

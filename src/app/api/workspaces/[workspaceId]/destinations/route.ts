import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { decryptToken } from '@/lib/crypto'
import { toApiError } from '@/lib/errors'
import { getUser } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'
import { encryptToken } from '@/lib/crypto'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const AVATAR_BUCKET = 'smm-avatars'

/** Returns true if this URL is a known expiring CDN (Instagram / LinkedIn). */
function isExpiringUrl(url: string | null): boolean {
  if (!url) return true
  return url.includes('cdninstagram.com') ||
    url.includes('fbcdn.net') ||
    url.includes('media.licdn.com') ||
    url.includes('media-exp')
}

/** Download image from URL and upload to Supabase Storage. Returns permanent public URL. */
async function storeAvatarPermanently(
  db: ReturnType<typeof createAdminClient>,
  sourceUrl: string,
  destId: string,
): Promise<string | null> {
  try {
    const res = await fetch(sourceUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SMMBot/1.0)' },
    })
    if (!res.ok) return null

    const contentType = res.headers.get('content-type') ?? 'image/jpeg'
    const ext = contentType.includes('png') ? 'png' : 'jpg'
    const buf = Buffer.from(await res.arrayBuffer())
    const path = `avatars/${destId}.${ext}`

    const { error } = await db.storage
      .from(AVATAR_BUCKET)
      .upload(path, buf, { contentType, upsert: true })

    if (error) return null

    const { data } = db.storage.from(AVATAR_BUCKET).getPublicUrl(path)
    return data.publicUrl ?? null
  } catch {
    return null
  }
}

/** Re-fetch profile image from Instagram using stored access token. */
async function refreshInstagramAvatar(encryptedToken: string): Promise<string | null> {
  try {
    const token = decryptToken(encryptedToken)
    const res = await fetch(
      `https://graph.instagram.com/me?fields=profile_picture_url&access_token=${token}`
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.profile_picture_url ?? null
  } catch {
    return null
  }
}

/** Re-fetch profile image from LinkedIn using stored access token. */
async function refreshLinkedInAvatar(encryptedToken: string): Promise<string | null> {
  try {
    const token = decryptToken(encryptedToken)
    const res = await fetch('https://api.linkedin.com/v2/me?projection=(id,profilePicture(displayImage~:playableStreams))', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    const data = await res.json()
    const elements = data?.profilePicture?.['displayImage~']?.elements
    if (!elements?.length) return null
    // Get the largest available image
    const sorted = [...elements].sort((a, b) =>
      (b.data?.['com.linkedin.digitalmedia.mediaartifact.StillImage']?.storageSize?.width ?? 0) -
      (a.data?.['com.linkedin.digitalmedia.mediaartifact.StillImage']?.storageSize?.width ?? 0)
    )
    return sorted[0]?.identifiers?.[0]?.identifier ?? null
  } catch {
    return null
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params
    try { await getUser() } catch { return NextResponse.json({ data: null, error: { message: 'Unauthorized' } }, { status: 401 }) }

    const { searchParams } = new URL(req.url)
    const statusFilter = searchParams.get('status')

    const db = createAdminClient()

    // Fetch destinations joined with oauth connection token for refresh capability
    let query = db.from('smm_social_destinations')
      .select('id, platform, display_name, username, destination_type, status, profile_image_url, oauth_connection_id, smm_oauth_connections(encrypted_access_token)')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: true })

    if (statusFilter) {
      query = query.eq('status', statusFilter)
    } else {
      query = query.neq('status', 'disconnected')
    }

    const { data: rows } = await query
    if (!rows?.length) return NextResponse.json({ data: [], error: null })

    // Refresh stale profile images in the background (fire & forget)
    const needsRefresh = rows.filter(r =>
      (r.platform === 'instagram' || r.platform === 'linkedin') &&
      isExpiringUrl(r.profile_image_url)
    )

    if (needsRefresh.length > 0) {
      // Run refresh without awaiting — don't block the response
      Promise.all(needsRefresh.map(async (dest) => {
        try {
          const conn = Array.isArray(dest.smm_oauth_connections)
            ? dest.smm_oauth_connections[0]
            : dest.smm_oauth_connections as { encrypted_access_token: string } | null
          if (!conn?.encrypted_access_token) return

          // Get fresh CDN URL from platform
          let freshUrl: string | null = null
          if (dest.platform === 'instagram') {
            freshUrl = await refreshInstagramAvatar(conn.encrypted_access_token)
          } else if (dest.platform === 'linkedin') {
            freshUrl = await refreshLinkedInAvatar(conn.encrypted_access_token)
          }
          if (!freshUrl) return

          // Try to store permanently in Supabase Storage (survives CDN expiry)
          const permanentUrl = await storeAvatarPermanently(db, freshUrl, dest.id)

          // Use permanent Storage URL if available, else fall back to fresh CDN URL
          await db.from('smm_social_destinations')
            .update({ profile_image_url: permanentUrl ?? freshUrl })
            .eq('id', dest.id)
        } catch { /* silent */ }
      })).catch(() => {})
    }

    // Strip the joined connection data before returning
    const data = rows.map(({ smm_oauth_connections: _, ...rest }) => rest)
    return NextResponse.json({ data, error: null })
  } catch (err) {
    const e = toApiError(err)
    return NextResponse.json({ data: null, error: e }, { status: e.status })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params
    let user: Awaited<ReturnType<typeof getUser>>
    try { user = await getUser() } catch { return NextResponse.json({ data: null, error: { message: 'Unauthorized' } }, { status: 401 }) }

    const { platform, display_name, username } = await request.json()
    if (!platform) return NextResponse.json({ data: null, error: { message: 'platform required' } }, { status: 422 })

    const db = createAdminClient()
    const encryptedToken = encryptToken(`mock_access_token_${platform}_${uuidv4()}`)

    const { data: conn } = await db.from('smm_oauth_connections').insert({
      workspace_id: workspaceId,
      platform,
      authorized_by_user_id: user.id,
      external_user_id: `mock_user_${uuidv4()}`,
      encrypted_access_token: encryptedToken,
      granted_scopes: ['publish', 'read_insights'],
      status: 'active',
      last_verified_at: new Date().toISOString(),
    }).select().single()

    const destType = platform === 'instagram' ? 'profile' : platform === 'linkedin' ? 'organization' : 'page'
    const name = display_name || `My ${platform} Page`
    const handle = username || name.toLowerCase().replace(/\s+/g, '')

    const { data: created } = await db.from('smm_social_destinations').insert({
      workspace_id: workspaceId,
      oauth_connection_id: conn!.id,
      platform,
      external_destination_id: `mock_${platform}_${uuidv4()}`,
      destination_type: destType,
      display_name: name,
      username: handle,
      status: 'active',
    }).select()

    await db.from('smm_audit_logs').insert({
      workspace_id: workspaceId,
      actor_user_id: user.id,
      action: 'connection:connected',
      entity_type: 'oauth_connection',
      entity_id: conn!.id,
      safe_metadata_json: { description: `Connected ${platform}: ${name}` }
    })

    return NextResponse.json({ data: created, error: null }, { status: 201 })
  } catch (err) {
    const e = toApiError(err)
    return NextResponse.json({ data: null, error: e }, { status: e.status })
  }
}

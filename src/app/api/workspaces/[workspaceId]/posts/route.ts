import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { toApiError } from '@/lib/errors'
import { getUser } from '@/lib/auth'
import { getAdapter } from '@/lib/adapters/registry'
import { decryptToken } from '@/lib/crypto'
import { v4 as uuidv4 } from 'uuid'

const Schema = z.object({
  common_caption: z.string().min(1),
  link_url: z.string().url().nullable().optional(),
  media_urls: z.array(z.string().url()).optional(),
  destination_ids: z.array(z.string()).min(1),
  action: z.enum(['draft', 'submit', 'publish', 'schedule']).default('draft'),
  scheduled_at_utc: z.string().datetime().optional(),
  platform_captions: z.record(z.string()).optional(),
  destination_captions: z.record(z.string()).optional(),
})

export async function GET(
  req: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params
    let user: Awaited<ReturnType<typeof getUser>>
    try { user = await getUser() } catch { return NextResponse.json({ data: null, error: { message: 'Unauthorized' } }, { status: 401 }) }

    const url = new URL(req.url)
    const status = url.searchParams.get('status')
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')

    const db = createAdminClient()
    let query = db
      .from('smm_posts')
      .select('id, common_caption, status, scheduled_at_utc, created_at, media_urls, author:smm_users!author_user_id(name)')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })

    if (!from && !to) {
      query = query.limit(50)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (from) {
      query = query.gte('scheduled_at_utc', from)
    }

    if (to) {
      query = query.lte('scheduled_at_utc', to)
    }

    const { data, error: dbErr } = await query
    if (dbErr) console.error('[posts GET]', dbErr)
    return NextResponse.json({ data: data ?? [], error: null })
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

    const body = await request.json()
    const input = Schema.parse(body)
    const db = createAdminClient()

    // Verify destinations belong to this workspace
    const { data: destinations } = await db.from('smm_social_destinations')
      .select('id, platform, external_destination_id, oauth_connection_id')
      .eq('workspace_id', workspaceId)
      .in('id', input.destination_ids)
    if (!destinations?.length) throw new Error('No valid destinations found')

    // Create post
    if (input.action === 'schedule' && !input.scheduled_at_utc) {
      return NextResponse.json({ data: null, error: { message: 'scheduled_at_utc is required for schedule action' } }, { status: 400 })
    }

    const postStatus =
      input.action === 'submit' ? 'pending_approval' :
      input.action === 'publish' ? 'publishing' :
      input.action === 'schedule' ? 'scheduled' :
      'draft'

    const { data: post } = await db.from('smm_posts').insert({
      workspace_id: workspaceId,
      author_user_id: user.id,
      common_caption: input.common_caption,
      link_url: input.link_url ?? null,
      media_urls: input.media_urls ?? [],
      status: postStatus,
      scheduled_at_utc: input.scheduled_at_utc ?? null,
      submitted_at: input.action === 'submit' ? new Date().toISOString() : null,
    }).select().single()

    // Create variations — use per-destination caption, then platform caption, then null (falls back to common_caption)
    const variations = destinations.map(dest => ({
      post_id: post!.id,
      social_destination_id: dest.id,
      platform: dest.platform,
      caption: input.destination_captions?.[dest.id] ?? input.platform_captions?.[dest.platform] ?? null,
    }))
    const { data: createdVariations } = await db.from('smm_post_variations').insert(variations).select()

    // Audit log
    await db.from('smm_audit_logs').insert({
      workspace_id: workspaceId,
      actor_user_id: user.id,
      action: `post:${input.action}`,
      entity_type: 'post',
      entity_id: post!.id,
      safe_metadata_json: {
        description: `${
          input.action === 'draft' ? 'Saved draft' :
          input.action === 'submit' ? 'Submitted for approval' :
          input.action === 'schedule' ? 'Scheduled' :
          'Published'
        }: "${input.common_caption.slice(0, 60)}"`
      }
    })

    // If publish: run adapter for each variation
    if (input.action === 'publish' && createdVariations) {
      const publishResults = await Promise.allSettled(
        createdVariations.map(async (variation) => {
          const dest = destinations.find(d => d.id === variation.social_destination_id)!
          const idempotencyKey = uuidv4()

          // Create publication record
          const { data: pub } = await db.from('smm_publications').insert({
            post_variation_id: variation.id,
            status: 'processing',
            idempotency_key: idempotencyKey,
          }).select().single()

          // Fetch and decrypt the real access token
          let accessToken = 'mock_token'
          if (process.env.USE_MOCK_ADAPTERS !== 'true' && dest.oauth_connection_id) {
            const { data: conn } = await db
              .from('smm_oauth_connections')
              .select('encrypted_access_token')
              .eq('id', dest.oauth_connection_id)
              .single()
            if (conn?.encrypted_access_token) {
              accessToken = decryptToken(conn.encrypted_access_token)
            }
          }

          const adapter = getAdapter(dest.platform)
          let result
          try {
            result = await adapter.publishPost({
              publicationId: pub!.id,
              idempotencyKey,
              platform: dest.platform as 'facebook' | 'instagram' | 'linkedin',
              destinationExternalId: dest.external_destination_id,
              accessToken,
              caption: variation.caption ?? input.common_caption,
              linkUrl: input.link_url ?? undefined,
              mediaUrls: input.media_urls ?? undefined,
            })
          } catch (pubErr) {
            const msg = pubErr instanceof Error ? pubErr.message : 'Unknown error'
            await db.from('smm_publications').update({
              status: 'failed',
              last_error_message: msg,
            }).eq('id', pub!.id)
            throw pubErr
          }

          // Update publication
          await db.from('smm_publications').update({
            status: 'published',
            external_post_id: result.externalPostId,
            external_post_url: result.externalPostUrl,
            published_at: new Date().toISOString(),
            sanitized_response_json: result.sanitizedResponse,
          }).eq('id', pub!.id)

          return result
        })
      )

      const allOk = publishResults.every(r => r.status === 'fulfilled')
      const someOk = publishResults.some(r => r.status === 'fulfilled')
      const finalStatus = allOk ? 'published' : someOk ? 'partially_published' : 'failed'

      await db.from('smm_posts').update({ status: finalStatus }).eq('id', post!.id)

      if (finalStatus === 'published') {
        await db.from('smm_audit_logs').insert({
          workspace_id: workspaceId,
          actor_user_id: user.id,
          action: 'post:published',
          entity_type: 'post',
          entity_id: post!.id,
          safe_metadata_json: { description: `Published to ${destinations.length} destination(s)` }
        })
      }
    }

    return NextResponse.json({ data: post, error: null }, { status: 201 })
  } catch (err) {
    const e = toApiError(err)
    return NextResponse.json({ data: null, error: e }, { status: e.status })
  }
}

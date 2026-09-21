/**
 * Meta Platform Adapter — Facebook Pages + Instagram Professional Accounts
 *
 * Prerequisites before using in production:
 * 1. Create a Meta App at https://developers.facebook.com/apps/
 * 2. Add "Facebook Login" and "Instagram Graph API" products
 * 3. Configure OAuth redirect URIs (META_REDIRECT_URI in env)
 * 4. Request permissions: pages_manage_posts, pages_read_engagement,
 *    instagram_content_publish, instagram_basic
 * 5. Complete Meta App Review for permissions used by external users
 *
 * Docs:
 * - OAuth: https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow
 * - Instagram publishing: https://developers.facebook.com/docs/instagram-platform/content-publishing/
 * - FB Page posts: https://developers.facebook.com/docs/pages-api/posts
 */

import type {
  SocialPlatformAdapter,
  AuthorizationInput,
  OAuthCallbackInput,
  TokenResult,
  AdapterDestination,
  PlatformPostInput,
  ValidationResult,
  PublishResult,
  StatusInput,
  PlatformPostStatus,
  MetricsInput,
  PlatformMetrics,
  DeleteInput,
  DeleteResult,
} from './types'
import { PlatformError } from '@/lib/errors'

const GRAPH_BASE = 'https://graph.facebook.com/v19.0'

async function graphRequest<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = path.startsWith('http') ? path : `${GRAPH_BASE}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })
  const json = await res.json() as { error?: { message: string; code: number; type: string } } & T
  if (!res.ok || json.error) {
    const msg = json.error?.message ?? `HTTP ${res.status}`
    throw new PlatformError('facebook', msg, res.status >= 500, String(json.error?.code))
  }
  return json
}

export class MetaAdapter implements SocialPlatformAdapter {
  async getAuthorizationUrl(_input: AuthorizationInput): Promise<string> {
    throw new Error(
      'MetaAdapter not yet configured. Set META_APP_ID, META_APP_SECRET, META_REDIRECT_URI and complete Meta App Review.',
    )
  }

  async exchangeAuthorizationCode(_input: OAuthCallbackInput): Promise<TokenResult> {
    throw new Error('MetaAdapter: exchangeAuthorizationCode not implemented.')
  }

  async refreshAccessToken(_connectionId: string): Promise<TokenResult> {
    throw new Error('MetaAdapter: refreshAccessToken not implemented.')
  }

  async listDestinations(_connectionId: string): Promise<AdapterDestination[]> {
    throw new Error('MetaAdapter: listDestinations not implemented.')
  }

  async validatePost(_input: PlatformPostInput): Promise<ValidationResult> {
    return { valid: true, errors: [] }
  }

  async publishPost(input: PlatformPostInput): Promise<PublishResult> {
    if (input.platform === 'instagram') {
      return this.publishInstagramPost(input)
    }

    const pageId = input.destinationExternalId
    const hasMedia = input.mediaUrls && input.mediaUrls.length > 0

    let externalPostId: string

    if (hasMedia) {
      const mediaUrls = input.mediaUrls!

      if (mediaUrls.length === 1) {
        // Single image: POST /{pageId}/photos — creates a photo post directly
        const result = await graphRequest<{ id: string }>(
          `/${pageId}/photos`,
          {
            method: 'POST',
            body: JSON.stringify({
              url: mediaUrls[0],
              caption: input.caption,
              access_token: input.accessToken,
            }),
          },
        )
        // /photos returns { id } which is the photo id; the post id is page_photo_id
        externalPostId = `${pageId}_${result.id}`
      } else {
        // Multiple images: stage each unpublished, then post to feed with attached_media
        const photoIds = await Promise.all(
          mediaUrls.map(url =>
            graphRequest<{ id: string }>(
              `/${pageId}/photos`,
              {
                method: 'POST',
                body: JSON.stringify({
                  url,
                  published: false,
                  access_token: input.accessToken,
                }),
              },
            ).then(r => r.id),
          ),
        )

        const feedBody: Record<string, unknown> = {
          message: input.caption,
          attached_media: photoIds.map(id => ({ media_fbid: id })),
          access_token: input.accessToken,
        }
        if (input.linkUrl) feedBody.link = input.linkUrl

        const result = await graphRequest<{ id: string }>(
          `/${pageId}/feed`,
          { method: 'POST', body: JSON.stringify(feedBody) },
        )
        externalPostId = result.id
      }
    } else {
      // Text-only (or link) post
      const body: Record<string, unknown> = {
        message: input.caption,
        access_token: input.accessToken,
      }
      if (input.linkUrl) body.link = input.linkUrl

      const result = await graphRequest<{ id: string }>(
        `/${pageId}/feed`,
        { method: 'POST', body: JSON.stringify(body) },
      )
      externalPostId = result.id
    }

    const [pid, postId] = externalPostId.split('_')
    const externalPostUrl = `https://www.facebook.com/${pid}/posts/${postId}`

    return {
      externalPostId,
      externalPostUrl,
      sanitizedResponse: {
        id: externalPostId,
        platform: 'facebook',
        destinationId: pageId,
        hasMedia,
      },
    }
  }

  private async publishInstagramPost(input: PlatformPostInput): Promise<PublishResult> {
    const igUserId = input.destinationExternalId
    const mediaUrls = input.mediaUrls ?? []

    let creationId: string

    if (mediaUrls.length === 0) {
      // Text-only post (no media) — Instagram supports caption-only via text post type
      const container = await graphRequest<{ id: string }>(
        `/${igUserId}/media`,
        {
          method: 'POST',
          body: JSON.stringify({
            media_type: 'TEXT',
            text: input.caption,
            access_token: input.accessToken,
          }),
        },
      )
      creationId = container.id
    } else if (mediaUrls.length === 1) {
      // Single image post
      const container = await graphRequest<{ id: string }>(
        `/${igUserId}/media`,
        {
          method: 'POST',
          body: JSON.stringify({
            image_url: mediaUrls[0],
            caption: input.caption,
            access_token: input.accessToken,
          }),
        },
      )
      creationId = container.id
    } else {
      // Carousel post — create a container per image (no caption), then a carousel container
      const childIds = await Promise.all(
        mediaUrls.map(url =>
          graphRequest<{ id: string }>(
            `/${igUserId}/media`,
            {
              method: 'POST',
              body: JSON.stringify({
                image_url: url,
                is_carousel_item: true,
                access_token: input.accessToken,
              }),
            },
          ).then(r => r.id),
        ),
      )

      const carousel = await graphRequest<{ id: string }>(
        `/${igUserId}/media`,
        {
          method: 'POST',
          body: JSON.stringify({
            media_type: 'CAROUSEL',
            children: childIds.join(','),
            caption: input.caption,
            access_token: input.accessToken,
          }),
        },
      )
      creationId = carousel.id
    }

    // Poll until container is ready (status_code = FINISHED), then publish
    await this.waitForContainer(igUserId, creationId, input.accessToken)

    const published = await graphRequest<{ id: string }>(
      `/${igUserId}/media_publish`,
      {
        method: 'POST',
        body: JSON.stringify({
          creation_id: creationId,
          access_token: input.accessToken,
        }),
      },
    )

    const externalPostId = published.id
    const externalPostUrl = `https://www.instagram.com/p/${externalPostId}/`

    return {
      externalPostId,
      externalPostUrl,
      sanitizedResponse: {
        id: externalPostId,
        platform: 'instagram',
        destinationId: igUserId,
        mediaCount: mediaUrls.length,
      },
    }
  }

  /** Poll the container status until FINISHED or ERROR (max ~30 s) */
  private async waitForContainer(igUserId: string, containerId: string, accessToken: string): Promise<void> {
    const maxAttempts = 12
    const delayMs = 2500

    for (let i = 0; i < maxAttempts; i++) {
      const status = await graphRequest<{ status_code: string; id: string }>(
        `/${containerId}?fields=status_code&access_token=${encodeURIComponent(accessToken)}`,
      )

      if (status.status_code === 'FINISHED') return
      if (status.status_code === 'ERROR') {
        throw new PlatformError('instagram', 'Instagram media container failed to process.', false)
      }
      // IN_PROGRESS or PUBLISHED — wait and retry
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }

    throw new PlatformError('instagram', 'Instagram media container timed out.', true)
  }

  async getPostStatus(input: StatusInput): Promise<PlatformPostStatus> {
    const result = await graphRequest<{ id: string; is_published?: boolean }>(
      `/${input.externalPostId}?fields=id,is_published&access_token=${encodeURIComponent(input.accessToken)}`,
    )
    return {
      externalPostId: result.id,
      isLive: result.is_published !== false,
      isDeleted: false,
      rawStatus: result.is_published ? 'published' : 'unpublished',
    }
  }

  async getPostMetrics(input: MetricsInput): Promise<PlatformMetrics> {
    const metrics = 'post_impressions,post_reach,post_reactions_by_type_total,post_clicks'
    const result = await graphRequest<{ data: Array<{ name: string; values: Array<{ value: number | Record<string, number> }> }> }>(
      `/${input.externalPostId}/insights?metric=${metrics}&access_token=${encodeURIComponent(input.accessToken)}`,
    )

    const findMetric = (name: string) => {
      const item = result.data?.find(d => d.name === name)
      const val = item?.values?.[0]?.value
      if (typeof val === 'number') return val
      if (typeof val === 'object' && val !== null) return Object.values(val).reduce((a, b) => a + b, 0)
      return undefined
    }

    return {
      impressions: findMetric('post_impressions'),
      reach: findMetric('post_reach'),
      reactions: findMetric('post_reactions_by_type_total'),
      clicks: findMetric('post_clicks'),
      raw: { data: result.data },
    }
  }

  async deletePost(input: DeleteInput): Promise<DeleteResult> {
    await graphRequest(
      `/${input.externalPostId}?access_token=${encodeURIComponent(input.accessToken)}`,
      { method: 'DELETE' },
    )
    return { deleted: true }
  }
}

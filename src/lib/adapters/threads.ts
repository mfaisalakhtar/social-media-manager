/**
 * Threads Platform Adapter — Personal profiles via Threads API
 *
 * Prerequisites before using in production:
 * 1. Add "Threads API" product to your existing Meta App at https://developers.facebook.com/apps/
 * 2. Configure Threads OAuth redirect URI (THREADS_REDIRECT_URI in env)
 * 3. Required scopes: threads_basic, threads_content_publish
 * 4. Complete Meta App Review for threads_content_publish permission
 *
 * Docs:
 * - OAuth: https://developers.facebook.com/docs/threads/get-started/get-access-tokens-and-permissions
 * - Publishing: https://developers.facebook.com/docs/threads/posts
 * - Single image: create container → publish
 * - Text posts: single API call
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

const THREADS_API = 'https://graph.threads.net/v1.0'

async function threadsRequest<T = unknown>(
  path: string,
  accessToken: string,
  options: RequestInit = {},
): Promise<T> {
  const sep = path.includes('?') ? '&' : '?'
  const url = path.startsWith('http')
    ? path
    : `${THREADS_API}${path}${sep}access_token=${encodeURIComponent(accessToken)}`
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
  })
  const json = await res.json() as { error?: { message: string; code: number } } & T
  if (!res.ok || (json as { error?: unknown }).error) {
    const msg = (json as { error?: { message: string } }).error?.message ?? `HTTP ${res.status}`
    throw new PlatformError('threads', msg, res.status >= 500)
  }
  return json
}

// Polls until the media container is FINISHED (up to 30s)
async function waitForContainer(
  containerId: string,
  accessToken: string,
  maxAttempts = 10,
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await threadsRequest<{ status: string }>(
      `/me/threads/${containerId}?fields=status`,
      accessToken,
    )
    if (result.status === 'FINISHED') return
    if (result.status === 'ERROR') throw new PlatformError('threads', 'Media container creation failed', false)
    await new Promise(r => setTimeout(r, 3000))
  }
  throw new PlatformError('threads', 'Media container timed out', false)
}

export class ThreadsAdapter implements SocialPlatformAdapter {
  async getAuthorizationUrl(_input: AuthorizationInput): Promise<string> {
    throw new Error('ThreadsAdapter: use /api/social/threads/connect route for OAuth flow.')
  }

  async exchangeAuthorizationCode(_input: OAuthCallbackInput): Promise<TokenResult> {
    throw new Error('ThreadsAdapter: use /api/social/threads/callback route for token exchange.')
  }

  async refreshAccessToken(_connectionId: string): Promise<TokenResult> {
    // Threads long-lived tokens can be refreshed:
    // GET https://graph.threads.net/refresh_access_token?grant_type=th_refresh_token&access_token=...
    throw new Error('ThreadsAdapter: refreshAccessToken not yet implemented.')
  }

  async listDestinations(_connectionId: string): Promise<AdapterDestination[]> {
    throw new Error('ThreadsAdapter: listDestinations not implemented (profile is set at connect time).')
  }

  async validatePost(input: PlatformPostInput): Promise<ValidationResult> {
    const errors = []
    if (!input.caption?.trim()) {
      errors.push({ field: 'caption', code: 'REQUIRED', message: 'Thread text is required.' })
    } else if (input.caption.length > 500) {
      errors.push({ field: 'caption', code: 'TOO_LONG', message: 'Thread must be 500 characters or fewer.' })
    }
    return { valid: errors.length === 0, errors }
  }

  async publishPost(input: PlatformPostInput): Promise<PublishResult> {
    const userId = input.destinationExternalId

    let containerId: string

    if (input.mediaUrls?.length) {
      // Image post: create media container first
      const containerBody: Record<string, string> = {
        media_type: 'IMAGE',
        image_url: input.mediaUrls[0],
        text: input.caption,
      }

      const container = await threadsRequest<{ id: string }>(
        `/me/threads`,
        input.accessToken,
        {
          method: 'POST',
          body: JSON.stringify({ ...containerBody, access_token: input.accessToken }),
        },
      )
      containerId = container.id

      // Wait for container to be ready
      await waitForContainer(containerId, input.accessToken)
    } else {
      // Text-only post: create container
      const container = await threadsRequest<{ id: string }>(
        `/me/threads`,
        input.accessToken,
        {
          method: 'POST',
          body: JSON.stringify({
            media_type: 'TEXT',
            text: input.caption,
            access_token: input.accessToken,
          }),
        },
      )
      containerId = container.id
    }

    // Publish the container
    const published = await threadsRequest<{ id: string }>(
      `/me/threads_publish`,
      input.accessToken,
      {
        method: 'POST',
        body: JSON.stringify({
          creation_id: containerId,
          access_token: input.accessToken,
        }),
      },
    )

    const externalPostId = published.id

    return {
      externalPostId,
      externalPostUrl: `https://www.threads.net/@${userId}/post/${externalPostId}`,
      sanitizedResponse: { id: externalPostId, platform: 'threads', destinationId: userId },
    }
  }

  async getPostStatus(input: StatusInput): Promise<PlatformPostStatus> {
    const result = await threadsRequest<{ id: string; timestamp?: string }>(
      `/${input.externalPostId}?fields=id,timestamp`,
      input.accessToken,
    )
    return {
      externalPostId: result.id,
      isLive: !!result.id,
      isDeleted: false,
      rawStatus: 'published',
    }
  }

  async getPostMetrics(input: MetricsInput): Promise<PlatformMetrics> {
    const result = await threadsRequest<{
      data: Array<{ name: string; values: Array<{ value: number }> }>
    }>(
      `/${input.externalPostId}/insights?metric=views,likes,replies,reposts,quotes`,
      input.accessToken,
    )

    const find = (name: string) => result.data?.find(d => d.name === name)?.values?.[0]?.value

    return {
      impressions: find('views'),
      reactions: find('likes'),
      comments: find('replies'),
      shares: (find('reposts') ?? 0) + (find('quotes') ?? 0),
      raw: { data: result.data },
    }
  }

  async deletePost(input: DeleteInput): Promise<DeleteResult> {
    await threadsRequest(
      `/${input.externalPostId}`,
      input.accessToken,
      { method: 'DELETE' },
    )
    return { deleted: true }
  }
}

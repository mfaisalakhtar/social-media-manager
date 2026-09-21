/**
 * X (Twitter) Platform Adapter — Personal profiles via API v2
 *
 * Prerequisites before using in production:
 * 1. Create a project + app at https://developer.twitter.com/en/portal/dashboard
 * 2. Enable OAuth 2.0 with PKCE (User authentication settings)
 * 3. Set callback URL to TWITTER_REDIRECT_URI
 * 4. Request scopes: tweet.read, tweet.write, users.read, offline.access
 * 5. Set TWITTER_CLIENT_ID and TWITTER_CLIENT_SECRET in environment
 *
 * Docs:
 * - OAuth 2.0 PKCE: https://developer.twitter.com/en/docs/authentication/oauth-2-0/authorization-code
 * - Tweets: https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets
 * - Media: https://developer.twitter.com/en/docs/twitter-api/v1/media/upload-media/api-reference/post-media-upload
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

const X_API = 'https://api.twitter.com/2'

async function xRequest<T = unknown>(
  path: string,
  accessToken: string,
  options: RequestInit = {},
): Promise<T> {
  const url = path.startsWith('http') ? path : `${X_API}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })
  const json = await res.json() as { errors?: Array<{ message: string; code: number }> } & T
  if (!res.ok) {
    const msg = json.errors?.[0]?.message ?? `HTTP ${res.status}`
    throw new PlatformError('x', msg, res.status >= 500, String(json.errors?.[0]?.code))
  }
  return json
}

export class XAdapter implements SocialPlatformAdapter {
  async getAuthorizationUrl(_input: AuthorizationInput): Promise<string> {
    throw new Error('XAdapter: use /api/social/x/connect route for OAuth flow.')
  }

  async exchangeAuthorizationCode(_input: OAuthCallbackInput): Promise<TokenResult> {
    throw new Error('XAdapter: use /api/social/x/callback route for token exchange.')
  }

  async refreshAccessToken(_connectionId: string): Promise<TokenResult> {
    // X OAuth 2.0 with offline.access grants refresh tokens
    // POST https://api.twitter.com/2/oauth2/token (Basic Auth)
    throw new Error('XAdapter: refreshAccessToken not yet implemented.')
  }

  async listDestinations(_connectionId: string): Promise<AdapterDestination[]> {
    throw new Error('XAdapter: listDestinations not implemented (profile is set at connect time).')
  }

  async validatePost(input: PlatformPostInput): Promise<ValidationResult> {
    const errors = []
    if (!input.caption?.trim()) {
      errors.push({ field: 'caption', code: 'REQUIRED', message: 'Tweet text is required.' })
    } else if (input.caption.length > 280) {
      errors.push({ field: 'caption', code: 'TOO_LONG', message: 'Tweet must be 280 characters or fewer.' })
    }
    return { valid: errors.length === 0, errors }
  }

  async publishPost(input: PlatformPostInput): Promise<PublishResult> {
    const body: Record<string, unknown> = { text: input.caption }

    const result = await xRequest<{ data: { id: string; text: string } }>(
      '/tweets',
      input.accessToken,
      { method: 'POST', body: JSON.stringify(body) },
    )

    const tweetId = result.data.id
    const username = input.destinationExternalId // stored as username at connect time
    const externalPostUrl = `https://x.com/${username}/status/${tweetId}`

    return {
      externalPostId: tweetId,
      externalPostUrl,
      sanitizedResponse: { id: tweetId, platform: 'x', destinationId: input.destinationExternalId },
    }
  }

  async getPostStatus(input: StatusInput): Promise<PlatformPostStatus> {
    const result = await xRequest<{ data?: { id: string } }>(
      `/tweets/${input.externalPostId}`,
      input.accessToken,
    )
    return {
      externalPostId: input.externalPostId,
      isLive: !!result.data,
      isDeleted: !result.data,
      rawStatus: result.data ? 'live' : 'deleted',
    }
  }

  async getPostMetrics(input: MetricsInput): Promise<PlatformMetrics> {
    const result = await xRequest<{
      data?: {
        public_metrics?: {
          impression_count: number
          like_count: number
          reply_count: number
          retweet_count: number
          quote_count: number
          url_link_clicks: number
        }
      }
    }>(
      `/tweets/${input.externalPostId}?tweet.fields=public_metrics`,
      input.accessToken,
    )

    const m = result.data?.public_metrics
    return {
      impressions: m?.impression_count,
      reactions: m?.like_count,
      comments: m?.reply_count,
      shares: (m?.retweet_count ?? 0) + (m?.quote_count ?? 0),
      clicks: m?.url_link_clicks,
      raw: { public_metrics: m },
    }
  }

  async deletePost(input: DeleteInput): Promise<DeleteResult> {
    await xRequest<{ data: { deleted: boolean } }>(
      `/tweets/${input.externalPostId}`,
      input.accessToken,
      { method: 'DELETE' },
    )
    return { deleted: true }
  }
}

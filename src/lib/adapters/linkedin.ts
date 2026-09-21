/**
 * LinkedIn Platform Adapter — Organization Pages
 *
 * TODO before using:
 * 1. Create a LinkedIn App at https://www.linkedin.com/developers/apps
 * 2. Request "Share on LinkedIn" and "Marketing Developer Platform" products
 * 3. Configure OAuth redirect URIs
 * 4. Required scopes: w_organization_social, r_organization_social, r_liteprofile
 * 5. Verify the authorized user has ADMINISTRATOR or CONTENT_MANAGER role on the org page
 *
 * Docs:
 * - OAuth: https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow
 * - Posts API: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api
 * - Organization lookup: https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/organizations/organization-lookup-api
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
} from "./types";

export class LinkedInAdapter implements SocialPlatformAdapter {
  async getAuthorizationUrl(_input: AuthorizationInput): Promise<string> {
    throw new Error(
      "LinkedInAdapter not yet configured. Set LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, LINKEDIN_REDIRECT_URI.",
    );
  }

  async exchangeAuthorizationCode(_input: OAuthCallbackInput): Promise<TokenResult> {
    throw new Error("LinkedInAdapter: exchangeAuthorizationCode not implemented.");
  }

  async refreshAccessToken(_connectionId: string): Promise<TokenResult> {
    // TODO: LinkedIn tokens are valid for 60 days; refresh tokens are valid for 1 year
    // POST https://www.linkedin.com/oauth/v2/accessToken
    //   grant_type=refresh_token&refresh_token=...&client_id=...&client_secret=...
    throw new Error("LinkedInAdapter: refreshAccessToken not implemented.");
  }

  async listDestinations(_connectionId: string): Promise<AdapterDestination[]> {
    // TODO: GET https://api.linkedin.com/v2/organizationAcls?q=roleAssignee
    // Filter where role = ADMINISTRATOR or CONTENT_MANAGER
    // Store organizationId (urn:li:organization:{id}) separately from the member urn
    throw new Error("LinkedInAdapter: listDestinations not implemented.");
  }

  async validatePost(_input: PlatformPostInput): Promise<ValidationResult> {
    // TODO: Check caption length (max 3000), media type support, required fields
    throw new Error("LinkedInAdapter: validatePost not implemented.");
  }

  async publishPost(input: PlatformPostInput): Promise<PublishResult> {
    const { destinationExternalId, accessToken, caption, linkUrl } = input;

    // Personal profile: destinationExternalId is the OpenID sub (e.g. "abc123")
    // Company page:    destinationExternalId is "org:{orgId}"
    const isOrg = destinationExternalId.startsWith("org:");
    const entityId = isOrg ? destinationExternalId.slice(4) : destinationExternalId;
    const author = isOrg
      ? `urn:li:organization:${entityId}`
      : `urn:li:person:${entityId}`;

    const body: Record<string, unknown> = {
      author,
      commentary: caption,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    };

    if (linkUrl) {
      body.content = {
        article: { source: linkUrl },
      };
    }

    const res = await fetch("https://api.linkedin.com/rest/posts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
        "LinkedIn-Version": "202401",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`LinkedIn publish failed (${res.status}): ${errorText}`);
    }

    // LinkedIn returns the post URN in X-RestLi-Id header
    const postUrn = res.headers.get("x-restli-id") ?? res.headers.get("X-RestLi-Id") ?? "";
    const externalPostUrl = postUrn
      ? `https://www.linkedin.com/feed/update/${encodeURIComponent(postUrn)}/`
      : undefined;

    return {
      externalPostId: postUrn,
      externalPostUrl,
      sanitizedResponse: { postUrn, author },
    };
  }

  async getPostStatus(_input: StatusInput): Promise<PlatformPostStatus> {
    throw new Error("LinkedInAdapter: getPostStatus not implemented.");
  }

  async getPostMetrics(_input: MetricsInput): Promise<PlatformMetrics> {
    // TODO: GET https://api.linkedin.com/v2/organizationalEntityShareStatistics
    throw new Error("LinkedInAdapter: getPostMetrics not implemented.");
  }

  async deletePost(_input: DeleteInput): Promise<DeleteResult> {
    // TODO: DELETE https://api.linkedin.com/rest/posts/{postUrn}
    throw new Error("LinkedInAdapter: deletePost not implemented.");
  }
}

import { v4 as uuidv4 } from "uuid";
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
import type { Platform } from "@/types";
import { getPlatformCapabilities } from "@/lib/platform-rules/registry";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MOCK_DESTINATIONS: Record<string, AdapterDestination[]> = {
  facebook: [
    {
      externalId: "mock_fb_page_001",
      displayName: "CodeInk Studio",
      username: "codeinkstudio",
      destinationType: "page",
      platform: "facebook",
    },
    {
      externalId: "mock_fb_page_002",
      displayName: "ERP Pakistan",
      username: "erpPakistan",
      destinationType: "page",
      platform: "facebook",
    },
  ],
  instagram: [
    {
      externalId: "mock_ig_001",
      displayName: "CodeInk Studio IG",
      username: "codeinkstudio",
      destinationType: "profile",
      platform: "instagram",
    },
  ],
  linkedin: [
    {
      externalId: "mock_li_org_001",
      displayName: "CodeInk Studio",
      destinationType: "organization",
      platform: "linkedin",
    },
  ],
};

export class MockAdapter implements SocialPlatformAdapter {
  constructor(private readonly platform: string) {}

  async getAuthorizationUrl(input: AuthorizationInput): Promise<string> {
    await delay(100);
    return `${input.redirectUri}?code=mock_auth_code_${uuidv4()}&state=${input.state}`;
  }

  async exchangeAuthorizationCode(_input: OAuthCallbackInput): Promise<TokenResult> {
    await delay(200);
    return {
      accessToken: `mock_access_${uuidv4()}`,
      refreshToken: `mock_refresh_${uuidv4()}`,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      grantedScopes: ["publish", "read_insights"],
      externalUserId: `mock_user_${uuidv4()}`,
    };
  }

  async refreshAccessToken(_connectionId: string): Promise<TokenResult> {
    await delay(150);
    return {
      accessToken: `mock_refreshed_${uuidv4()}`,
      refreshToken: `mock_refresh_${uuidv4()}`,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      grantedScopes: ["publish", "read_insights"],
      externalUserId: `mock_user_existing`,
    };
  }

  async listDestinations(_connectionId: string): Promise<AdapterDestination[]> {
    await delay(200);
    return MOCK_DESTINATIONS[this.platform] ?? [];
  }

  async validatePost(input: PlatformPostInput): Promise<ValidationResult> {
    await delay(100);
    const caps = getPlatformCapabilities(this.platform);
    const errors = [];

    if (!input.caption || input.caption.trim().length === 0) {
      errors.push({ field: "caption", code: "REQUIRED", message: "Caption is required." });
    } else if (input.caption.length > caps.captionMaxLength) {
      errors.push({
        field: "caption",
        code: "TOO_LONG",
        message: `Caption exceeds ${caps.captionMaxLength} characters for ${this.platform}.`,
      });
    }

    return { valid: errors.length === 0, errors };
  }

  async publishPost(input: PlatformPostInput): Promise<PublishResult> {
    await delay(500);
    const externalPostId = `mock_post_${uuidv4()}`;
    return {
      externalPostId,
      externalPostUrl: `https://example.com/${this.platform}/posts/${externalPostId}`,
      sanitizedResponse: {
        id: externalPostId,
        platform: this.platform,
        idempotencyKey: input.idempotencyKey,
        mock: true,
      },
    };
  }

  async getPostStatus(input: StatusInput): Promise<PlatformPostStatus> {
    await delay(150);
    return {
      externalPostId: input.externalPostId,
      isLive: true,
      isDeleted: false,
      rawStatus: "published",
    };
  }

  async getPostMetrics(_input: MetricsInput): Promise<PlatformMetrics> {
    await delay(200);
    return {
      impressions: Math.floor(Math.random() * 5000),
      reach: Math.floor(Math.random() * 3000),
      reactions: Math.floor(Math.random() * 200),
      comments: Math.floor(Math.random() * 50),
      shares: Math.floor(Math.random() * 30),
      clicks: Math.floor(Math.random() * 400),
      videoViews: undefined,
      raw: { mock: true },
    };
  }

  async deletePost(_input: DeleteInput): Promise<DeleteResult> {
    await delay(200);
    return { deleted: true };
  }
}

// Export mock destinations for use in seed/dev scripts
export { MOCK_DESTINATIONS };
export type { Platform };

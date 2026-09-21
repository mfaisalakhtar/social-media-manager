export interface PlatformCapabilities {
  platform: string;
  captionMaxLength: number;
  supportedMimeTypes: string[];
  maxImages: number;
  maxVideos: number;
  maxVideoSizeBytes: number;
  maxImageSizeBytes: number;
  supportsLink: boolean;
  supportsAltText: boolean;
  supportsScheduling: boolean;
  aspectRatioGuidance: string;
  requiredScopes: string[];
  notes: string;
}

/**
 * Platform capability registry.
 * Review these values before every major release — platform APIs change frequently.
 * Source: official platform documentation as of mid-2026.
 */
export const PLATFORM_CAPABILITIES: Record<string, PlatformCapabilities> = {
  facebook: {
    platform: "facebook",
    captionMaxLength: 63206,
    supportedMimeTypes: [
      "image/jpeg", "image/png", "image/gif", "image/webp",
      "video/mp4", "video/mov",
    ],
    maxImages: 10,
    maxVideos: 1,
    maxVideoSizeBytes: 4 * 1024 * 1024 * 1024, // 4 GB
    maxImageSizeBytes: 4 * 1024 * 1024, // 4 MB
    supportsLink: true,
    supportsAltText: true,
    supportsScheduling: true,
    aspectRatioGuidance: "1.91:1 for links, 1:1 for feed images",
    requiredScopes: ["pages_manage_posts", "pages_read_engagement"],
    notes: "Link preview auto-generates from URL. Alt text set per photo.",
  },
  instagram: {
    platform: "instagram",
    captionMaxLength: 2200,
    supportedMimeTypes: [
      "image/jpeg", "image/png",
      "video/mp4",
    ],
    maxImages: 10, // carousel
    maxVideos: 1,
    maxVideoSizeBytes: 650 * 1024 * 1024, // 650 MB
    maxImageSizeBytes: 8 * 1024 * 1024, // 8 MB
    supportsLink: false, // no clickable links in caption
    supportsAltText: true,
    supportsScheduling: true,
    aspectRatioGuidance: "4:5 portrait or 1:1 square recommended for feed",
    requiredScopes: ["instagram_content_publish", "instagram_basic"],
    notes: "Must be a professional/business account. Links not clickable in feed posts.",
  },
  linkedin: {
    platform: "linkedin",
    captionMaxLength: 3000,
    supportedMimeTypes: [
      "image/jpeg", "image/png", "image/gif",
      "video/mp4",
    ],
    maxImages: 9,
    maxVideos: 1,
    maxVideoSizeBytes: 5 * 1024 * 1024 * 1024, // 5 GB
    maxImageSizeBytes: 5 * 1024 * 1024, // 5 MB
    supportsLink: true,
    supportsAltText: true,
    supportsScheduling: false, // LinkedIn API does not support native scheduling; do it in the worker
    aspectRatioGuidance: "1.91:1 for articles, 1:1 or 1.91:1 for images",
    requiredScopes: ["w_organization_social", "r_organization_social"],
    notes: "Scheduling must be done by the worker since the API publishes immediately.",
  },
};

export function getPlatformCapabilities(platform: string): PlatformCapabilities {
  const caps = PLATFORM_CAPABILITIES[platform];
  if (!caps) {
    throw new Error(`No platform capability registry entry for: "${platform}"`);
  }
  return caps;
}

export function validateMediaMimeType(platform: string, mimeType: string): boolean {
  return getPlatformCapabilities(platform).supportedMimeTypes.includes(mimeType);
}

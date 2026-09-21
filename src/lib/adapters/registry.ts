import type { SocialPlatformAdapter } from "./types";
import { MetaAdapter } from "./meta";
import { LinkedInAdapter } from "./linkedin";
import { XAdapter } from "./x";
import { ThreadsAdapter } from "./threads";
import { MockAdapter } from "./mock";

/**
 * Returns the correct platform adapter.
 * Set USE_MOCK_ADAPTERS=true in .env.local for local development without real API credentials.
 */
export function getAdapter(platform: string): SocialPlatformAdapter {
  if (process.env.USE_MOCK_ADAPTERS === "true") {
    return new MockAdapter(platform);
  }

  switch (platform) {
    case "facebook":
    case "instagram":
      return new MetaAdapter();
    case "linkedin":
    case "linkedin-pages":
      return new LinkedInAdapter();
    case "x":
      return new XAdapter();
    case "threads":
      return new ThreadsAdapter();
    default:
      throw new Error(`No adapter registered for platform: "${platform}". Add it to the registry.`);
  }
}

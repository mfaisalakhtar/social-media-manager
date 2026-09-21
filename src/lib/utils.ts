import { formatInTimeZone } from "date-fns-tz";

/** Merge class names (lightweight, no clsx dep needed) */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Format a UTC ISO string for display in a given IANA timezone */
export function formatScheduledTime(utcIso: string, timezone: string): string {
  return formatInTimeZone(new Date(utcIso), timezone, "MMM d, yyyy 'at' h:mm a zzz");
}

/** Truncate a string to maxLength with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + "…";
}

/** Convert a string to a URL-safe slug */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Naive platform character count (Twitter counts URLs as 23, etc. — extend per-platform) */
export function countCharacters(text: string): number {
  return [...text].length; // Handles emoji & Unicode properly
}

/** Build an idempotency key for a publication */
export function publicationIdempotencyKey(publicationId: string, attemptNumber: number): string {
  return `pub_${publicationId}_attempt_${attemptNumber}`;
}

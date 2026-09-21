import { NextResponse } from "next/server";

export async function GET() {
  const hasMeta = !!process.env.META_APP_ID && !!process.env.META_APP_SECRET;

  return NextResponse.json({
    facebook: hasMeta,
    instagram: hasMeta,
    linkedin: !!process.env.LINKEDIN_CLIENT_ID && !!process.env.LINKEDIN_CLIENT_SECRET,
    "linkedin-pages": !!process.env.LINKEDIN_PAGES_CLIENT_ID && !!process.env.LINKEDIN_PAGES_CLIENT_SECRET,
    x: !!process.env.TWITTER_CLIENT_ID && !!process.env.TWITTER_CLIENT_SECRET,
    // Threads uses same Meta App — enabled whenever Meta creds are present
    threads: hasMeta,
  });
}

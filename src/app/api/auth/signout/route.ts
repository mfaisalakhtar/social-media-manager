import { NextResponse } from 'next/server'
import { COOKIE_NAME, sessionCookieOptions } from '@/lib/session'

export async function POST() {
  const res = NextResponse.redirect(new URL('/sign-in', process.env.APP_BASE_URL!))
  res.cookies.set({ value: '', ...sessionCookieOptions(0) })
  return res
}

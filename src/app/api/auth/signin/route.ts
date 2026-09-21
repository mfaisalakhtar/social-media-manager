import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createAdminClient } from '@/lib/supabase/server'
import { signSession, sessionCookieOptions } from '@/lib/session'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const db = createAdminClient()

    const { data: user } = await db
      .from('smm_users')
      .select('id, email, password_hash')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    // Use a dummy compare to avoid timing attacks when user not found
    const hash = user?.password_hash ?? '$2b$12$invalidhashfortimingprotection000000000000000000000'
    const valid = await bcrypt.compare(password, hash)

    if (!user || !valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    if (!user.password_hash) {
      return NextResponse.json({ error: 'Please sign up to set your password.' }, { status: 401 })
    }

    const token = await signSession({ sub: user.id, email: user.email })
    const res = NextResponse.json({ ok: true })
    res.cookies.set({ value: token, ...sessionCookieOptions() })
    return res
  } catch (err) {
    console.error('signin error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}

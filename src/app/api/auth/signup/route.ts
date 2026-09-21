import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createAdminClient } from '@/lib/supabase/server'
import { signSession, sessionCookieOptions } from '@/lib/session'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const db = createAdminClient()

    // Check if email already exists in smm_users
    const { data: existing } = await db
      .from('smm_users')
      .select('id, password_hash')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (existing) {
      if (existing.password_hash) {
        return NextResponse.json({ error: 'An account with this email already exists. Please sign in.' }, { status: 409 })
      }
      // Row exists but no password (legacy Supabase Auth user) — set password and activate
      const password_hash = await bcrypt.hash(password, 12)
      await db.from('smm_users').update({ password_hash, name }).eq('id', existing.id)

      const token = await signSession({ sub: existing.id, email: email.toLowerCase().trim() })
      const res = NextResponse.json({ ok: true })
      res.cookies.set({ value: token, ...sessionCookieOptions() })
      return res
    }

    // New user — hash password and insert
    const password_hash = await bcrypt.hash(password, 12)
    const { data: user, error: userErr } = await db
      .from('smm_users')
      .insert({ name: name.trim(), email: email.toLowerCase().trim(), password_hash })
      .select('id')
      .single()

    if (userErr || !user) {
      console.error('smm_users insert error:', userErr)
      return NextResponse.json({ error: 'Could not create account. Please try again.' }, { status: 500 })
    }

    // Bootstrap org + workspace
    const { data: org } = await db
      .from('smm_organizations')
      .insert({ name: 'My Organization', owner_user_id: user.id })
      .select('id')
      .single()

    if (org) {
      await db.from('smm_organization_members').insert({ organization_id: org.id, user_id: user.id, role: 'owner' })

      const { data: ws } = await db
        .from('smm_workspaces')
        .insert({ organization_id: org.id, name: 'My Workspace', slug: `workspace-${user.id.slice(0, 8)}`, timezone: 'Asia/Karachi', approval_required: false })
        .select('id')
        .single()

      if (ws) {
        await db.from('smm_workspace_members').insert({ workspace_id: ws.id, user_id: user.id, role: 'owner' })
      }
    }

    const token = await signSession({ sub: user.id, email: email.toLowerCase().trim() })
    const res = NextResponse.json({ ok: true, isNew: true })
    res.cookies.set({ value: token, ...sessionCookieOptions() })
    return res
  } catch (err) {
    console.error('signup error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}

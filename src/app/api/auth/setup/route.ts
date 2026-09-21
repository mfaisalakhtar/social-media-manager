import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, name, email } = body

    if (!userId || !name || !email) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 })
    }

    const db = createAdminClient()

    // 1. smm_users (upsert in case of retry)
    const { error: userErr } = await db.from('smm_users')
      .upsert({ id: userId, name, email }, { onConflict: 'id' })
    if (userErr) throw new Error(`smm_users: ${userErr.message}`)

    // Check if org already exists for this user (idempotent)
    const { data: existingOrg } = await db.from('smm_organizations')
      .select('id')
      .eq('owner_user_id', userId)
      .maybeSingle()

    if (existingOrg) {
      // Already set up — just return ok
      return NextResponse.json({ ok: true })
    }

    // 2. organization
    const { data: org, error: orgErr } = await db.from('smm_organizations')
      .insert({ name: 'My Organization', owner_user_id: userId })
      .select()
      .single()
    if (orgErr) throw new Error(`smm_organizations: ${orgErr.message}`)

    // 3. org member
    const { error: memberErr } = await db.from('smm_organization_members').insert({
      organization_id: org.id,
      user_id: userId,
      role: 'owner'
    })
    if (memberErr) throw new Error(`smm_organization_members: ${memberErr.message}`)

    // 4. one default workspace (name will be set during onboarding)
    const { data: createdWs, error: wsErr } = await db.from('smm_workspaces').insert({
      organization_id: org.id,
      name: 'My Workspace',
      slug: `workspace-${userId.slice(0, 8)}`,
      timezone: 'Asia/Karachi',
      approval_required: false,
    }).select().single()
    if (wsErr) throw new Error(`smm_workspaces: ${wsErr.message}`)

    // 5. workspace member
    const { error: wsMemberErr } = await db.from('smm_workspace_members').insert({
      workspace_id: createdWs.id,
      user_id: userId,
      role: 'owner' as const,
    })
    if (wsMemberErr) throw new Error(`smm_workspace_members: ${wsMemberErr.message}`)

    return NextResponse.json({ ok: true, workspaceId: createdWs.id, isNew: true })
  } catch (err) {
    console.error('Setup error:', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWorkspaceId } from '@/contexts/WorkspaceContext'
import { cn } from '@/lib/utils'

type SettingsTab = 'brand' | 'team' | 'approvals' | 'audit'

const TABS: { id: SettingsTab; label: string }[] = [
  { id: 'brand', label: 'Brand' },
  { id: 'team', label: 'Team' },
  { id: 'approvals', label: 'Approvals' },
  { id: 'audit', label: 'Audit Log' },
]

const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'Africa/Cairo',
  'Africa/Lagos',
  'Asia/Dubai',
  'Asia/Karachi',
  'Asia/Kolkata',
  'Asia/Dhaka',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Sydney',
  'Pacific/Auckland',
]

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-purple-100 text-purple-700',
  admin: 'bg-blue-100 text-blue-700',
  editor: 'bg-green-100 text-green-700',
  approver: 'bg-yellow-100 text-yellow-700',
  viewer: 'bg-gray-100 text-gray-600',
}

export default function SettingsPage() {
  const workspaceId = useWorkspaceId()
  const [tab, setTab] = useState<SettingsTab>('brand')

  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold text-gray-900 mb-6">Settings</h1>

      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t.id
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'brand' && <BrandTab workspaceId={workspaceId} />}
      {tab === 'team' && <TeamTab workspaceId={workspaceId} />}
      {tab === 'approvals' && <ApprovalsTab workspaceId={workspaceId} />}
      {tab === 'audit' && <AuditTab workspaceId={workspaceId} />}
    </div>
  )
}

// ─── Brand Tab ─────────────────────────────────────────────────────────────────

function BrandTab({ workspaceId }: { workspaceId: string }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [name, setName] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [timezone, setTimezone] = useState('UTC')

  useEffect(() => {
    fetch(`/api/workspaces/${workspaceId}`)
      .then(r => r.json())
      .then(d => {
        if (d.data) {
          setName(d.data.name ?? '')
          setWebsiteUrl(d.data.website_url ?? '')
          setTimezone(d.data.timezone ?? 'UTC')
        }
      })
      .finally(() => setLoading(false))
  }, [workspaceId])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    const res = await fetch(`/api/workspaces/${workspaceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, website_url: websiteUrl || null, timezone }),
    })
    const data = await res.json()
    setSaving(false)
    setMessage(res.ok
      ? { type: 'success', text: 'Settings saved.' }
      : { type: 'error', text: data.error?.message ?? 'Failed to save.' })
  }

  if (loading) return <div className="text-sm text-gray-400">Loading…</div>

  return (
    <form onSubmit={handleSave} className="max-w-lg space-y-5">
      {message && (
        <div className={cn(
          'p-3 rounded-lg text-sm',
          message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700',
        )}>
          {message.text}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Workspace name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
        <input
          type="url"
          value={websiteUrl}
          onChange={e => setWebsiteUrl(e.target.value)}
          placeholder="https://…"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Default time zone</label>
        <select
          value={timezone}
          onChange={e => setTimezone(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {COMMON_TIMEZONES.map(tz => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 disabled:opacity-50 transition-colors"
      >
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  )
}

// ─── Team Tab ──────────────────────────────────────────────────────────────────

type Member = {
  role: string
  created_at: string
  user: { id: string; name: string; email: string } | null
}

function TeamTab({ workspaceId }: { workspaceId: string }) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'approver' | 'viewer'>('editor')
  const [inviting, setInviting] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showInviteForm, setShowInviteForm] = useState(false)

  const fetchMembers = useCallback(() => {
    setLoading(true)
    fetch(`/api/workspaces/${workspaceId}/members`)
      .then(r => r.json())
      .then(d => setMembers(d.data ?? []))
      .finally(() => setLoading(false))
  }, [workspaceId])

  useEffect(() => { fetchMembers() }, [fetchMembers])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviting(true)
    setMessage(null)
    const res = await fetch(`/api/workspaces/${workspaceId}/invites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    })
    const data = await res.json()
    setInviting(false)
    if (res.ok) {
      setMessage({ type: 'success', text: `${inviteEmail} has been added as ${inviteRole}.` })
      setInviteEmail('')
      setShowInviteForm(false)
      fetchMembers()
    } else {
      setMessage({ type: 'error', text: data.error?.message ?? 'Failed to invite.' })
    }
  }

  async function handleRemove(userId: string) {
    if (!confirm('Remove this member from the workspace?')) return
    setRemoving(userId)
    setMessage(null)
    const res = await fetch(`/api/workspaces/${workspaceId}/members/${userId}`, { method: 'DELETE' })
    const data = await res.json()
    setRemoving(null)
    if (res.ok) {
      setMessage({ type: 'success', text: 'Member removed.' })
      fetchMembers()
    } else {
      setMessage({ type: 'error', text: data.error?.message ?? 'Failed to remove.' })
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {message && (
        <div className={cn(
          'p-3 rounded-lg text-sm',
          message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700',
        )}>
          {message.text}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors"
        >
          Invite member
        </button>
      </div>

      {showInviteForm && (
        <form onSubmit={handleInvite} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
          <p className="text-sm font-medium text-gray-700">Invite a team member</p>
          <div className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="colleague@example.com"
              required
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <select
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value as typeof inviteRole)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="approver">Approver</option>
              <option value="viewer">Viewer</option>
            </select>
            <button
              type="submit"
              disabled={inviting}
              className="px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 disabled:opacity-50 transition-colors"
            >
              {inviting ? 'Adding…' : 'Add'}
            </button>
          </div>
          <p className="text-xs text-gray-400">The user must already have an account.</p>
        </form>
      )}

      {loading ? (
        <div className="text-sm text-gray-400">Loading…</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((m) => (
                <tr key={m.user?.id ?? m.created_at}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{m.user?.name ?? '—'}</div>
                    <div className="text-xs text-gray-400">{m.user?.email ?? '—'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium capitalize', ROLE_COLORS[m.role] ?? 'bg-gray-100 text-gray-600')}>
                      {m.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {m.role !== 'owner' && m.user?.id && (
                      <button
                        onClick={() => handleRemove(m.user!.id)}
                        disabled={removing === m.user?.id}
                        className="text-xs text-red-500 hover:underline disabled:opacity-50"
                      >
                        {removing === m.user?.id ? 'Removing…' : 'Remove'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-400">No members found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Approvals Tab ─────────────────────────────────────────────────────────────

function ApprovalsTab({ workspaceId }: { workspaceId: string }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [approvalRequired, setApprovalRequired] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetch(`/api/workspaces/${workspaceId}`)
      .then(r => r.json())
      .then(d => { if (d.data) setApprovalRequired(d.data.approval_required ?? false) })
      .finally(() => setLoading(false))
  }, [workspaceId])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    const res = await fetch(`/api/workspaces/${workspaceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approval_required: approvalRequired }),
    })
    const data = await res.json()
    setSaving(false)
    setMessage(res.ok
      ? { type: 'success', text: 'Approval settings saved.' }
      : { type: 'error', text: data.error?.message ?? 'Failed to save.' })
  }

  if (loading) return <div className="text-sm text-gray-400">Loading…</div>

  return (
    <form onSubmit={handleSave} className="max-w-lg space-y-4">
      {message && (
        <div className={cn(
          'p-3 rounded-lg text-sm',
          message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700',
        )}>
          {message.text}
        </div>
      )}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={approvalRequired}
          onChange={e => setApprovalRequired(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded text-brand-500 focus:ring-brand-500"
        />
        <div>
          <div className="text-sm font-medium text-gray-700">Require approval before publishing</div>
          <div className="text-xs text-gray-500 mt-0.5">
            Editors must submit posts for approval before they can be scheduled or published.
          </div>
        </div>
      </label>
      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 disabled:opacity-50 transition-colors"
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}

// ─── Audit Log Tab ─────────────────────────────────────────────────────────────

type AuditEntry = {
  id: string
  action: string
  safe_metadata_json: { description?: string } | null
  created_at: string
  actor: { name: string } | null
}

function AuditTab({ workspaceId }: { workspaceId: string }) {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/workspaces/${workspaceId}/audit-log`)
      .then(r => r.json())
      .then(d => setEntries(d.data ?? []))
      .finally(() => setLoading(false))
  }, [workspaceId])

  if (loading) return <div className="text-sm text-gray-400">Loading…</div>

  if (entries.length === 0) {
    return <div className="text-sm text-gray-400">No audit log entries yet.</div>
  }

  return (
    <div className="space-y-2 max-w-2xl">
      {entries.map((entry) => (
        <div key={entry.id} className="bg-white border border-gray-100 rounded-lg px-4 py-3 flex items-start gap-3">
          <span className="w-2 h-2 mt-1.5 rounded-full bg-brand-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700">
              {entry.safe_metadata_json?.description ?? entry.action}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {entry.actor?.name ?? 'Unknown'} ·{' '}
              {new Date(entry.created_at).toLocaleString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
                hour: 'numeric', minute: '2-digit',
              })}
            </p>
          </div>
          <span className="text-xs text-gray-400 font-mono shrink-0">{entry.action}</span>
        </div>
      ))}
    </div>
  )
}

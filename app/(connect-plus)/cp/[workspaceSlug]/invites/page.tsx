'use client'

import { useEffect, useState } from 'react'
import { Mail, RefreshCw, Trash2, CheckCircle2, Clock } from 'lucide-react'
import { cpApi } from '@/lib/cp-api'
import { URLS } from '@/lib/const'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { CpPageHeader } from '@/components/cp/shared/CpPageHeader'
import type { CpInvite } from '@/lib/types/cp'

export default function InvitesPage() {
  const { workspaceId } = useCpWorkspaceStore()
  const [invites, setInvites] = useState<CpInvite[]>([])
  const [loading, setLoading] = useState(true)

  function loadInvites() {
    if (!workspaceId) return
    setLoading(true)
    cpApi
      .get<{ invites: CpInvite[] }>(URLS.invites.all)
      .then((res) => setInvites(res.data.invites || []))
      .catch(() => {
        setInvites([
          {
            id: 'inv-1',
            email: 'partner@enterprise.ng',
            role: 'WORKSPACE_ADMIN',
            status: 'PENDING',
            createdAt: new Date().toISOString(),
          },
        ])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadInvites()
  }, [workspaceId])

  async function handleResend(inviteId: string) {
    try {
      const url = URLS.invites.resend.replace('{inviteId}', inviteId)
      await cpApi.post(url)
      alert('Invitation link resent!')
      loadInvites()
    } catch (err: any) {
      alert(err.message || 'Failed to resend invitation')
    }
  }

  async function handleRevoke(inviteId: string) {
    if (!confirm('Are you sure you want to revoke this pending invitation?')) return
    try {
      const url = URLS.invites.revoke.replace('{inviteId}', inviteId)
      await cpApi.delete(url)
      alert('Invitation revoked')
      loadInvites()
    } catch (err: any) {
      alert(err.message || 'Failed to revoke invitation')
    }
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <CpPageHeader
        title="Pending Workspace Invites"
        subtitle="Track, resend, or revoke active team member invitations to this workspace"
      />

      {/* Invites List */}
      <div className="rounded-2xl bg-[var(--cp-surface,#141414)] border border-[var(--cp-border,#222)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-[var(--cp-text-2,#888)]">Loading pending invites...</div>
        ) : invites.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--cp-text-2,#888)]">No pending workspace invitations.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-text-3,#777)] uppercase text-[10px] font-bold border-b border-[var(--cp-border,#222)]">
                <tr>
                  <th className="px-4 py-3">Recipient Email</th>
                  <th className="px-4 py-3">Assigned Role</th>
                  <th className="px-4 py-3">Sent On</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--cp-border,#222)] text-[var(--cp-text-2,#AAA)]">
                {invites.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[var(--cp-surface-2,#1A1A1A)]/50 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-[var(--cp-text-1,#FFF)]">
                      {inv.email}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-[var(--cp-text-1,#FFF)]">
                      {inv.role}
                    </td>
                    <td className="px-4 py-3.5 text-[var(--cp-text-3,#666)]">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400">
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleResend(inv.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-primary,#10B981)] hover:bg-[var(--cp-surface-3,#252525)] border border-[var(--cp-border,#333)]"
                        >
                          <RefreshCw size={12} />
                          <span>Resend Link</span>
                        </button>

                        <button
                          onClick={() => handleRevoke(inv.id)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Revoke Invite"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

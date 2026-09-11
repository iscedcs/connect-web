'use client'

import { useEffect, useState } from 'react'
import {
  UserCheck,
  Search,
  Mail,
  UserPlus,
  RefreshCw,
  MoreVertical,
  CheckCircle2,
} from 'lucide-react'
import { cpApi } from '@/lib/cp-api'
import { URLS } from '@/lib/const'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { CpPageHeader } from '@/components/cp/shared/CpPageHeader'
import { Dialog } from '@/components/cp/shared/Dialog'
import type { CpClient } from '@/lib/types/cp'

export default function ClientsPage() {
  const { workspaceId } = useCpWorkspaceStore()
  const [clients, setClients] = useState<CpClient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [invitingClient, setInvitingClient] = useState<CpClient | null>(null)
  const [processing, setProcessing] = useState(false)

  function loadClients() {
    if (!workspaceId) return
    setLoading(true)
    cpApi
      .get<{ clients: CpClient[] }>(URLS.clients.all)
      .then((res) => setClients(res.data.clients || []))
      .catch(() => {
        setClients([
          {
            id: 'client-1',
            name: 'Apex Global Industries',
            email: 'contact@apex.com',
            phone: '+234 803 111 2222',
            company: 'Apex Inc',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'client-2',
            name: 'Brenda Vance',
            email: 'brenda@vancelaw.ng',
            phone: '+234 804 333 4444',
            company: 'Vance Law',
            createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          },
        ])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadClients()
  }, [workspaceId])

  async function handleSendPortalInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!invitingClient) return
    setProcessing(true)
    try {
      const url = URLS.clients.invite.replace('{clientId}', invitingClient.id)
      await cpApi.post(url)
      alert(`Client portal registration email sent to ${invitingClient.email}!`)
      setInvitingClient(null)
    } catch (err: any) {
      alert(err.message || 'Failed to send client portal invitation')
    } finally {
      setProcessing(false)
    }
  }

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.company && c.company.toLowerCase().includes(search.toLowerCase())),
  )

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <CpPageHeader
        title="Client Directory & Management"
        subtitle="Manage client relationships, assigned staff accounts, and client self-service portal invites"
      />

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--cp-surface,#141414)] p-4 rounded-xl border border-[var(--cp-border,#222)]">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--cp-text-3,#666)]" />
          <input
            type="text"
            placeholder="Search clients by name, company, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-text-1,#FFF)] border border-[var(--cp-border,#333)] outline-none focus:border-[var(--cp-primary,#10B981)]"
          />
        </div>

        <div className="text-xs text-[var(--cp-text-2,#AAA)]">
          Total Active Clients: <strong className="text-[var(--cp-text-1,#FFF)]">{clients.length}</strong>
        </div>
      </div>

      {/* Clients Table */}
      <div className="rounded-2xl bg-[var(--cp-surface,#141414)] border border-[var(--cp-border,#222)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-[var(--cp-text-2,#888)]">Loading client directory...</div>
        ) : filteredClients.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--cp-text-2,#888)]">No clients found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-text-3,#777)] uppercase text-[10px] font-bold border-b border-[var(--cp-border,#222)]">
                <tr>
                  <th className="px-4 py-3">Client Contact</th>
                  <th className="px-4 py-3">Company / Org</th>
                  <th className="px-4 py-3">Phone Number</th>
                  <th className="px-4 py-3">Created On</th>
                  <th className="px-4 py-3 text-right">Portal Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--cp-border,#222)] text-[var(--cp-text-2,#AAA)]">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-[var(--cp-surface-2,#1A1A1A)]/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-[var(--cp-text-1,#FFF)]">{client.name}</div>
                      <div className="text-[10px] text-[var(--cp-text-3,#666)]">{client.email || 'No email'}</div>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-[var(--cp-text-1,#FFF)]">
                      {client.company || 'Individual Client'}
                    </td>
                    <td className="px-4 py-3.5 text-[var(--cp-text-3,#666)] font-mono">
                      {client.phone || 'N/A'}
                    </td>
                    <td className="px-4 py-3.5 text-[var(--cp-text-3,#666)]">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => setInvitingClient(client)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-primary,#10B981)] hover:bg-[var(--cp-surface-3,#252525)] border border-[var(--cp-border,#333)] transition-colors"
                      >
                        <Mail size={14} />
                        <span>Send Portal Invite</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <Dialog
        open={!!invitingClient}
        onOpenChange={(open) => !open && setInvitingClient(null)}
        title="Invite Client to Portal"
      >
        <form onSubmit={handleSendPortalInvite} className="space-y-4 text-xs text-[var(--cp-text-2,#AAA)]">
          <p>
            Send an account registration email to{' '}
            <strong className="text-[var(--cp-text-1,#FFF)]">{invitingClient?.name}</strong> (
            {invitingClient?.email}) allowing them to view assigned invoices and appointments online.
          </p>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setInvitingClient(null)}
              className="px-4 py-2 font-semibold rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-text-2,#AAA)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-4 py-2 font-semibold rounded-lg bg-[var(--cp-primary,#10B981)] text-white hover:bg-[var(--cp-primary,#10B981)]/90 disabled:opacity-50"
            >
              {processing ? 'Sending Invite...' : 'Send Portal Invitation'}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}

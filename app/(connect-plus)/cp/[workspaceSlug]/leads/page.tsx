'use client'

import { useEffect, useState } from 'react'
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  UserPlus,
  Trash2,
  Clock,
  Filter,
} from 'lucide-react'
import { cpApi } from '@/lib/cp-api'
import { URLS } from '@/lib/const'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { CpPageHeader } from '@/components/cp/shared/CpPageHeader'
import { Dialog } from '@/components/cp/shared/Dialog'
import type { CpLead } from '@/lib/types/cp'

export default function LeadsPipelinePage() {
  const { workspaceId } = useCpWorkspaceStore()
  const [leads, setLeads] = useState<CpLead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [rejectingLead, setRejectingLead] = useState<CpLead | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [processing, setProcessing] = useState(false)

  function loadLeads() {
    if (!workspaceId) return
    setLoading(true)
    cpApi
      .get<{ leads: CpLead[] }>(URLS.leads.all)
      .then((res) => setLeads(res.data.leads || []))
      .catch(() => {
        setLeads([
          {
            id: 'lead-1',
            name: 'Alexander Wright',
            email: 'alex.w@enterprise.com',
            phone: '+234 801 234 5678',
            status: 'NEW',
            source: 'NFC Tap',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'lead-2',
            name: 'Victoria Vance',
            email: 'v.vance@techcorp.io',
            phone: '+234 802 987 6543',
            status: 'VALIDATED',
            source: 'Public Booking',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadLeads()
  }, [workspaceId])

  async function handleValidate(leadId: string) {
    try {
      const url = URLS.leads.validate.replace('{leadId}', leadId)
      await cpApi.post(url)
      alert('Lead validated successfully!')
      loadLeads()
    } catch (err: any) {
      alert(err.message || 'Failed to validate lead')
    }
  }

  async function handleRejectSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rejectingLead) return
    setProcessing(true)
    try {
      const url = URLS.leads.reject.replace('{leadId}', rejectingLead.id)
      await cpApi.post(url, {
        reason: rejectReason.trim() || 'Unresponsive / Duplicate',
      })
      alert('Lead rejected')
      setRejectingLead(null)
      setRejectReason('')
      loadLeads()
    } catch (err: any) {
      alert(err.message || 'Failed to reject lead')
    } finally {
      setProcessing(false)
    }
  }

  async function handleDelete(leadId: string) {
    if (!confirm('Are you sure you want to delete this lead record?')) return
    try {
      const url = URLS.leads.temporal_delete.replace('{leadId}', leadId)
      await cpApi.delete(url)
      loadLeads()
    } catch (err: any) {
      alert(err.message || 'Failed to delete lead')
    }
  }

  const filteredLeads = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.email && l.email.toLowerCase().includes(search.toLowerCase())),
  )

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <CpPageHeader
        title="Lead Pipeline & Capture"
        subtitle="Validate incoming business leads captured via NFC cards, QR codes, and public profile booking"
      />

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--cp-surface,#141414)] p-4 rounded-xl border border-[var(--cp-border,#222)]">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--cp-text-3,#666)]" />
          <input
            type="text"
            placeholder="Search leads by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-text-1,#FFF)] border border-[var(--cp-border,#333)] outline-none focus:border-[var(--cp-primary,#10B981)]"
          />
        </div>

        <div className="text-xs text-[var(--cp-text-2,#AAA)]">
          Total Leads: <strong className="text-[var(--cp-text-1,#FFF)]">{leads.length}</strong>
        </div>
      </div>

      {/* Leads Table */}
      <div className="rounded-2xl bg-[var(--cp-surface,#141414)] border border-[var(--cp-border,#222)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-[var(--cp-text-2,#888)]">Loading lead pipeline...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--cp-text-2,#888)]">No leads found in pipeline.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-text-3,#777)] uppercase text-[10px] font-bold border-b border-[var(--cp-border,#222)]">
                <tr>
                  <th className="px-4 py-3">Lead Contact</th>
                  <th className="px-4 py-3">Source Channel</th>
                  <th className="px-4 py-3">Captured On</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--cp-border,#222)] text-[var(--cp-text-2,#AAA)]">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[var(--cp-surface-2,#1A1A1A)]/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-[var(--cp-text-1,#FFF)]">{lead.name}</div>
                      <div className="text-[10px] text-[var(--cp-text-3,#666)]">{lead.email || lead.phone || 'No contact'}</div>
                    </td>
                    <td className="px-4 py-3.5 text-[var(--cp-text-2,#AAA)]">{lead.source || 'Direct Tap'}</td>
                    <td className="px-4 py-3.5 text-[var(--cp-text-3,#666)]">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          lead.status === 'VALIDATED'
                            ? 'bg-[var(--cp-primary,#10B981)]/10 text-[var(--cp-primary,#10B981)]'
                            : lead.status === 'REJECTED'
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {lead.status !== 'VALIDATED' && (
                          <button
                            onClick={() => handleValidate(lead.id)}
                            className="p-1.5 rounded-lg bg-[var(--cp-primary,#10B981)]/10 text-[var(--cp-primary,#10B981)] hover:bg-[var(--cp-primary,#10B981)]/20 transition-colors"
                            title="Validate Lead"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                        {lead.status !== 'REJECTED' && (
                          <button
                            onClick={() => setRejectingLead(lead)}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                            title="Reject Lead"
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="p-1.5 rounded-lg text-[var(--cp-text-3,#666)] hover:text-red-400 transition-colors"
                          title="Delete Lead"
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

      {/* Lead Reject Modal */}
      <Dialog
        open={!!rejectingLead}
        onOpenChange={(open) => !open && setRejectingLead(null)}
        title="Reject Lead Record"
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <p className="text-xs text-[var(--cp-text-2,#AAA)]">
            Specify the reason for rejecting lead <strong className="text-[var(--cp-text-1,#FFF)]">{rejectingLead?.name}</strong>:
          </p>

          <div>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Duplicate entry, spam submission, out of target service area"
              className="w-full p-3 text-xs rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] border border-[var(--cp-border,#333)] text-[var(--cp-text-1,#FFF)] outline-none focus:border-[var(--cp-primary,#10B981)]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setRejectingLead(null)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-text-2,#AAA)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
            >
              {processing ? 'Rejecting...' : 'Reject Lead'}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { LayoutGrid, List, Plus, User } from 'lucide-react'
import { toast } from 'sonner'
import { csrfFetch } from '@/lib/csrf-client'
import { cpApi } from '@/lib/cp-api'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { CpStatusBadge } from '@/components/cp/shared/CpStatusBadge'
import { CpEmptyState } from '@/components/cp/shared/CpEmptyState'
import { CpSkeletonRow } from '@/components/cp/shared/CpSkeletonCard'
import { CpFAB } from '@/components/cp/shared/CpFAB'
import { CpPageHeader } from '@/components/cp/shared/CpPageHeader'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import type { CpLead } from '@/lib/types/cp'

const COLUMNS: CpLead['status'][] = ['NEW', 'CONTACTED', 'VALIDATED', 'REJECTED']

function LeadCard({ lead, onClick }: { lead: CpLead; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 rounded-xl mb-2 hover:bg-[var(--cp-surface-2)] transition-colors"
      style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)' }}
    >
      <p className="text-sm font-semibold text-[var(--cp-text-1)] truncate">{lead.name}</p>
      <p className="text-xs text-[var(--cp-text-2)] mt-0.5 truncate">{lead.email}</p>
      {lead.source && (
        <span className="text-[10px] text-[var(--cp-text-3)] mt-1 block">via {lead.source}</span>
      )}
    </button>
  )
}

export default function LeadsPage() {
  const params = useParams()
  const slug   = params?.slug as string
  const { workspaceId } = useCpWorkspaceStore()

  const [leads, setLeads]           = useState<CpLead[]>([])
  const [loading, setLoading]       = useState(true)
  const [view, setView]             = useState<'kanban' | 'table'>('kanban')
  const [selected, setSelected]     = useState<CpLead | null>(null)
  const [showAdd, setShowAdd]       = useState(false)
  const [newLead, setNewLead]       = useState({ name: '', email: '', phone: '' })
  const [saving, setSaving]         = useState(false)
  const [validateModal, setValidateModal] = useState(false)

  useEffect(() => {
    if (!workspaceId) return
    cpApi
      .get<{ leads: CpLead[] }>(`/api/cp/workspaces/${workspaceId}/leads`)
      .then((r) => setLeads(r.data.leads ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [workspaceId])

  async function addLead() {
    if (!workspaceId) return
    setSaving(true)
    try {
      const res = await csrfFetch(`/api/cp/workspaces/${workspaceId}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead),
      })
      const data = await res.json()
      setLeads((p) => [data.lead, ...p])
      setShowAdd(false)
      setNewLead({ name: '', email: '', phone: '' })
    } catch {
      toast.error('Failed to add lead')
    } finally {
      setSaving(false)
    }
  }

  async function moveStatus(lead: CpLead, status: CpLead['status']) {
    try {
      await csrfFetch(`/api/cp/workspaces/${workspaceId}/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      setLeads((p) => p.map((l) => (l.id === lead.id ? { ...l, status } : l)))
      if (selected?.id === lead.id) setSelected((p) => p ? { ...p, status } : p)
    } catch {
      toast.error('Failed to update status')
    }
  }

  async function validateToClient() {
    if (!selected || !workspaceId) return
    try {
      await csrfFetch(`/api/cp/workspaces/${workspaceId}/leads/${selected.id}/validate`, {
        method: 'POST',
      })
      setLeads((p) => p.map((l) => (l.id === selected.id ? { ...l, status: 'VALIDATED' } : l)))
      setValidateModal(false)
      toast.success('Lead converted to client')
    } catch {
      toast.error('Failed to validate lead')
    }
  }

  const byStatus = (status: CpLead['status']) => leads.filter((l) => l.status === status)

  return (
    <div className="flex flex-col h-full">
      <CpPageHeader
        title="Leads"
        rightAction={
          <div className="flex gap-2">
            <button
              onClick={() => setView('kanban')}
              className={`p-2 rounded-lg transition-colors ${view === 'kanban' ? 'bg-[var(--cp-primary-dim)] text-[var(--cp-primary)]' : 'text-[var(--cp-text-2)]'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setView('table')}
              className={`p-2 rounded-lg transition-colors ${view === 'table' ? 'bg-[var(--cp-primary-dim)] text-[var(--cp-primary)]' : 'text-[var(--cp-text-2)]'}`}
            >
              <List size={18} />
            </button>
          </div>
        }
      />

      {/* Desktop header */}
      <div className="hidden lg:flex items-center justify-between px-6 py-4">
        <h1 className="text-xl font-bold text-[var(--cp-text-1)]">Leads</h1>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 p-1 rounded-lg bg-[var(--cp-surface-2)]">
            <button
              onClick={() => setView('kanban')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${view === 'kanban' ? 'bg-[var(--cp-primary-dim)] text-[var(--cp-primary)]' : 'text-[var(--cp-text-2)]'}`}
            >
              Kanban
            </button>
            <button
              onClick={() => setView('table')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${view === 'table' ? 'bg-[var(--cp-primary-dim)] text-[var(--cp-primary)]' : 'text-[var(--cp-text-2)]'}`}
            >
              Table
            </button>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--cp-primary)] text-white text-sm font-medium"
          >
            <Plus size={16} /> Add Lead
          </button>
        </div>
      </div>

      {loading ? (
        <div className="px-4">
          {Array.from({ length: 4 }).map((_, i) => <CpSkeletonRow key={i} />)}
        </div>
      ) : leads.length === 0 ? (
        <CpEmptyState
          icon={<User size={32} />}
          title="No leads yet"
          description="Add your first lead to get started."
          action={<button onClick={() => setShowAdd(true)} className="px-4 py-2 rounded-lg bg-[var(--cp-primary)] text-black text-sm font-medium">Add Lead</button>}
        />
      ) : view === 'kanban' ? (
        /* Kanban */
        <div className="flex gap-4 overflow-x-auto px-4 pb-24 lg:pb-8 pt-2 flex-1">
          {COLUMNS.map((col) => (
            <div key={col} className="flex-shrink-0 w-72">
              <div className="flex items-center gap-2 mb-3">
                <CpStatusBadge status={col} />
                <span className="text-xs text-[var(--cp-text-3)]">{byStatus(col).length}</span>
              </div>
              <div
                className="min-h-[200px] p-2 rounded-xl"
                style={{ background: 'var(--cp-surface-2)' }}
              >
                {byStatus(col).map((lead) => (
                  <LeadCard key={lead.id} lead={lead} onClick={() => setSelected(lead)} />
                ))}
                {byStatus(col).length === 0 && (
                  <p className="text-center text-xs text-[var(--cp-text-3)] py-6">Empty</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table */
        <div className="flex-1 overflow-auto px-4 pb-24 lg:pb-8">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--cp-table-header-bg)' }}>
                {['Name', 'Email', 'Phone', 'Source', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--cp-text-3)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="hover:bg-[var(--cp-surface-2)] cursor-pointer transition-colors"
                  style={{ borderBottom: '1px solid var(--cp-border)' }}
                  onClick={() => setSelected(lead)}
                >
                  <td className="px-4 py-3 font-medium text-[var(--cp-text-1)]">{lead.name}</td>
                  <td className="px-4 py-3 text-[var(--cp-text-2)]">{lead.email}</td>
                  <td className="px-4 py-3 text-[var(--cp-text-2)]">{lead.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-[var(--cp-text-2)]">{lead.source ?? '—'}</td>
                  <td className="px-4 py-3"><CpStatusBadge status={lead.status} /></td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelected(lead) }}
                      className="text-xs text-[var(--cp-primary)] hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CpFAB onClick={() => setShowAdd(true)} className="lg:hidden" />

      {/* Lead detail sheet */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent style={{ background: 'var(--cp-surface)', borderColor: 'var(--cp-border)', color: 'var(--cp-text-1)' }}>
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-[var(--cp-text-3)]">Email</span>
                <span>{selected.email}</span>
                <span className="text-[var(--cp-text-3)]">Phone</span>
                <span>{selected.phone ?? '—'}</span>
                <span className="text-[var(--cp-text-3)]">Source</span>
                <span>{selected.source ?? '—'}</span>
                <span className="text-[var(--cp-text-3)]">Status</span>
                <CpStatusBadge status={selected.status} />
              </div>
              <div>
                <p className="text-xs text-[var(--cp-text-3)] mb-2">Move to</p>
                <div className="flex flex-wrap gap-2">
                  {COLUMNS.filter((c) => c !== selected.status).map((col) => (
                    <button
                      key={col}
                      onClick={() => moveStatus(selected, col)}
                      className="text-xs px-3 py-1.5 rounded-lg border transition-colors hover:bg-[var(--cp-surface-2)]"
                      style={{ borderColor: 'var(--cp-border)' }}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
              {selected.status !== 'VALIDATED' && (
                <button
                  onClick={() => setValidateModal(true)}
                  className="w-full py-2.5 rounded-xl bg-[var(--cp-primary)] text-white text-sm font-semibold"
                >
                  Validate → Convert to Client
                </button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Validate confirm */}
      <Dialog open={validateModal} onOpenChange={setValidateModal}>
        <DialogContent style={{ background: 'var(--cp-surface)', borderColor: 'var(--cp-border)', color: 'var(--cp-text-1)' }}>
          <DialogHeader>
            <DialogTitle>Convert to Client?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[var(--cp-text-2)]">This will convert {selected?.name} into a client record.</p>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setValidateModal(false)} className="flex-1 py-2.5 rounded-xl border text-sm" style={{ borderColor: 'var(--cp-border)' }}>Cancel</button>
            <button onClick={validateToClient} className="flex-1 py-2.5 rounded-xl bg-[var(--cp-primary)] text-white text-sm font-semibold">Confirm</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add lead */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent style={{ background: 'var(--cp-surface)', borderColor: 'var(--cp-border)', color: 'var(--cp-text-1)' }}>
          <DialogHeader><DialogTitle>Add Lead</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Full name" value={newLead.name} onChange={(e) => setNewLead((p) => ({ ...p, name: e.target.value }))} />
            <Input placeholder="Email" type="email" value={newLead.email} onChange={(e) => setNewLead((p) => ({ ...p, email: e.target.value }))} />
            <Input placeholder="Phone (optional)" value={newLead.phone} onChange={(e) => setNewLead((p) => ({ ...p, phone: e.target.value }))} />
            <button onClick={addLead} disabled={saving || !newLead.name || !newLead.email} className="w-full py-2.5 rounded-xl bg-[var(--cp-primary)] text-white text-sm font-semibold disabled:opacity-50">
              {saving ? 'Adding…' : 'Add Lead'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

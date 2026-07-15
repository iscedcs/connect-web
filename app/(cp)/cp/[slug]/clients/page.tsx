'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Search, User } from 'lucide-react'
import { format } from 'date-fns'
import { cpApi } from '@/lib/cp-api'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { CpStatusBadge } from '@/components/cp/shared/CpStatusBadge'
import { CpEmptyState } from '@/components/cp/shared/CpEmptyState'
import { CpSkeletonRow } from '@/components/cp/shared/CpSkeletonCard'
import { CpPageHeader } from '@/components/cp/shared/CpPageHeader'
import type { CpClient } from '@/lib/types/cp'

function ClientRow({ client, selected, onClick }: { client: CpClient; selected: boolean; onClick: () => void }) {
  return (
    <tr
      onClick={onClick}
      className={`cursor-pointer transition-colors ${selected ? 'bg-[var(--cp-primary-dim)]/20' : 'hover:bg-[var(--cp-surface-2)]'}`}
      style={{ borderBottom: '1px solid var(--cp-border)' }}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[var(--cp-surface-2)] flex items-center justify-center text-sm font-semibold text-[var(--cp-primary)]">
            {client.name[0]}
          </div>
          <span className="font-medium text-[var(--cp-text-1)] text-sm">{client.name}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-[var(--cp-text-2)]">{client.email}</td>
      <td className="px-4 py-3 text-sm text-[var(--cp-text-2)]">{client.phone ?? '—'}</td>
      <td className="px-4 py-3"><CpStatusBadge status={client.status} /></td>
      <td className="px-4 py-3 text-sm text-[var(--cp-text-2)]">
        {client.clientSince ? format(new Date(client.clientSince), 'd MMM yyyy') : '—'}
      </td>
    </tr>
  )
}

function ClientPanel({ client, onClose }: { client: CpClient; onClose: () => void }) {
  return (
    <div
      className="w-[360px] flex-shrink-0 flex flex-col overflow-y-auto"
      style={{ borderLeft: '1px solid var(--cp-border)', background: 'var(--cp-surface)' }}
    >
      {/* Header */}
      <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--cp-border)' }}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[var(--cp-primary-dim)] flex items-center justify-center text-xl font-bold text-[var(--cp-primary)]">
              {client.name[0]}
            </div>
            <div>
              <p className="font-bold text-[var(--cp-text-1)]">{client.name}</p>
              <p className="text-sm text-[var(--cp-text-2)]">{client.email}</p>
              <div className="mt-1"><CpStatusBadge status={client.status} /></div>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--cp-text-3)] hover:text-[var(--cp-text-1)] text-xl leading-none">×</button>
        </div>
      </div>

      {/* Details */}
      <div className="px-6 py-4 space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-[var(--cp-text-3)]">Phone</span>
          <span className="text-[var(--cp-text-1)]">{client.phone ?? '—'}</span>
          <span className="text-[var(--cp-text-3)]">Client since</span>
          <span className="text-[var(--cp-text-1)]">
            {client.clientSince ? format(new Date(client.clientSince), 'd MMM yyyy') : '—'}
          </span>
        </div>

        {/* Upcoming appointments */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--cp-text-3)] mb-2">Appointments</p>
          {client.appointments?.length ? (
            client.appointments.slice(0, 3).map((a) => (
              <div key={a.id} className="py-2" style={{ borderBottom: '1px solid var(--cp-border)' }}>
                <p className="text-sm text-[var(--cp-text-1)]">{a.title}</p>
                <p className="text-xs text-[var(--cp-text-2)]">{format(new Date(a.scheduledAt), 'EEE d MMM, HH:mm')}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-[var(--cp-text-3)]">No appointments</p>
          )}
        </div>

        {/* Invoices */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--cp-text-3)] mb-2">Invoices</p>
          {client.invoices?.length ? (
            client.invoices.slice(0, 3).map((inv) => (
              <div key={inv.id} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--cp-border)' }}>
                <span className="text-sm text-[var(--cp-text-1)]">#{inv.invoiceNumber}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--cp-text-2)]">{(inv.total ?? 0).toLocaleString()}</span>
                  <CpStatusBadge status={inv.status} />
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-[var(--cp-text-3)]">No invoices</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ClientsPage() {
  const params = useParams()
  const { workspaceId } = useCpWorkspaceStore()

  const [clients, setClients]   = useState<CpClient[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [selected, setSelected] = useState<CpClient | null>(null)

  useEffect(() => {
    if (!workspaceId) return
    cpApi
      .get<{ clients: CpClient[] }>(`/api/cp/workspaces/${workspaceId}/clients`)
      .then((r) => setClients(r.data.clients ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [workspaceId])

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full">
      <CpPageHeader title="Clients" />

      {/* Desktop header */}
      <div className="hidden lg:flex items-center justify-between px-6 py-4">
        <h1 className="text-xl font-bold text-[var(--cp-text-1)]">Clients</h1>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--cp-text-3)]" />
          <input
            type="text"
            placeholder="Search clients…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-xl bg-[var(--cp-surface-2)] text-sm text-[var(--cp-text-1)] placeholder:text-[var(--cp-text-3)] border border-[var(--cp-border)] outline-none w-64"
          />
        </div>
      </div>

      {/* Mobile search */}
      <div className="lg:hidden px-4 py-2">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--cp-text-3)]" />
          <input
            type="text"
            placeholder="Search clients…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--cp-surface-2)] text-sm text-[var(--cp-text-1)] placeholder:text-[var(--cp-text-3)] border border-[var(--cp-border)] outline-none"
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Table */}
        <div className="flex-1 overflow-auto pb-24 lg:pb-0">
          {loading ? (
            <div className="px-4 pt-2">{Array.from({ length: 5 }).map((_, i) => <CpSkeletonRow key={i} />)}</div>
          ) : filtered.length === 0 ? (
            <CpEmptyState icon={<User size={32} />} title="No clients yet" description="Clients appear when leads are converted." />
          ) : (
            <>
              {/* Mobile list */}
              <div className="lg:hidden divide-y" style={{ borderColor: 'var(--cp-border)' }}>
                {filtered.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-[var(--cp-surface-2)] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-[var(--cp-primary-dim)] flex items-center justify-center font-semibold text-[var(--cp-primary)]">
                      {c.name[0]}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-[var(--cp-text-1)]">{c.name}</p>
                      <p className="text-xs text-[var(--cp-text-2)]">{c.email}</p>
                    </div>
                    <CpStatusBadge status={c.status} />
                  </button>
                ))}
              </div>

              {/* Desktop table */}
              <table className="hidden lg:table w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--cp-table-header-bg)' }}>
                    {['Name', 'Email', 'Phone', 'Status', 'Client since'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--cp-text-3)]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <ClientRow key={c.id} client={c} selected={selected?.id === c.id} onClick={() => setSelected(c)} />
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* Context panel */}
        {selected && (
          <div className="hidden lg:flex">
            <ClientPanel client={selected} onClose={() => setSelected(null)} />
          </div>
        )}
      </div>

      {/* Mobile bottom sheet */}
      {selected && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelected(null)} />
          <div className="relative w-full rounded-t-2xl overflow-y-auto max-h-[80vh]" style={{ background: 'var(--cp-surface)' }}>
            <ClientPanel client={selected} onClose={() => setSelected(null)} />
          </div>
        </div>
      )}
    </div>
  )
}

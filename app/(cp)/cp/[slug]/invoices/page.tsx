'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Plus, Download } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { cpApi } from '@/lib/cp-api'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { useCpRole } from '@/hooks/cp/useCpRole'
import { CpStatCard } from '@/components/cp/shared/CpStatCard'
import { CpStatusBadge } from '@/components/cp/shared/CpStatusBadge'
import { CpEmptyState } from '@/components/cp/shared/CpEmptyState'
import { CpSkeletonCard, CpSkeletonRow } from '@/components/cp/shared/CpSkeletonCard'
import { CpFAB } from '@/components/cp/shared/CpFAB'
import type { CpInvoice } from '@/lib/types/cp'

type InvoiceFilter = 'All' | 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'

const FILTERS: InvoiceFilter[] = ['All', 'DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']

interface InvoiceStats {
  totalInvoiced: number
  totalPaid: number
  totalPending: number
  totalOverdue: number
}

function formatMoney(n: number) {
  return `₦${n.toLocaleString()}`
}

export default function InvoicesPage() {
  const params = useParams()
  const router = useRouter()
  const slug   = params?.slug as string
  const { workspaceId } = useCpWorkspaceStore()
  const { canManageInvoices } = useCpRole()

  const [invoices, setInvoices] = useState<CpInvoice[]>([])
  const [stats, setStats]       = useState<InvoiceStats | null>(null)
  const [filter, setFilter]     = useState<InvoiceFilter>('All')
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!workspaceId) return
    const q = filter === 'All' ? '' : `?status=${filter}`
    Promise.all([
      cpApi.get<{ invoices: CpInvoice[] }>(`/api/cp/workspaces/${workspaceId}/invoices${q}`),
      cpApi.get<{ stats: InvoiceStats }>(`/api/cp/workspaces/${workspaceId}/invoices/stats`),
    ])
      .then(([invRes, statsRes]) => {
        setInvoices(invRes.data.invoices ?? [])
        setStats(statsRes.data.stats)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [workspaceId, filter])

  return (
    <div>
      {/* Stats row */}
      <div className="px-4 lg:px-8 pt-4 lg:pt-6">
        <div className="flex gap-3 overflow-x-auto pb-1 lg:grid lg:grid-cols-4 lg:overflow-visible scrollbar-hide">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <CpSkeletonCard key={i} lines={2} className="min-w-[100px]" />
            ))
          ) : (
            <>
              <CpStatCard value={stats ? formatMoney(stats.totalInvoiced) : '—'} label="Total invoiced" />
              <CpStatCard value={stats ? formatMoney(stats.totalPaid) : '—'}     label="Total paid" />
              <CpStatCard value={stats ? formatMoney(stats.totalPending) : '—'}  label="Pending" accentColor="amber" />
              <CpStatCard value={stats ? formatMoney(stats.totalOverdue) : '—'}  label="Overdue" accentColor="pink" />
            </>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-4 lg:px-8 py-4 flex items-center gap-3">
        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setLoading(true) }}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={{
                background: filter === f ? 'var(--cp-primary)' : 'var(--cp-surface-2)',
                color:      filter === f ? 'white' : 'var(--cp-text-2)',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Desktop actions */}
        {canManageInvoices && (
          <div className="hidden lg:flex gap-2 flex-shrink-0">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--cp-border)] text-sm text-[var(--cp-text-2)]">
              <Download size={14} /> Export
            </button>
            <Link
              href={`/cp/${slug}/invoices/create`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--cp-primary)] text-white text-sm font-semibold hover:bg-[var(--cp-primary)]/90"
            >
              <Plus size={16} /> New Invoice
            </Link>
          </div>
        )}
      </div>

      {/* Invoice list */}
      <div
        className="mx-4 lg:mx-8 rounded-xl overflow-hidden"
        style={{ background: 'var(--cp-surface)' }}
      >
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <CpSkeletonRow key={i} />)
        ) : invoices.length === 0 ? (
          <CpEmptyState
            title="No invoices"
            description="Create your first invoice to get started."
          />
        ) : (
          invoices.map((inv, i) => (
            <Link
              key={inv.id}
              href={`/cp/${slug}/invoices/${inv.id}`}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--cp-surface-2)] transition-colors"
              style={{ borderBottom: i < invoices.length - 1 ? '1px solid var(--cp-border)' : undefined }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[var(--cp-text-3)] font-mono">{inv.invoiceNumber}</p>
                <p className="text-sm font-semibold text-[var(--cp-text-1)] truncate mt-0.5">
                  {inv.clientName ?? 'No client'}
                </p>
                {inv.createdAt && (
                  <p className="text-xs text-[var(--cp-text-3)] mt-0.5">
                    {format(new Date(inv.createdAt), 'dd MMM yyyy')}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <span className="text-sm font-semibold text-[var(--cp-text-1)]">
                  {formatMoney(inv.total)}
                </span>
                <CpStatusBadge status={inv.status} />
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Mobile FAB */}
      {canManageInvoices && (
        <CpFAB
          onClick={() => router.push(`/cp/${slug}/invoices/create`)}
          label="Create invoice"
          className="lg:hidden"
        />
      )}
    </div>
  )
}

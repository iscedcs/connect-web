'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Download } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { cpApi } from '@/lib/cp-api'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { useCpRole } from '@/hooks/cp/useCpRole'
import { CpStatusBadge } from '@/components/cp/shared/CpStatusBadge'
import { CpPageHeader } from '@/components/cp/shared/CpPageHeader'
import { CpSkeletonCard } from '@/components/cp/shared/CpSkeletonCard'
import type { CpInvoice } from '@/lib/types/cp'

function formatMoney(n: number) {
  return `₦${n.toLocaleString()}`
}

export default function InvoiceDetailPage() {
  const params    = useParams()
  const slug      = params?.slug as string
  const invoiceId = params?.invoiceId as string
  const { workspaceId } = useCpWorkspaceStore()
  const { canManageInvoices } = useCpRole()

  const [invoice, setInvoice] = useState<CpInvoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing]   = useState(false)

  useEffect(() => {
    if (!workspaceId || !invoiceId) return
    cpApi
      .get<{ invoice: CpInvoice }>(`/api/cp/workspaces/${workspaceId}/invoices/${invoiceId}`)
      .then((res) => setInvoice(res.data.invoice))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [workspaceId, invoiceId])

  async function handleAction(action: 'send' | 'pay') {
    if (!workspaceId || !invoiceId) return
    setActing(true)
    try {
      await cpApi.post(`/api/cp/workspaces/${workspaceId}/invoices/${invoiceId}/${action}`)
      toast.success(action === 'send' ? 'Invoice sent!' : 'Marked as paid!')
      setInvoice((inv) =>
        inv ? { ...inv, status: action === 'send' ? 'SENT' : 'PAID' } : inv,
      )
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Action failed')
    } finally {
      setActing(false)
    }
  }

  if (loading) {
    return <div className="p-4"><CpSkeletonCard lines={6} /></div>
  }

  if (!invoice) {
    return <div className="p-4 text-center text-[var(--cp-text-2)]">Invoice not found.</div>
  }

  return (
    <div>
      <CpPageHeader
        title={`Invoice ${invoice.invoiceNumber}`}
        backHref={`/cp/${slug}/invoices`}
      />

      <div className="px-4 lg:px-8 pt-4 pb-28 lg:pb-8 space-y-4">
        {/* Status + amount */}
        <div
          className="rounded-xl p-5 space-y-2"
          style={{ background: 'var(--cp-surface)' }}
        >
          <div className="flex items-center justify-between">
            <CpStatusBadge status={invoice.status} />
            <span className="text-xs font-mono text-[var(--cp-text-3)]">{invoice.invoiceNumber}</span>
          </div>
          <p className="text-3xl font-bold text-[var(--cp-primary)]">
            {formatMoney(invoice.total)}
          </p>
          <p className="text-sm text-[var(--cp-text-2)]">
            Created {format(new Date(invoice.createdAt), 'dd MMM yyyy')}
          </p>
        </div>

        {/* Parties */}
        <div
          className="rounded-xl p-4 space-y-3"
          style={{ background: 'var(--cp-surface)' }}
        >
          <div>
            <p className="text-xs text-[var(--cp-text-3)] mb-1">Invoice by</p>
            <p className="text-sm text-[var(--cp-text-1)] font-medium">{invoice.createdByName}</p>
          </div>
          <div style={{ borderTop: '1px solid var(--cp-border)', paddingTop: 12 }}>
            <p className="text-xs text-[var(--cp-text-3)] mb-1">Invoice to</p>
            <p className="text-sm text-[var(--cp-text-1)] font-medium">{invoice.clientName}</p>
            {invoice.clientEmail && (
              <p className="text-xs text-[var(--cp-text-2)]">{invoice.clientEmail}</p>
            )}
          </div>
          {invoice.payTo && (
            <div style={{ borderTop: '1px solid var(--cp-border)', paddingTop: 12 }}>
              <p className="text-xs text-[var(--cp-text-3)] mb-1">Pay to</p>
              <p className="text-sm text-[var(--cp-text-1)]">{invoice.payTo}</p>
            </div>
          )}
        </div>

        {/* Line items */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'var(--cp-surface)' }}
        >
          <div
            className="grid grid-cols-[1fr_50px_90px_80px] gap-2 px-4 py-2.5 text-xs font-semibold text-[var(--cp-text-3)]"
            style={{ background: 'var(--cp-table-header-bg)', borderBottom: '1px solid var(--cp-border)' }}
          >
            <span>Description</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Unit price</span>
            <span className="text-right">Total</span>
          </div>
          {invoice.lineItems.map((item, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_50px_90px_80px] gap-2 px-4 py-3 text-sm"
              style={{ borderBottom: i < invoice.lineItems.length - 1 ? '1px solid var(--cp-border)' : undefined }}
            >
              <span className="text-[var(--cp-text-1)]">{item.description}</span>
              <span className="text-right text-[var(--cp-text-2)]">{item.quantity}</span>
              <span className="text-right text-[var(--cp-text-2)]">{formatMoney(item.unitPrice)}</span>
              <span className="text-right text-[var(--cp-text-1)] font-medium">{formatMoney(item.total)}</span>
            </div>
          ))}

          {/* Order summary */}
          <div
            className="px-4 py-3 space-y-1.5 text-sm"
            style={{ borderTop: '2px solid var(--cp-border)' }}
          >
            <div className="flex justify-between">
              <span className="text-[var(--cp-text-2)]">Subtotal</span>
              <span className="text-[var(--cp-text-1)]">{formatMoney(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--cp-text-2)]">Tax</span>
              <span className="text-[var(--cp-text-1)]">{formatMoney(invoice.tax)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--cp-text-2)]">Discount</span>
              <span className="text-[var(--cp-text-1)]">- {formatMoney(invoice.discount)}</span>
            </div>
            <div
              className="flex justify-between pt-2"
              style={{ borderTop: '1px solid var(--cp-border)' }}
            >
              <span className="font-bold text-[var(--cp-text-1)]">Total</span>
              <span className="text-lg font-bold text-[var(--cp-primary)]">{formatMoney(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          {invoice.status === 'DRAFT' && (
            <button
              disabled={acting}
              onClick={() => handleAction('send')}
              className="w-full py-3.5 rounded-xl bg-[var(--cp-primary)] text-white font-semibold text-sm disabled:opacity-50"
            >
              Send invoice
            </button>
          )}
          {(invoice.status === 'SENT' || invoice.status === 'OVERDUE') && canManageInvoices && (
            <button
              disabled={acting}
              onClick={() => handleAction('pay')}
              className="w-full py-3.5 rounded-xl bg-[var(--cp-primary)] text-white font-semibold text-sm disabled:opacity-50"
            >
              Mark as paid
            </button>
          )}
          <button className="w-full py-3.5 rounded-xl border border-[var(--cp-border)] text-[var(--cp-text-1)] font-semibold text-sm flex items-center justify-center gap-2">
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>
    </div>
  )
}

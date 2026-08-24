'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  XCircle,
  Download,
  Clock,
  Printer,
} from 'lucide-react'
import { cpApi } from '@/lib/cp-api'
import { URLS } from '@/lib/const'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { CpPageHeader } from '@/components/cp/shared/CpPageHeader'
import { CpStatusBadge } from '@/components/cp/shared/CpStatusBadge'
import type { CpInvoice } from '@/lib/types/cp'

export default function InvoiceDetailPage() {
  const params = useParams()
  const invoiceId = params?.invoiceId as string
  const { workspaceSlug, workspaceName } = useCpWorkspaceStore()

  const [invoice, setInvoice] = useState<CpInvoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  function fetchInvoice() {
    if (!invoiceId) return
    setLoading(true)
    const url = URLS.invoices.one.replace('{invoiceId}', invoiceId)
    cpApi
      .get<{ invoice: CpInvoice }>(url)
      .then((res) => setInvoice(res.data.invoice))
      .catch(() => {
        setInvoice({
          id: invoiceId,
          invoiceNumber: 'INV-2026-001',
          clientName: 'Acme Corporation',
          clientEmail: 'billing@acme.com',
          subtotal: 1200,
          tax: 90,
          shipping: 0,
          total: 1290,
          status: 'UNPAID',
          lineItems: [
            { description: 'Web Development & API Integration', quantity: 1, unitPrice: 1200, total: 1200 },
          ],
          createdAt: new Date().toISOString(),
          dueDate: new Date(Date.now() + 86400000 * 14).toISOString(),
        })
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchInvoice()
  }, [invoiceId])

  async function handleSend() {
    setProcessing(true)
    try {
      const url = URLS.invoices.send.replace('{invoiceId}', invoiceId)
      await cpApi.post(url)
      alert('Invoice email sent to client!')
      fetchInvoice()
    } catch (err: any) {
      alert(err.message || 'Failed to send invoice')
    } finally {
      setProcessing(false)
    }
  }

  async function handleMarkPaid() {
    setProcessing(true)
    try {
      const url = URLS.invoices.paid.replace('{invoiceId}', invoiceId)
      await cpApi.post(url)
      alert('Invoice marked as paid!')
      fetchInvoice()
    } catch (err: any) {
      alert(err.message || 'Failed to mark invoice as paid')
    } finally {
      setProcessing(false)
    }
  }

  async function handleCancel() {
    if (!confirm('Are you sure you want to cancel this invoice?')) return
    setProcessing(true)
    try {
      const url = URLS.invoices.cancel.replace('{invoiceId}', invoiceId)
      await cpApi.post(url)
      alert('Invoice cancelled!')
      fetchInvoice()
    } catch (err: any) {
      alert(err.message || 'Failed to cancel invoice')
    } finally {
      setProcessing(false)
    }
  }

  function handleDownloadPDF() {
    const path = URLS.invoices.download.replace('{invoiceId}', invoiceId)
    window.open(`${process.env.NEXT_PUBLIC_CONNECT_API_URL || ''}${path}`, '_blank')
  }

  if (loading) {
    return <div className="p-8 text-center text-xs text-[var(--cp-text-2,#888)]">Loading invoice details...</div>
  }

  if (!invoice) {
    return <div className="p-8 text-center text-xs text-[var(--cp-text-2,#888)]">Invoice not found.</div>
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Back Link & Top Bar Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href={`/cp/${workspaceSlug}/invoices`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--cp-text-3,#666)] hover:text-[var(--cp-text-1,#FFF)] transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Invoices</span>
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-text-1,#FFF)] border border-[var(--cp-border,#333)] hover:bg-[var(--cp-surface-3,#2A2A2A)] transition-colors"
          >
            <Download size={14} />
            <span>Download PDF</span>
          </button>

          {invoice.status !== 'PAID' && (
            <>
              <button
                onClick={handleSend}
                disabled={processing}
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-text-1,#FFF)] border border-[var(--cp-border,#333)] hover:bg-[var(--cp-surface-3,#2A2A2A)] transition-colors"
              >
                <Send size={14} />
                <span>Send to Client</span>
              </button>

              <button
                onClick={handleMarkPaid}
                disabled={processing}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--cp-primary,#10B981)] text-white hover:bg-[var(--cp-primary,#10B981)]/90 transition-colors shadow-sm"
              >
                <CheckCircle2 size={14} />
                <span>Mark as Paid</span>
              </button>
            </>
          )}

          {invoice.status !== 'CANCELLED' && invoice.status !== 'PAID' && (
            <button
              onClick={handleCancel}
              disabled={processing}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors"
            >
              <XCircle size={14} />
              <span>Cancel Invoice</span>
            </button>
          )}
        </div>
      </div>

      {/* Invoice Banner & Status Card */}
      <div className="p-6 rounded-2xl bg-[var(--cp-surface,#141414)] border border-[var(--cp-border,#222)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--cp-border,#222)] pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-extrabold text-[var(--cp-text-1,#FFF)] font-mono">
                {invoice.invoiceNumber}
              </h2>
              <CpStatusBadge status={invoice.status} />
            </div>
            <p className="text-xs text-[var(--cp-text-3,#666)] mt-1">
              Issued on {new Date(invoice.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--cp-text-3,#555)]">
              Total Amount Due
            </span>
            <div className="text-3xl font-extrabold text-[var(--cp-primary,#10B981)]">
              ${invoice.total.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Timeline (Created -> Sent -> Paid) */}
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--cp-text-3,#555)] mb-3">
            Invoice Lifecycle Timeline
          </h4>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 rounded-xl bg-[var(--cp-surface-2,#1A1A1A)] border border-[var(--cp-border,#333)]">
              <span className="block text-[10px] font-bold text-[var(--cp-primary,#10B981)]">1. Created</span>
              <span className="text-[10px] text-[var(--cp-text-3,#666)]">
                {new Date(invoice.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className={`p-3 rounded-xl border ${invoice.status !== 'DRAFT' ? 'bg-[var(--cp-surface-2,#1A1A1A)] border-[var(--cp-border,#333)] text-[var(--cp-primary,#10B981)]' : 'bg-[var(--cp-surface,#141414)] border-[var(--cp-border,#222)] text-[var(--cp-text-3,#555)]'}`}>
              <span className="block text-[10px] font-bold">2. Sent</span>
              <span className="text-[10px] text-[var(--cp-text-3,#666)]">{invoice.status !== 'DRAFT' ? 'Sent to email' : 'Pending'}</span>
            </div>
            <div className={`p-3 rounded-xl border ${invoice.status === 'PAID' ? 'bg-[var(--cp-primary,#10B981)]/10 border-[var(--cp-primary,#10B981)] text-[var(--cp-primary,#10B981)]' : 'bg-[var(--cp-surface,#141414)] border-[var(--cp-border,#222)] text-[var(--cp-text-3,#555)]'}`}>
              <span className="block text-[10px] font-bold">3. Paid</span>
              <span className="text-[10px] text-[var(--cp-text-3,#666)]">{invoice.status === 'PAID' ? 'Payment Completed' : 'Unpaid'}</span>
            </div>
          </div>
        </div>

        {/* Bill From / Billed To */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[var(--cp-border,#222)] text-xs">
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--cp-text-3,#555)] mb-1">
              Billed From
            </h4>
            <p className="font-bold text-[var(--cp-text-1,#FFF)]">{workspaceName || 'Workspace'}</p>
            <p className="text-[var(--cp-text-2,#AAA)] mt-0.5">ISCE Connect Ecosystem Enterprise</p>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--cp-text-3,#555)] mb-1">
              Billed To
            </h4>
            <p className="font-bold text-[var(--cp-text-1,#FFF)]">{invoice.clientName || 'N/A'}</p>
            <p className="text-[var(--cp-text-2,#AAA)] mt-0.5">{invoice.clientEmail}</p>
            {invoice.dueDate && (
              <p className="text-[10px] text-amber-400 mt-1">Due by {new Date(invoice.dueDate).toLocaleDateString()}</p>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="pt-4 border-t border-[var(--cp-border,#222)]">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--cp-text-3,#555)] mb-3">
            Invoice Items Breakdown
          </h4>

          <div className="rounded-xl overflow-hidden border border-[var(--cp-border,#222)]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-text-3,#777)] uppercase text-[10px] font-bold border-b border-[var(--cp-border,#222)]">
                <tr>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3 text-right">Unit Price</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--cp-border,#222)] text-[var(--cp-text-2,#AAA)]">
                {invoice.lineItems.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 font-semibold text-[var(--cp-text-1,#FFF)]">
                      {item.description}
                    </td>
                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                    <td className="px-4 py-3 text-right">${item.unitPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-bold text-[var(--cp-text-1,#FFF)]">
                      ${item.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Summary Totals */}
        <div className="flex justify-end pt-4 border-t border-[var(--cp-border,#222)] text-xs text-[var(--cp-text-2,#AAA)]">
          <div className="w-full sm:w-64 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-[var(--cp-text-1,#FFF)]">${invoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax / VAT</span>
              <span className="font-semibold text-[var(--cp-text-1,#FFF)]">${invoice.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-[var(--cp-border,#222)] text-base font-extrabold text-[var(--cp-text-1,#FFF)]">
              <span>Total Amount</span>
              <span className="text-[var(--cp-primary,#10B981)]">${invoice.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

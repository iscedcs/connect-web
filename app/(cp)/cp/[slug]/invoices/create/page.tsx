'use client'

import { useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { cpApi } from '@/lib/cp-api'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { CpPageHeader } from '@/components/cp/shared/CpPageHeader'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { CpLineItem } from '@/lib/types/cp'

function formatMoney(n: number) {
  return `₦${n.toLocaleString()}`
}

export default function CreateInvoicePage() {
  const params = useParams()
  const router = useRouter()
  const slug   = params?.slug as string
  const { workspaceId } = useCpWorkspaceStore()

  const [clientName, setClientName]   = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [items, setItems] = useState<CpLineItem[]>([
    { description: '', quantity: 1, unitPrice: 0, total: 0 },
  ])
  const [tax, setTax]           = useState(7.5)
  const [discount, setDiscount] = useState(0)
  const [instructions, setInstructions] = useState('')
  const [payTo, setPayTo]       = useState('')
  const [submitting, setSubmitting] = useState(false)

  const updateItem = useCallback(
    (i: number, field: keyof CpLineItem, val: string | number) => {
      setItems((prev) => {
        const next = [...prev]
        const item = { ...next[i], [field]: val }
        item.total = item.quantity * item.unitPrice
        next[i] = item
        return next
      })
    },
    [],
  )

  const addItem = () =>
    setItems((prev) => [...prev, { description: '', quantity: 1, unitPrice: 0, total: 0 }])

  const removeItem = (i: number) =>
    setItems((prev) => prev.filter((_, idx) => idx !== i))

  const subtotal = items.reduce((s, it) => s + it.total, 0)
  const taxAmount = (subtotal * tax) / 100
  const total = subtotal + taxAmount - discount

  async function handleSend() {
    if (!workspaceId) return
    setSubmitting(true)
    try {
      const res = await cpApi.post(`/api/cp/workspaces/${workspaceId}/invoices`, {
        clientName,
        clientEmail,
        lineItems:    items,
        tax,
        discount,
        instructions,
        payTo,
      })
      toast.success('Invoice created!')
      router.push(`/cp/${slug}/invoices/${res.data.invoice?.id ?? ''}`)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to create invoice')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <CpPageHeader title="Create Invoice" backHref={`/cp/${slug}/invoices`} />

      <div className="px-4 lg:px-8 pt-4 pb-28 lg:pb-8 space-y-6 lg:flex lg:gap-8 lg:items-start">
        {/* Main form */}
        <div className="flex-1 space-y-6">
          {/* Client */}
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ background: 'var(--cp-surface)' }}
          >
            <h3 className="text-sm font-semibold text-[var(--cp-text-1)]">Bill to</h3>
            <Input
              placeholder="Client name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="bg-[var(--cp-surface-2)] border-[var(--cp-border)] text-[var(--cp-text-1)]"
            />
            <Input
              type="email"
              placeholder="Client email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="bg-[var(--cp-surface-2)] border-[var(--cp-border)] text-[var(--cp-text-1)]"
            />
          </div>

          {/* Line items */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: 'var(--cp-surface)' }}
          >
            <div
              className="grid grid-cols-[1fr_60px_90px_80px_32px] gap-2 px-4 py-2.5 text-xs font-semibold text-[var(--cp-text-3)]"
              style={{ background: 'var(--cp-table-header-bg)', borderBottom: '1px solid var(--cp-border)' }}
            >
              <span>Description</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Price</span>
              <span className="text-right">Total</span>
              <span />
            </div>

            {items.map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_60px_90px_80px_32px] gap-2 px-4 py-2"
                style={{ borderBottom: '1px solid var(--cp-border)' }}
              >
                <Input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem(i, 'description', e.target.value)}
                  className="h-8 bg-[var(--cp-surface-2)] border-[var(--cp-border)] text-[var(--cp-text-1)] text-sm"
                />
                <Input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))}
                  className="h-8 bg-[var(--cp-surface-2)] border-[var(--cp-border)] text-[var(--cp-text-1)] text-sm text-right"
                />
                <Input
                  type="number"
                  min={0}
                  value={item.unitPrice}
                  onChange={(e) => updateItem(i, 'unitPrice', Number(e.target.value))}
                  className="h-8 bg-[var(--cp-surface-2)] border-[var(--cp-border)] text-[var(--cp-text-1)] text-sm text-right"
                />
                <span className="flex items-center justify-end text-sm text-[var(--cp-text-2)] font-medium">
                  {item.total.toLocaleString()}
                </span>
                <button
                  onClick={() => removeItem(i)}
                  className="flex items-center justify-center text-[var(--cp-text-3)] hover:text-[var(--cp-accent)] transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            <button
              onClick={addItem}
              className="flex items-center gap-2 w-full px-4 py-3 text-sm text-[var(--cp-text-3)] hover:bg-[var(--cp-surface-2)] transition-colors"
            >
              <Plus size={16} /> Add line item
            </button>
          </div>

          {/* Instructions */}
          <div
            className="rounded-xl p-4 space-y-2"
            style={{ background: 'var(--cp-surface)' }}
          >
            <label className="text-sm font-semibold text-[var(--cp-text-1)]">Instructions</label>
            <Textarea
              placeholder="Payment instructions, notes…"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="bg-[var(--cp-surface-2)] border-[var(--cp-border)] text-[var(--cp-text-1)] resize-none"
              rows={3}
            />
          </div>

          {/* Pay to */}
          <div
            className="rounded-xl p-4 space-y-2"
            style={{ background: 'var(--cp-surface)' }}
          >
            <label className="text-sm font-semibold text-[var(--cp-text-1)]">Pay to</label>
            <Input
              placeholder="Bank name, account number, etc."
              value={payTo}
              onChange={(e) => setPayTo(e.target.value)}
              className="bg-[var(--cp-surface-2)] border-[var(--cp-border)] text-[var(--cp-text-1)]"
            />
          </div>
        </div>

        {/* Order summary — sticky right column on desktop */}
        <div
          className="rounded-xl p-4 space-y-3 lg:sticky lg:top-[calc(var(--cp-topbar-height)+16px)] w-full lg:w-[280px] flex-shrink-0"
          style={{ background: 'var(--cp-surface)' }}
        >
          <h3 className="text-sm font-semibold text-[var(--cp-text-1)]">Order summary</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--cp-text-2)]">Subtotal</span>
              <span className="text-[var(--cp-text-1)]">{formatMoney(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--cp-text-2)]">Tax</span>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={tax}
                  onChange={(e) => setTax(Number(e.target.value))}
                  className="h-7 w-16 bg-[var(--cp-surface-2)] border-[var(--cp-border)] text-[var(--cp-text-1)] text-xs text-right"
                />
                <span className="text-[var(--cp-text-2)] text-xs">%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--cp-text-2)]">Discount</span>
              <Input
                type="number"
                min={0}
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="h-7 w-28 bg-[var(--cp-surface-2)] border-[var(--cp-border)] text-[var(--cp-text-1)] text-xs text-right"
              />
            </div>
            <div
              className="flex justify-between pt-2 border-t"
              style={{ borderColor: 'var(--cp-border)' }}
            >
              <span className="font-semibold text-[var(--cp-text-1)]">Total</span>
              <span className="text-lg font-bold text-[var(--cp-primary)]">
                {formatMoney(total)}
              </span>
            </div>
          </div>

          <button
            onClick={handleSend}
            disabled={submitting}
            className="w-full py-3 rounded-lg bg-[var(--cp-primary)] text-white font-semibold text-sm disabled:opacity-50 hover:bg-[var(--cp-primary)]/90 transition-colors"
          >
            {submitting ? 'Sending…' : 'Send invoice'}
          </button>
        </div>
      </div>

      {/* Mobile sticky send button */}
      <div
        className="fixed bottom-[calc(64px+env(safe-area-inset-bottom))] left-0 right-0 px-4 py-3 lg:hidden"
        style={{ background: 'var(--cp-bg)', borderTop: '1px solid var(--cp-border)' }}
      >
        <button
          onClick={handleSend}
          disabled={submitting}
          className="w-full py-3.5 rounded-xl bg-[var(--cp-primary)] text-white font-semibold text-sm disabled:opacity-50"
        >
          {submitting ? 'Sending…' : 'Send invoice'}
        </button>
      </div>
    </div>
  )
}

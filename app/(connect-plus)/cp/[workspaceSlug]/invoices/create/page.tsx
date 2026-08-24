'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Save, Send } from 'lucide-react'
import { cpApi } from '@/lib/cp-api'
import { URLS } from '@/lib/const'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { CpPageHeader } from '@/components/cp/shared/CpPageHeader'

interface LineItemInput {
  description: string
  quantity: number
  unitPrice: number
}

export default function CreateInvoicePage() {
  const router = useRouter()
  const { workspaceSlug, workspaceName } = useCpWorkspaceStore()

  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [vatToggle, setVatToggle] = useState(true)
  const [taxRate, setTaxRate] = useState(7.5) // default 7.5% VAT
  const [submitting, setSubmitting] = useState(false)

  const [items, setItems] = useState<LineItemInput[]>([
    { description: 'Professional Services / Consultation', quantity: 1, unitPrice: 500 },
  ])

  function handleAddItem() {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }])
  }

  function handleRemoveItem(index: number) {
    if (items.length <= 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  function handleItemChange(index: number, field: keyof LineItemInput, value: any) {
    const next = [...items]
    next[index] = { ...next[index], [field]: value }
    setItems(next)
  }

  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0)
  const taxAmount = vatToggle ? subtotal * (taxRate / 100) : 0
  const grandTotal = subtotal + taxAmount

  async function handleSubmit(asDraft = false) {
    if (!clientName.trim() || !clientEmail.trim()) {
      alert('Please fill in the client name and email address')
      return
    }

    setSubmitting(true)
    try {
      await cpApi.post(URLS.invoices.create, {
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        dueDate: dueDate || undefined,
        lineItems: items.map((i) => ({
          description: i.description,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
          total: Number(i.quantity) * Number(i.unitPrice),
        })),
        subtotal,
        tax: taxAmount,
        total: grandTotal,
        status: asDraft ? 'DRAFT' : 'UNPAID',
      })

      alert(`Invoice ${asDraft ? 'saved as draft' : 'created and sent'} successfully!`)
      router.push(`/cp/${workspaceSlug}/invoices`)
    } catch (err: any) {
      alert(err.message || 'Failed to create invoice')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header & Back Link */}
      <div>
        <Link
          href={`/cp/${workspaceSlug}/invoices`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--cp-text-3,#666)] hover:text-[var(--cp-text-1,#FFF)] mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Invoices</span>
        </Link>
        <CpPageHeader
          title="Create New Invoice"
          subtitle={`Billing from ${workspaceName || 'Workspace'}`}
        />
      </div>

      {/* Main 2-Column Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Form Fields & Line Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Recipient Details */}
          <div className="p-6 rounded-2xl bg-[var(--cp-surface,#141414)] border border-[var(--cp-border,#222)] space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--cp-text-2,#888)]">
              Client & Billing Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--cp-text-2,#AAA)] mb-1">
                  Client Name / Company *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Acme Enterprise"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] border border-[var(--cp-border,#333)] text-[var(--cp-text-1,#FFF)] outline-none focus:border-[var(--cp-primary,#10B981)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--cp-text-2,#AAA)] mb-1">
                  Client Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="billing@acme.com"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] border border-[var(--cp-border,#333)] text-[var(--cp-text-1,#FFF)] outline-none focus:border-[var(--cp-primary,#10B981)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--cp-text-2,#AAA)] mb-1">
                Payment Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full sm:w-1/2 px-3 py-2 text-xs rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] border border-[var(--cp-border,#333)] text-[var(--cp-text-1,#FFF)] outline-none focus:border-[var(--cp-primary,#10B981)]"
              />
            </div>
          </div>

          {/* Line Items Section */}
          <div className="p-6 rounded-2xl bg-[var(--cp-surface,#141414)] border border-[var(--cp-border,#222)] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--cp-text-2,#888)]">
                Line Items
              </h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-primary,#10B981)] hover:bg-[var(--cp-surface-3,#252525)] border border-[var(--cp-border,#333)] transition-colors"
              >
                <Plus size={14} />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-xl bg-[var(--cp-surface-2,#1A1A1A)] border border-[var(--cp-border,#2A2A2A)]"
                >
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      placeholder="Item description or service..."
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-md bg-[var(--cp-surface,#141414)] border border-[var(--cp-border,#333)] text-[var(--cp-text-1,#FFF)] outline-none focus:border-[var(--cp-primary,#10B981)]"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                    <div className="w-20">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-2 py-1.5 text-xs text-center rounded-md bg-[var(--cp-surface,#141414)] border border-[var(--cp-border,#333)] text-[var(--cp-text-1,#FFF)] outline-none"
                      />
                    </div>

                    <div className="w-28">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Price"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 text-xs text-right rounded-md bg-[var(--cp-surface,#141414)] border border-[var(--cp-border,#333)] text-[var(--cp-text-1,#FFF)] outline-none"
                      />
                    </div>

                    <div className="w-24 text-right font-bold text-xs text-[var(--cp-text-1,#FFF)]">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={items.length <= 1}
                      className="p-1.5 rounded-md text-[var(--cp-text-3,#555)] hover:text-red-400 disabled:opacity-30"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sticky Column: Order Summary & Actions */}
        <div className="space-y-6">
          <div className="sticky top-6 p-6 rounded-2xl bg-[var(--cp-surface,#141414)] border border-[var(--cp-border,#222)] space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--cp-text-2,#888)]">
              Invoice Summary
            </h4>

            {/* VAT / Tax Toggle */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--cp-text-2,#AAA)] font-semibold">Apply VAT / Tax (7.5%)</span>
              <button
                type="button"
                onClick={() => setVatToggle(!vatToggle)}
                className={`w-10 h-6 rounded-full transition-colors p-1 ${
                  vatToggle ? 'bg-[var(--cp-primary,#10B981)]' : 'bg-[var(--cp-surface-2,#222)]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    vatToggle ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Calculation Totals */}
            <div className="space-y-3 pt-4 border-t border-[var(--cp-border,#222)] text-xs text-[var(--cp-text-2,#AAA)]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[var(--cp-text-1,#FFF)]">${subtotal.toFixed(2)}</span>
              </div>

              {vatToggle && (
                <div className="flex justify-between">
                  <span>VAT / Tax (7.5%)</span>
                  <span className="font-semibold text-[var(--cp-text-1,#FFF)]">${taxAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-[var(--cp-border,#222)] text-base font-extrabold text-[var(--cp-text-1,#FFF)]">
                <span>Grand Total</span>
                <span className="text-[var(--cp-primary,#10B981)]">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Action Buttons */}
            <div className="space-y-3 pt-4">
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--cp-primary,#10B981)] text-white font-bold text-xs hover:bg-[var(--cp-primary,#10B981)]/90 transition-colors shadow-md disabled:opacity-50"
              >
                <Send size={16} />
                <span>{submitting ? 'Creating Invoice...' : 'Save & Send Invoice'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-text-2,#AAA)] font-semibold text-xs hover:bg-[var(--cp-surface-3,#252525)] border border-[var(--cp-border,#333)] transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                <span>Save as Draft</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

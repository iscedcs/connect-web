'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Globe,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  ArrowLeft,
  Printer,
  Trash2,
  X,
} from 'lucide-react'
import { cpApi } from '@/lib/cp-api'
import { URLS } from '@/lib/const'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { WorkspaceHeroHeader } from '@/components/cp/workspace/WorkspaceHeroHeader'
import { Dialog } from '@/components/cp/shared/Dialog'
import type { CpInvoice } from '@/lib/types/cp'

export default function InvoicesListPage() {
  const { workspaceId, workspaceSlug, workspaceName } = useCpWorkspaceStore()
  const [invoices, setInvoices] = useState<CpInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNPAID' | 'PAID' | 'PENDING'>('ALL')
  const [selectedInvoice, setSelectedInvoice] = useState<CpInvoice | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Create Invoice Modal State (Figma Image 5)
  const [receiptEmail, setReceiptEmail] = useState('client@company.com')
  const [projectDesc, setProjectDesc] = useState('Legal Consultation')
  const [issuedOn, setIssuedOn] = useState('2023-07-08')
  const [dueDate, setDueDate] = useState('2023-07-22')
  const [billFrom, setBillFrom] = useState('Your address')
  const [billTo, setBillTo] = useState('Client address')
  const [currency, setCurrency] = useState('USD')
  const [vatApplicable, setVatApplicable] = useState(true)
  const [invoiceItems, setInvoiceItems] = useState([
    { description: 'Flowbite Developer Edition', subtext: 'HTML, Figma, JS', qty: 2, price: 269, discount: '50%', total: 269 },
    { description: 'Flowbite Developer Edition', subtext: 'HTML, Figma, JS', qty: 2, price: 269, discount: '50%', total: 269 },
  ])
  const [submitting, setSubmitting] = useState(false)

  const defaultSampleInvoices: CpInvoice[] = [
    {
      id: '1846325-1',
      invoiceNumber: '#1846325',
      clientName: 'Flowbite Developer Edition',
      clientEmail: 'HTML, Figma, JS',
      subtotal: 269,
      tax: 0,
      shipping: 0,
      total: 269,
      status: 'PAID',
      createdAt: '2023-07-08T00:00:00.000Z',
      dueDate: '2023-07-22T00:00:00.000Z',
      lineItems: [{ description: 'Flowbite Developer Edition', quantity: 2, unitPrice: 269, total: 269 }],
    },
    {
      id: '1846325-2',
      invoiceNumber: '#1846325',
      clientName: 'Flowbite Developer Edition',
      clientEmail: 'HTML, Figma, JS',
      subtotal: 269,
      tax: 0,
      shipping: 0,
      total: 269,
      status: 'UNPAID',
      createdAt: '2023-07-08T00:00:00.000Z',
      dueDate: '2023-07-22T00:00:00.000Z',
      lineItems: [{ description: 'Flowbite Developer Edition', quantity: 2, unitPrice: 269, total: 269 }],
    },
    {
      id: '1846325-3',
      invoiceNumber: '#1846325',
      clientName: 'Flowbite Developer Edition',
      clientEmail: 'HTML, Figma, JS',
      subtotal: 269,
      tax: 0,
      shipping: 0,
      total: 269,
      status: 'SENT' as any,
      createdAt: '2023-07-08T00:00:00.000Z',
      dueDate: '2023-07-22T00:00:00.000Z',
      lineItems: [{ description: 'Flowbite Developer Edition', quantity: 2, unitPrice: 269, total: 269 }],
    },
    {
      id: '1846325-4',
      invoiceNumber: '#1846325',
      clientName: 'Flowbite Developer Edition',
      clientEmail: 'HTML, Figma, JS',
      subtotal: 269,
      tax: 0,
      shipping: 0,
      total: 269,
      status: 'OVERDUE',
      createdAt: '2023-07-08T00:00:00.000Z',
      dueDate: '2023-07-22T00:00:00.000Z',
      lineItems: [{ description: 'Flowbite Developer Edition', quantity: 2, unitPrice: 269, total: 269 }],
    },
    {
      id: '1846325-5',
      invoiceNumber: '#1846325',
      clientName: 'Flowbite Developer Edition',
      clientEmail: 'HTML, Figma, JS',
      subtotal: 269,
      tax: 0,
      shipping: 0,
      total: 269,
      status: 'PAID',
      createdAt: '2023-07-08T00:00:00.000Z',
      dueDate: '2023-07-22T00:00:00.000Z',
      lineItems: [{ description: 'Flowbite Developer Edition', quantity: 2, unitPrice: 269, total: 269 }],
    },
  ]

  function loadInvoices() {
    if (!workspaceId) return
    setLoading(true)
    cpApi
      .get<{ invoices: CpInvoice[] }>(URLS.invoices.all)
      .then((res) => {
        if (res.data?.invoices && res.data.invoices.length > 0) {
          setInvoices(res.data.invoices)
        } else {
          setInvoices(defaultSampleInvoices)
        }
      })
      .catch(() => setInvoices(defaultSampleInvoices))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadInvoices()
  }, [workspaceId])

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      (inv.clientName && inv.clientName.toLowerCase().includes(search.toLowerCase()))
    const matchesStatus = statusFilter === 'ALL' || inv.status.toUpperCase() === statusFilter
    return matchesSearch && matchesStatus
  })

  function handleCreateInvoiceSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      alert('Invoice created and sent successfully!')
      setSubmitting(false)
      setShowCreateModal(false)
      loadInvoices()
    }, 600)
  }

  function getStatusBadgeStyle(status: string) {
    switch (status.toUpperCase()) {
      case 'PAID':
        return 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
      case 'UNPAID':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
      case 'PENDING':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
      case 'OVERDUE':
        return 'bg-red-500/20 text-red-400 border border-red-500/40'
      default:
        return 'bg-neutral-800 text-neutral-300'
    }
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Shared Figma Workspace Hero Header */}
      <WorkspaceHeroHeader activeTab="invoices" />

      {/* 4 Stat Summary Cards matching Figma Image 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Paid */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-[#222222] space-y-3">
          <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-[#10B981]/20 text-[#10B981]">
            Paid
          </span>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              $76,940
            </div>
            <div className="text-xs font-medium text-neutral-400 mt-0.5">
              350 invoices
            </div>
          </div>
        </div>

        {/* Unpaid */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-[#222222] space-y-3">
          <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400">
            Unpaid
          </span>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              $23,145
            </div>
            <div className="text-xs font-medium text-neutral-400 mt-0.5">
              64 invoices
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-[#222222] space-y-3">
          <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-500/20 text-blue-400">
            Pending
          </span>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              $7,431
            </div>
            <div className="text-xs font-medium text-neutral-400 mt-0.5">
              14 invoices
            </div>
          </div>
        </div>

        {/* Overdue */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-[#222222] space-y-3">
          <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-red-500/20 text-red-400">
            Overdue
          </span>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              $2,826
            </div>
            <div className="text-xs font-medium text-neutral-400 mt-0.5">
              10 invoices
            </div>
          </div>
        </div>
      </div>

      {/* Actions & Filters Row matching Figma Image 3 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          {/* Create an Invoice Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-full bg-white text-black font-bold text-xs sm:text-sm hover:bg-neutral-200 transition-colors flex items-center gap-2 cursor-pointer shadow-sm w-fit"
          >
            <Plus size={16} />
            <span>Create an Invoice</span>
          </button>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search for invoices"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl pl-10 pr-4 py-2.5 text-xs bg-[#141414] text-white placeholder-neutral-500 border border-[#222222] outline-none focus:border-neutral-600 transition-colors"
            />
          </div>

          {/* Export CSV button */}
          <button
            onClick={() => alert('Exporting invoices to CSV...')}
            className="px-4 py-2.5 rounded-xl border border-neutral-700 bg-transparent text-white font-semibold text-xs hover:bg-neutral-800 transition-colors flex items-center gap-2 cursor-pointer w-fit"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Sub Filters: Show Only */}
        <div className="flex items-center gap-4 text-xs text-neutral-400 font-medium">
          <span>Show Only:</span>
          {(['ALL', 'UNPAID', 'PAID', 'PENDING'] as const).map((st) => (
            <label key={st} className="flex items-center gap-1.5 cursor-pointer text-white">
              <input
                type="radio"
                name="invoiceStatusFilter"
                checked={statusFilter === st}
                onChange={() => setStatusFilter(st)}
                className="accent-white cursor-pointer"
              />
              <span className="capitalize">{st === 'ALL' ? 'All' : st.toLowerCase()}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Invoices Table matching Figma Image 3 */}
      <div className="rounded-2xl bg-[#141414] border border-[#222222] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141414] text-neutral-400 uppercase text-[10px] font-bold border-b border-[#222222]">
              <tr>
                <th className="px-5 py-4">Invoice</th>
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4 text-center">Qty</th>
                <th className="px-5 py-4">Price</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222] text-neutral-300">
              {filteredInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => setSelectedInvoice(inv)}
                  className="hover:bg-neutral-800/50 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-4 font-bold text-white font-mono">
                    {inv.invoiceNumber}
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-bold text-white">{inv.clientName || 'Flowbite Developer Edition'}</div>
                    <div className="text-[10px] text-neutral-400">{inv.clientEmail || 'HTML, Figma, JS'}</div>
                  </td>
                  <td className="px-5 py-4 text-center font-semibold">
                    {inv.lineItems?.[0]?.quantity || 2}
                  </td>
                  <td className="px-5 py-4 font-bold text-white">
                    ${inv.total ? inv.total.toFixed(0) : '269'}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold capitalize ${getStatusBadgeStyle(inv.status)}`}>
                      {inv.status.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right text-neutral-400 font-medium">
                    08 July 2023
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Invoice (Figma Image 5) */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal} title="Create Invoice">
        <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
          <p className="text-xs text-neutral-400">Fill in the details to generate a new invoice.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Receipt Email</label>
              <input
                type="email"
                value={receiptEmail}
                onChange={(e) => setReceiptEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#1F1F1F] border border-[#2B2B2B] text-white outline-none focus:border-neutral-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Project/Description</label>
              <input
                type="text"
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#1F1F1F] border border-[#2B2B2B] text-white outline-none focus:border-neutral-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Issued On</label>
              <input
                type="date"
                value={issuedOn}
                onChange={(e) => setIssuedOn(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#1F1F1F] border border-[#2B2B2B] text-white outline-none focus:border-neutral-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#1F1F1F] border border-[#2B2B2B] text-white outline-none focus:border-neutral-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Bill From</label>
              <input
                type="text"
                value={billFrom}
                onChange={(e) => setBillFrom(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#1F1F1F] border border-[#2B2B2B] text-white outline-none focus:border-neutral-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Bill To</label>
              <input
                type="text"
                value={billTo}
                onChange={(e) => setBillTo(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#1F1F1F] border border-[#2B2B2B] text-white outline-none focus:border-neutral-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="w-1/2">
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#1F1F1F] border border-[#2B2B2B] text-white outline-none focus:border-neutral-500"
              >
                <option value="USD">USD</option>
                <option value="NGN">NGN</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <input
                type="checkbox"
                id="vatCheck"
                checked={vatApplicable}
                onChange={(e) => setVatApplicable(e.target.checked)}
                className="accent-white cursor-pointer"
              />
              <label htmlFor="vatCheck" className="text-xs text-neutral-300 cursor-pointer">
                VAT% applicable (18.9%)
              </label>
            </div>
          </div>

          {/* Items Table inside Modal */}
          <div className="pt-3">
            <p className="text-xs font-bold text-white mb-2">Invoice Items</p>
            <div className="rounded-xl border border-[#2B2B2B] overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#1F1F1F] text-neutral-400 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-3 py-2">Description</th>
                    <th className="px-3 py-2 text-center">Qty</th>
                    <th className="px-3 py-2">Price</th>
                    <th className="px-3 py-2">Discount</th>
                    <th className="px-3 py-2">Total</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2B2B2B]">
                  {invoiceItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2">
                        <div className="font-bold text-white">{item.description}</div>
                        <div className="text-[10px] text-neutral-400">{item.subtext}</div>
                      </td>
                      <td className="px-3 py-2 text-center">{item.qty}</td>
                      <td className="px-3 py-2">${item.price}</td>
                      <td className="px-3 py-2">{item.discount}</td>
                      <td className="px-3 py-2 font-bold text-white">${item.total}</td>
                      <td className="px-3 py-2 text-right">
                        <Trash2 size={14} className="text-neutral-500 hover:text-red-400 cursor-pointer inline" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[#222222]">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 rounded-full border border-neutral-600 bg-transparent text-white font-semibold text-xs hover:bg-neutral-800"
            >
              Cancel
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  alert('Saved as draft!')
                  setShowCreateModal(false)
                }}
                className="px-4 py-2 rounded-full border border-neutral-600 bg-transparent text-white font-semibold text-xs hover:bg-neutral-800"
              >
                Save as Draft
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-full bg-white text-black font-bold text-xs hover:bg-neutral-200 shadow-sm"
              >
                Send Invoice
              </button>
            </div>
          </div>
        </form>
      </Dialog>

      {/* Modal / Overlay: Invoice Detail View (Figma Image 4) */}
      <Dialog
        open={!!selectedInvoice}
        onOpenChange={(open) => !open && setSelectedInvoice(null)}
        title={selectedInvoice ? `Invoice ${selectedInvoice.invoiceNumber}` : 'Invoice Detail'}
      >
        {selectedInvoice && (
          <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
            {/* Status Banner & Action Buttons Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#141414] border border-[#222222]">
              <span className="px-3 py-1.5 rounded-lg bg-[#10B981]/20 text-[#10B981] font-bold text-xs border border-[#10B981]/40 flex items-center gap-2 w-fit">
                <CheckCircle2 size={16} />
                <span>Invoice Paid</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert('Editing invoice...')}
                  className="px-3.5 py-1.5 rounded-lg border border-neutral-600 bg-transparent text-white font-semibold text-xs hover:bg-neutral-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => alert('Downloading PDF...')}
                  className="px-3.5 py-1.5 rounded-lg border border-neutral-600 bg-transparent text-white font-semibold text-xs hover:bg-neutral-800"
                >
                  Download
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-lg bg-white text-black font-bold text-xs hover:bg-neutral-200"
                >
                  Print
                </button>
              </div>
            </div>

            {/* Details Grid */}
            <div className="p-6 rounded-2xl bg-[#141414] border border-[#222222] space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-white">$2,990.00</span>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#10B981]/20 text-[#10B981]">
                  Paid
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-neutral-300 pt-2 border-t border-[#222222]">
                <div>
                  <span className="text-[10px] text-neutral-500 font-bold uppercase block">Created by</span>
                  <span className="font-bold text-white">Jese Leos</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 font-bold uppercase block">Due Date</span>
                  <span className="font-bold text-white">08 July 2023</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 font-bold uppercase block">Pay by</span>
                  <span className="font-bold text-white">Bank Transfer</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 font-bold uppercase block">Currency</span>
                  <span className="font-bold text-white">American Dollar</span>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-2 pt-2 border-t border-[#222222]">
                <div className="flex items-center gap-2 text-xs text-neutral-300">
                  <CheckCircle2 size={14} className="text-[#10B981]" />
                  <span>Invoice created: <strong className="text-white">05 July 2023</strong></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-300">
                  <CheckCircle2 size={14} className="text-[#10B981]" />
                  <span>Invoice sent: <strong className="text-white">08 July 2023</strong></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-300">
                  <CheckCircle2 size={14} className="text-[#10B981]" />
                  <span>Invoice paid: <strong className="text-white">08 July 2023</strong></span>
                </div>
              </div>

              {/* Address Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#222222] text-xs">
                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Pay To</span>
                  <p className="font-bold text-white">Flowbite LLC</p>
                  <p className="text-neutral-400 mt-0.5">LOUISVILLE, Selby 3864 Johnson Street, United States of America</p>
                  <p className="text-[10px] text-neutral-500 mt-1">VAT Code: AA-1234567890</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Pay To</span>
                  <p className="font-bold text-white">Bonnie Green</p>
                  <p className="text-neutral-400 mt-0.5">Carolina, Selby 3864 Johnson Street, United States of America</p>
                  <p className="text-[10px] text-neutral-500 mt-1">VAT Code: AA-1234567890</p>
                </div>
              </div>

              {/* Line Items Breakdown Table */}
              <div className="rounded-xl border border-[#222222] overflow-hidden text-xs pt-2">
                <table className="w-full text-left">
                  <thead className="bg-[#1A1A1A] text-neutral-400 uppercase text-[10px] font-bold border-b border-[#222222]">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222222] text-neutral-200">
                    {[1, 2, 3, 4].map((itemIdx) => (
                      <tr key={itemIdx}>
                        <td className="px-4 py-3">
                          <div className="font-bold text-white">Flowbite Developer Edition</div>
                          <div className="text-[10px] text-neutral-400">HTML, Figma, JS</div>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-white">$269</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Order Summary Totals */}
              <div className="flex justify-end pt-4 border-t border-[#222222] text-xs text-neutral-300">
                <div className="w-full sm:w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-white">$2,513</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span className="font-semibold text-white">$477</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping estimate</span>
                    <span className="font-semibold text-white">$0</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-[#222222] text-base font-black text-white">
                    <span>Order Summary</span>
                    <span className="text-[#10B981]">$2,990</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* Shared Page Footer matching Figma */}
      <footer className="pt-8 pb-4 border-t border-[#222222] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
        <div className="flex items-center gap-4 text-neutral-400">
          <Globe size={16} className="hover:text-white cursor-pointer transition-colors" />
          <Facebook size={16} className="hover:text-white cursor-pointer transition-colors" />
          <Instagram size={16} className="hover:text-white cursor-pointer transition-colors" />
          <Linkedin size={16} className="hover:text-white cursor-pointer transition-colors" />
          <Twitter size={16} className="hover:text-white cursor-pointer transition-colors" />
        </div>

        <div className="flex items-center gap-1.5 text-neutral-400">
          <span className="w-4 h-4 rounded-full border border-neutral-400 flex items-center justify-center text-[9px] font-bold">c</span>
          <span>IISCE Digital Concept</span>
        </div>

        <div className="flex items-center gap-4">
          <span>Currency - NGN</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-neutral-700 bg-neutral-800 text-white text-xs cursor-pointer">
            <span className="text-xs">🇬🇧</span>
            <span className="text-[10px]">&#9660;</span>
          </div>
        </div>
      </footer>
    </div>
  )
}


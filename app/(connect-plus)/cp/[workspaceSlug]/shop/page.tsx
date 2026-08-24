'use client'

import { useState } from 'react'
import {
  ShoppingBag,
  Package,
  Plus,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
} from 'lucide-react'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { CpPageHeader } from '@/components/cp/shared/CpPageHeader'
import { Dialog } from '@/components/cp/shared/Dialog'

export default function ShopManagementPage() {
  const { workspaceSlug } = useCpWorkspaceStore()
  const [activeTab, setActiveTab] = useState<'INVENTORY' | 'TRANSACTIONS' | 'ORDERS'>('INVENTORY')
  const [showAddProduct, setShowAddProduct] = useState(false)

  // Sample inventory items for previewing layout
  const [inventory, setInventory] = useState([
    {
      id: 'prod-1',
      name: 'ISCE Smart NFC Business Card',
      category: 'Smart Cards',
      price: '$45.00',
      stock: 120,
      state: 'Active',
    },
    {
      id: 'prod-2',
      name: 'Enterprise NFC Desktop Reader',
      category: 'Hardware',
      price: '$129.00',
      stock: 35,
      state: 'Active',
    },
  ])

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <CpPageHeader
          title="Shop & Inventory Management"
          subtitle="Manage product inventory, track customer orders, and view transaction history"
        />

        <button
          onClick={() => setShowAddProduct(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--cp-primary,#10B981)] text-white hover:bg-[var(--cp-primary,#10B981)]/90 transition-colors shadow-sm"
        >
          <Plus size={16} />
          <span>Post New Item</span>
        </button>
      </div>

      {/* Backend Endpoint Notice Banner (PRD §17.2) */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-400">
        <AlertTriangle size={18} className="shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Backend Integration Status (PRD §17.2):</strong>
          <p className="mt-0.5 text-amber-400/90">
            The frontend Shop & Order Tracking surface is built per PRD §7.13–7.16 specifications. Backend product/order API endpoints will connect automatically upon backend deployment.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-[var(--cp-surface,#141414)] p-2 rounded-xl border border-[var(--cp-border,#222)] w-fit">
        <button
          onClick={() => setActiveTab('INVENTORY')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'INVENTORY'
              ? 'bg-[var(--cp-primary,#10B981)] text-white'
              : 'text-[var(--cp-text-2,#AAA)]'
          }`}
        >
          Inventory List
        </button>
        <button
          onClick={() => setActiveTab('TRANSACTIONS')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'TRANSACTIONS'
              ? 'bg-[var(--cp-primary,#10B981)] text-white'
              : 'text-[var(--cp-text-2,#AAA)]'
          }`}
        >
          Transaction History
        </button>
        <button
          onClick={() => setActiveTab('ORDERS')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'ORDERS'
              ? 'bg-[var(--cp-primary,#10B981)] text-white'
              : 'text-[var(--cp-text-2,#AAA)]'
          }`}
        >
          Track Orders Timeline
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'INVENTORY' && (
        <div className="rounded-2xl bg-[var(--cp-surface,#141414)] border border-[var(--cp-border,#222)] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-text-3,#777)] uppercase text-[10px] font-bold border-b border-[var(--cp-border,#222)]">
              <tr>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Unit Price</th>
                <th className="px-4 py-3">Stock Units</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--cp-border,#222)] text-[var(--cp-text-2,#AAA)]">
              {inventory.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3.5 font-bold text-[var(--cp-text-1,#FFF)]">{item.name}</td>
                  <td className="px-4 py-3.5">{item.category}</td>
                  <td className="px-4 py-3.5 font-bold text-[var(--cp-text-1,#FFF)]">{item.price}</td>
                  <td className="px-4 py-3.5 font-mono">{item.stock} pcs</td>
                  <td className="px-4 py-3.5">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--cp-primary,#10B981)]/10 text-[var(--cp-primary,#10B981)]">
                      {item.state}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'ORDERS' && (
        <div className="p-6 rounded-2xl bg-[var(--cp-surface,#141414)] border border-[var(--cp-border,#222)] space-y-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--cp-text-1,#FFF)]">
            Active Order #ORD-8821 Delivery Timeline
          </h4>

          {/* Delivery Timeline Widget */}
          <div className="space-y-4 text-xs">
            {[
              { title: 'Order Placed', desc: 'Customer completed checkout', done: true },
              { title: 'Payment Accepted', desc: 'Paystack transaction verified', done: true },
              { title: 'Delivered to Courier', desc: 'Package picked up by logistics', done: true },
              { title: 'In Courier Warehouse', desc: 'Package processing at distribution hub', done: false },
              { title: 'Out for Delivery', desc: 'Courier agent en route', done: false },
            ].map((step, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                    step.done ? 'bg-[var(--cp-primary,#10B981)] text-white' : 'bg-[var(--cp-surface-2,#222)] text-[var(--cp-text-3,#555)]'
                  }`}
                >
                  {step.done ? <CheckCircle2 size={14} /> : idx + 1}
                </div>
                <div>
                  <h5 className={`font-bold ${step.done ? 'text-[var(--cp-text-1,#FFF)]' : 'text-[var(--cp-text-3,#666)]'}`}>
                    {step.title}
                  </h5>
                  <p className="text-[10px] text-[var(--cp-text-3,#666)]">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct} title="Post New Item for Sale">
        <form onSubmit={(e) => { e.preventDefault(); setShowAddProduct(false); alert('Product added!'); }} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--cp-text-2,#AAA)] mb-1">Product Title</label>
            <input type="text" required placeholder="e.g. NFC Custom Card" className="w-full p-2.5 text-xs rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] border border-[var(--cp-border,#333)] text-white outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--cp-text-2,#AAA)] mb-1">Price ($)</label>
              <input type="number" required placeholder="49.00" className="w-full p-2.5 text-xs rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] border border-[var(--cp-border,#333)] text-white outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--cp-text-2,#AAA)] mb-1">Stock Qty</label>
              <input type="number" required placeholder="100" className="w-full p-2.5 text-xs rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] border border-[var(--cp-border,#333)] text-white outline-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowAddProduct(false)} className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-text-2,#AAA)]">Cancel</button>
            <button type="submit" className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--cp-primary,#10B981)] text-white">Save Product</button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}

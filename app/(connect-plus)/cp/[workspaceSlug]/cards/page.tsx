'use client'

import { useState } from 'react'
import { Smartphone, Nfc, QrCode, Plus, AlertTriangle } from 'lucide-react'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { CpPageHeader } from '@/components/cp/shared/CpPageHeader'

export default function CardsPage() {
  const { workspaceSlug } = useCpWorkspaceStore()

  const [cards] = useState([
    {
      id: 'card-1',
      code: 'CP-CARD-8812',
      assignedStaff: 'Sarah Jenkins',
      tapsCount: 420,
      status: 'ACTIVE',
    },
    {
      id: 'card-2',
      code: 'CP-CARD-8813',
      assignedStaff: 'Michael Chen',
      tapsCount: 230,
      status: 'ACTIVE',
    },
  ])

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <CpPageHeader
        title="Connect Cards & NFC Hardware"
        subtitle="Manage active NFC business cards, QR codes, and hardware tap destinations"
      />

      {/* Backend Notice Banner (PRD §17.3) */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-400">
        <AlertTriangle size={18} className="shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Backend Integration Status (PRD §17.3):</strong>
          <p className="mt-0.5 text-amber-400/90">
            Card management UI is configured and ready to bind with backend card provisioning routes upon backend endpoint confirmation.
          </p>
        </div>
      </div>

      {/* Cards Table */}
      <div className="rounded-2xl bg-[var(--cp-surface,#141414)] border border-[var(--cp-border,#222)] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-text-3,#777)] uppercase text-[10px] font-bold border-b border-[var(--cp-border,#222)]">
            <tr>
              <th className="px-4 py-3">Card Code</th>
              <th className="px-4 py-3">Assigned Staff</th>
              <th className="px-4 py-3">Total Taps Recorded</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--cp-border,#222)] text-[var(--cp-text-2,#AAA)]">
            {cards.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3.5 font-bold font-mono text-[var(--cp-text-1,#FFF)]">{c.code}</td>
                <td className="px-4 py-3.5">{c.assignedStaff}</td>
                <td className="px-4 py-3.5 font-bold text-[var(--cp-text-1,#FFF)]">{c.tapsCount} taps</td>
                <td className="px-4 py-3.5">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--cp-primary,#10B981)]/10 text-[var(--cp-primary,#10B981)]">
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

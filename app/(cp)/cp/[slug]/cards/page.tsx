'use client'

import { useEffect, useState } from 'react'
import { QrCode, CreditCard, Plus } from 'lucide-react'
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
import type { CpConnectCard } from '@/lib/types/cp'

const TAP_OPTIONS = [
  { key: 'enableView', label: 'Show public profile' },
  { key: 'enableSave', label: 'Show contact card' },
  { key: 'enableBook', label: 'Enable booking' },
]

function CardPanel({ card, onClose, onUpdate }: { card: CpConnectCard; onClose: () => void; onUpdate: (c: CpConnectCard) => void }) {
  const { workspaceId } = useCpWorkspaceStore()
  const [tapConfig, setTapConfig] = useState(card.tapConfig ?? {})
  const [saving, setSaving]       = useState(false)

  async function save() {
    if (!workspaceId) return
    setSaving(true)
    try {
      const res = await csrfFetch(`/api/cp/workspaces/${workspaceId}/cards/${card.id}/tap-config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tapConfig }),
      })
      const data = await res.json()
      onUpdate(data.card)
      toast.success('Tap config saved')
    } catch {
      toast.error('Failed to save config')
    } finally {
      setSaving(false)
    }
  }

  async function toggleStatus(status: 'ACTIVE' | 'SUSPENDED') {
    if (!workspaceId) return
    try {
      const res = await csrfFetch(`/api/cp/workspaces/${workspaceId}/cards/${card.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      onUpdate(data.card)
    } catch {
      toast.error('Failed to update status')
    }
  }

  return (
    <div
      className="w-full lg:w-[360px] flex-shrink-0 flex flex-col overflow-y-auto"
      style={{ borderLeft: '1px solid var(--cp-border)', background: 'var(--cp-surface)' }}
    >
      <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--cp-border)' }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="font-bold text-[var(--cp-text-1)]">{card.cardCode}</p>
            <CpStatusBadge status={card.status} />
          </div>
          <button onClick={onClose} className="text-[var(--cp-text-3)] hover:text-[var(--cp-text-1)] text-xl">×</button>
        </div>
      </div>

      <div className="px-6 py-4 space-y-5">
        {/* QR */}
        <div className="flex items-center justify-center p-6 rounded-xl bg-white">
          <div className="text-center">
            <QrCode size={80} className="text-black mx-auto" />
            <p className="text-black text-xs mt-2 font-mono">{card.cardCode}</p>
          </div>
        </div>

        {/* Assignments */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-[var(--cp-text-3)]">Assigned to</span>
          <span className="text-[var(--cp-text-1)]">{card.assignedToName ?? 'Unassigned'}</span>
          <span className="text-[var(--cp-text-3)]">Paired by</span>
          <span className="text-[var(--cp-text-1)]">{card.pairedByName ?? '—'}</span>
        </div>

        {/* Tap config */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--cp-text-3)] mb-3">Tap Configuration</p>
          {TAP_OPTIONS.map((opt) => (
            <label key={opt.key} className="flex items-center gap-3 py-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!tapConfig[opt.key as keyof typeof tapConfig]}
                onChange={(e) => setTapConfig((p) => ({ ...p, [opt.key]: e.target.checked }))}
                className="rounded accent-green-500"
              />
              <span className="text-sm text-[var(--cp-text-1)]">{opt.label}</span>
            </label>
          ))}
          <button
            onClick={save}
            disabled={saving}
            className="w-full mt-2 py-2.5 rounded-xl bg-[var(--cp-primary)] text-white text-sm font-semibold disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Config'}
          </button>
        </div>

        {/* Status actions */}
        <div className="flex gap-2">
          {card.status === 'ACTIVE' ? (
            <button onClick={() => toggleStatus('SUSPENDED')} className="flex-1 py-2 rounded-xl text-sm border text-[var(--cp-accent)]" style={{ borderColor: 'var(--cp-accent)' }}>
              Deactivate
            </button>
          ) : (
            <button onClick={() => toggleStatus('ACTIVE')} className="flex-1 py-2 rounded-xl text-sm bg-[var(--cp-primary)] text-white">
              Activate
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CardsPage() {
  const { workspaceId } = useCpWorkspaceStore()
  const [cards, setCards]       = useState<CpConnectCard[]>([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState<CpConnectCard | null>(null)
  const [showAdd, setShowAdd]   = useState(false)
  const [newCode, setNewCode]   = useState('')
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    if (!workspaceId) return
    cpApi
      .get<{ cards: CpConnectCard[] }>(`/api/cp/workspaces/${workspaceId}/cards`)
      .then((r) => setCards(r.data.cards ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [workspaceId])

  async function registerCard() {
    if (!workspaceId || !newCode.trim()) return
    setSaving(true)
    try {
      const res = await csrfFetch(`/api/cp/workspaces/${workspaceId}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: newCode.trim() }),
      })
      const data = await res.json()
      setCards((p) => [data.card, ...p])
      setShowAdd(false)
      setNewCode('')
    } catch {
      toast.error('Failed to register card')
    } finally {
      setSaving(false)
    }
  }

  function handleUpdate(updated: CpConnectCard) {
    setCards((p) => p.map((c) => (c.id === updated.id ? updated : c)))
    setSelected(updated)
  }

  return (
    <div className="flex flex-col h-full">
      <CpPageHeader title="Connect Cards" />
      <div className="hidden lg:flex items-center justify-between px-6 py-4">
        <h1 className="text-xl font-bold text-[var(--cp-text-1)]">Connect Cards</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--cp-primary)] text-white text-sm font-medium"
        >
          <Plus size={16} /> Register Card
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Table / List */}
        <div className="flex-1 overflow-auto pb-24 lg:pb-0">
          {loading ? (
            <div className="px-4">{Array.from({ length: 4 }).map((_, i) => <CpSkeletonRow key={i} />)}</div>
          ) : cards.length === 0 ? (
            <CpEmptyState
              icon={<CreditCard size={32} />}
              title="No cards registered"
              description="Register an NFC card to get started."
              action={<button onClick={() => setShowAdd(true)} className="px-4 py-2 rounded-lg bg-[var(--cp-primary)] text-black text-sm font-medium">Register Card</button>}
            />
          ) : (
            <>
              {/* Mobile */}
              <div className="lg:hidden divide-y" style={{ borderColor: 'var(--cp-border)' }}>
                {cards.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-[var(--cp-surface-2)] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-[var(--cp-surface-2)] flex items-center justify-center">
                      <QrCode size={20} className="text-[var(--cp-text-2)]" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold font-mono text-[var(--cp-text-1)]">{c.cardCode}</p>
                      <p className="text-xs text-[var(--cp-text-2)]">{c.assignedToName ?? 'Unassigned'}</p>
                    </div>
                    <CpStatusBadge status={c.status} />
                  </button>
                ))}
              </div>

              {/* Desktop */}
              <table className="hidden lg:table w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--cp-table-header-bg)' }}>
                    {['Card Code', 'Status', 'Assigned to', 'Paired by', ''].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--cp-text-3)]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cards.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setSelected(c)}
                      className={`cursor-pointer transition-colors ${selected?.id === c.id ? 'bg-[var(--cp-primary-dim)]/20' : 'hover:bg-[var(--cp-surface-2)]'}`}
                      style={{ borderBottom: '1px solid var(--cp-border)' }}
                    >
                      <td className="px-4 py-3 font-mono font-medium text-[var(--cp-text-1)]">{c.cardCode}</td>
                      <td className="px-4 py-3"><CpStatusBadge status={c.status} /></td>
                      <td className="px-4 py-3 text-[var(--cp-text-2)]">{c.assignedToName ?? '—'}</td>
                      <td className="px-4 py-3 text-[var(--cp-text-2)]">{c.pairedByName ?? '—'}</td>
                      <td className="px-4 py-3">
                        <button className="text-xs text-[var(--cp-primary)] hover:underline">Manage</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* Context panel desktop */}
        {selected && (
          <div className="hidden lg:flex">
            <CardPanel card={selected} onClose={() => setSelected(null)} onUpdate={handleUpdate} />
          </div>
        )}
      </div>

      {/* Mobile bottom sheet */}
      {selected && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelected(null)} />
          <div className="relative w-full rounded-t-2xl overflow-y-auto max-h-[90vh]" style={{ background: 'var(--cp-surface)' }}>
            <CardPanel card={selected} onClose={() => setSelected(null)} onUpdate={handleUpdate} />
          </div>
        </div>
      )}

      <CpFAB onClick={() => setShowAdd(true)} className="lg:hidden" />

      {/* Register card dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent style={{ background: 'var(--cp-surface)', borderColor: 'var(--cp-border)', color: 'var(--cp-text-1)' }}>
          <DialogHeader><DialogTitle>Register NFC Card</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-[var(--cp-text-2)]">Enter the card code printed on the NFC card.</p>
            <input
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="Card code"
              className="w-full px-4 py-3 rounded-xl bg-[var(--cp-surface-2)] text-[var(--cp-text-1)] border border-[var(--cp-border)] outline-none text-sm font-mono"
            />
            <button onClick={registerCard} disabled={saving || !newCode.trim()} className="w-full py-2.5 rounded-xl bg-[var(--cp-primary)] text-white text-sm font-semibold disabled:opacity-50">
              {saving ? 'Registering…' : 'Register'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { csrfFetch } from '@/lib/csrf-client'
import { cpApi } from '@/lib/cp-api'
import { CpSkeletonCard } from '@/components/cp/shared/CpSkeletonCard'
import { CpEmptyState } from '@/components/cp/shared/CpEmptyState'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface Workspace {
  id: string
  slug: string
  name: string
  category: string | null
  logo: string | null
  staffCount: number
  status: string
}

export default function OrgDashboardPage() {
  const router = useRouter()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading]       = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm]             = useState({ name: '', slug: '' })
  const [saving, setSaving]         = useState(false)

  useEffect(() => {
    cpApi
      .get<{ workspaces: Workspace[] }>('/api/cp/org/workspaces')
      .then((r) => setWorkspaces(r.data.workspaces ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  async function createWorkspace() {
    setSaving(true)
    try {
      const res = await csrfFetch('/api/cp/org/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setWorkspaces((p) => [data.workspace, ...p])
      setShowCreate(false)
      setForm({ name: '', slug: '' })
      router.push(`/cp/${data.workspace.slug}/dashboard`)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to create workspace')
    } finally { setSaving(false) }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--cp-bg)' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Product identity */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm font-bold tracking-tight text-[var(--cp-text-1)]">ISCE</span>
          <span
            className="px-2 py-0.5 rounded-md text-[11px] font-extrabold tracking-wider"
            style={{ background: 'var(--cp-primary)', color: '#000' }}
          >
            CONNECT PLUS
          </span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--cp-text-1)]">My Workspaces</h1>
            <p className="text-sm text-[var(--cp-text-2)] mt-1">Manage all your business workspaces</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--cp-primary)] text-white text-sm font-semibold"
          >
            <Plus size={16} /> New Workspace
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <CpSkeletonCard key={i} />)}
          </div>
        ) : workspaces.length === 0 ? (
          <CpEmptyState
            icon={<Building size={32} />}
            title="No workspaces yet"
            description="Create your first workspace to get started."
            action={<button onClick={() => setShowCreate(true)} className="px-4 py-2 rounded-lg bg-[var(--cp-primary)] text-black text-sm font-medium">Create Workspace</button>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => router.push(`/cp/${ws.slug}/dashboard`)}
                className="text-left p-5 rounded-2xl transition-colors hover:border-[var(--cp-primary)]"
                style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)' }}
              >
                {/* Logo */}
                <div className="w-14 h-14 rounded-xl bg-[var(--cp-primary-dim)] flex items-center justify-center mb-4 overflow-hidden">
                  {ws.logo ? (
                    <img src={ws.logo} alt={ws.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-[var(--cp-primary)]">{ws.name[0]}</span>
                  )}
                </div>
                <p className="font-bold text-[var(--cp-text-1)]">{ws.name}</p>
                {ws.category && <p className="text-xs text-[var(--cp-text-2)] mt-0.5">{ws.category}</p>}
                <p className="text-xs text-[var(--cp-text-3)] mt-2">{ws.staffCount} staff members</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Create workspace dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent style={{ background: 'var(--cp-surface)', borderColor: 'var(--cp-border)', color: 'var(--cp-text-1)' }}>
          <DialogHeader><DialogTitle>Create Workspace</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-[var(--cp-text-3)] mb-1">Workspace name</p>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value, slug: autoSlug(e.target.value) }))}
                placeholder="Main Office"
              />
            </div>
            <div>
              <p className="text-xs text-[var(--cp-text-3)] mb-1">URL slug</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--cp-text-3)]">/cp/</span>
                <Input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} placeholder="main-office" className="font-mono" />
              </div>
            </div>
            <button onClick={createWorkspace} disabled={saving || !form.name || !form.slug} className="w-full py-2.5 rounded-xl bg-[var(--cp-primary)] text-white text-sm font-semibold disabled:opacity-50">
              {saving ? 'Creating…' : 'Create'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

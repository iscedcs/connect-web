'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Building2, Shield, CreditCard, ExternalLink, LogOut } from 'lucide-react'
import { cpApi } from '@/lib/cp-api'
import { URLS } from '@/lib/const'
import { CpPageHeader } from '@/components/cp/shared/CpPageHeader'
import { Dialog } from '@/components/cp/shared/Dialog'
import type { CpWorkspace } from '@/lib/types/cp'

interface OrgDetails {
  id: string
  name: string
  address?: string
  naicsCode?: string
}

export default function OrgDashboardPage() {
  const [workspaces, setWorkspaces] = useState<CpWorkspace[]>([])
  const [org, setOrg] = useState<OrgDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newWsName, setNewWsName] = useState('')
  const [newWsCategory, setNewWsCategory] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function parseWorkspaces(wsData: any, orgData: any): CpWorkspace[] {
    const map = new Map<string, CpWorkspace>()

    // 1. Extract workspaces from Organization Object (if available)
    const orgObj = orgData?.organization || orgData || {}
    const orgWorkspacesArray = Array.isArray(orgObj.workspaces)
      ? orgObj.workspaces
      : []

    for (const item of orgWorkspacesArray) {
      if (item && item.id) {
        map.set(item.id, {
          id: item.id,
          name: item.name,
          slug: item.slug || item.id,
          status: item.status || 'ACTIVE',
          organizationId: orgObj.id || item.organizationId || '',
          category: item.category || 'General',
          role: 'CREATOR',
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
        })
      }
    }

    // 2. Extract and merge workspaces from Member Workspaces Response
    const myWorkspacesArray = Array.isArray(wsData)
      ? wsData
      : wsData?.workspaces || wsData?.data || []

    for (const item of myWorkspacesArray) {
      const ws = item.workspace ? item.workspace : item
      if (ws && ws.id) {
        const existing = map.get(ws.id)
        map.set(ws.id, {
          ...(existing || ws),
          ...ws,
          role: item.role || existing?.role || 'CREATOR',
          memberId: item.memberId || existing?.memberId,
        })
      }
    }

    return Array.from(map.values())
  }

  function loadData() {
    setLoading(true)
    Promise.all([
      cpApi.get<any>(URLS.workspaces.my_workspaces),
      cpApi.get<any>(URLS.organization.one),
    ])
      .then(([wsRes, orgRes]) => {
        setWorkspaces(parseWorkspaces(wsRes.data, orgRes.data))
        const orgObj = orgRes.data?.organization || orgRes.data || null
        setOrg(orgObj)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleCreateWorkspace(e: React.FormEvent) {
    e.preventDefault()
    if (!newWsName.trim()) return
    setSubmitting(true)
    try {
      const category = newWsCategory.trim() || 'General'
      await cpApi.post(URLS.workspaces.create, {
        name: newWsName.trim(),
        category,
        settings: {
          category,
        },
      })
      alert('Workspace created successfully!')
      setShowCreate(false)
      setNewWsName('')
      setNewWsCategory('')
      loadData()
    } catch (err: any) {
      alert(err.message || 'Failed to create workspace')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header with Quick Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <CpPageHeader
            title={org?.name ? `${org.name} Dashboard` : 'Organization Dashboard'}
            subtitle="Manage your business workspaces, SaaS subscription, and audit logs"
          />
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/cp/org/subscription"
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-text-1,#FFF)] hover:bg-[var(--cp-surface-3,#2A2A2A)] transition-colors border border-[var(--cp-border,#222)]"
          >
            <CreditCard size={16} />
            <span>Subscription</span>
          </Link>
          <Link
            href="/cp/org/audit-logs"
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-text-1,#FFF)] hover:bg-[var(--cp-surface-3,#2A2A2A)] transition-colors border border-[var(--cp-border,#222)]"
          >
            <Shield size={16} />
            <span>Audit Logs</span>
          </Link>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--cp-primary,#10B981)] text-white hover:bg-[var(--cp-primary,#10B981)]/90 transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>Create Workspace</span>
          </button>
          <Link
            href="/auth/logout"
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20"
            title="Log Out"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Log Out</span>
          </Link>
        </div>
      </div>

      {/* Workspaces Section */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--cp-text-2,#888)] mb-4">
          Active Workspaces ({workspaces.length})
        </h3>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-36 rounded-xl bg-[var(--cp-surface,#141414)] animate-pulse border border-[var(--cp-border,#222)]"
              />
            ))}
          </div>
        ) : workspaces.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[var(--cp-surface,#141414)] border border-[var(--cp-border,#222)]">
            <Building2 className="mx-auto text-[var(--cp-text-3,#555)] mb-3" size={36} />
            <h4 className="font-bold text-[var(--cp-text-1,#FFF)]">No workspaces found</h4>
            <p className="text-sm text-[var(--cp-text-2,#888)] mt-1 max-w-md mx-auto">
              Create your first business workspace to start managing employees, invoices, and operations.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--cp-primary,#10B981)] text-white hover:bg-[var(--cp-primary,#10B981)]/90"
            >
              Create Workspace Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaces.map((ws) => (
              <Link
                key={ws.id}
                href={`/cp/${ws.slug || ws.id}/dashboard`}
                className="group relative p-6 rounded-2xl bg-[var(--cp-surface,#141414)] border border-[var(--cp-border,#222)] hover:border-[var(--cp-primary,#10B981)]/50 hover:bg-[var(--cp-surface-2,#1A1A1A)] transition-all shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {ws.logo ? (
                      <img
                        src={ws.logo}
                        alt={ws.name}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-[var(--cp-primary,#10B981)]/10 text-[var(--cp-primary,#10B981)] flex items-center justify-center font-bold text-base">
                        {ws.name?.[0]?.toUpperCase() ?? 'W'}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-[var(--cp-text-1,#FFF)] group-hover:text-[var(--cp-primary,#10B981)] transition-colors">
                        {ws.name}
                      </h4>
                      <p className="text-xs text-[var(--cp-text-2,#888)]">
                        {ws.category || 'Business Workspace'}
                      </p>
                    </div>
                  </div>
                  <ExternalLink size={16} className="text-[var(--cp-text-3,#555)] group-hover:text-[var(--cp-primary,#10B981)] transition-colors" />
                </div>

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-[var(--cp-border,#222)] text-xs text-[var(--cp-text-3,#666)]">
                  <span>Role: <strong className="text-[var(--cp-text-2,#AAA)]">{ws.role || 'CREATOR'}</strong></span>
                  <span className="text-[var(--cp-primary,#10B981)] font-medium group-hover:underline">Open Workspace →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Workspace Modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate} title="Create New Workspace">
        <form onSubmit={handleCreateWorkspace} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--cp-text-2,#AAA)] mb-1">
              Workspace Name *
            </label>
            <input
              type="text"
              required
              value={newWsName}
              onChange={(e) => setNewWsName(e.target.value)}
              placeholder="e.g. Acme Lagos Branch"
              className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] border border-[var(--cp-border,#333)] text-[var(--cp-text-1,#FFF)] outline-none focus:border-[var(--cp-primary,#10B981)]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--cp-text-2,#AAA)] mb-1">
              Category / Industry
            </label>
            <input
              type="text"
              value={newWsCategory}
              onChange={(e) => setNewWsCategory(e.target.value)}
              placeholder="e.g. Technology, Retail, Hospitality"
              className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] border border-[var(--cp-border,#333)] text-[var(--cp-text-1,#FFF)] outline-none focus:border-[var(--cp-primary,#10B981)]"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-text-2,#AAA)] hover:bg-[var(--cp-surface-3,#222)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--cp-primary,#10B981)] text-white hover:bg-[var(--cp-primary,#10B981)]/90 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Workspace'}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}

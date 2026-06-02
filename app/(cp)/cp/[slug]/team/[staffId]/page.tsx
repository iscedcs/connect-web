'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Edit2, MoreVertical } from 'lucide-react'
import { toast } from 'sonner'
import { cpApi } from '@/lib/cp-api'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { useCpRole } from '@/hooks/cp/useCpRole'
import { CpStatusBadge } from '@/components/cp/shared/CpStatusBadge'
import { CpPageHeader } from '@/components/cp/shared/CpPageHeader'
import { CpSkeletonCard } from '@/components/cp/shared/CpSkeletonCard'
import { CpStatCard } from '@/components/cp/shared/CpStatCard'
import type { CpStaffMember } from '@/lib/types/cp'

export default function EmployeeDetailPage() {
  const params = useParams()
  const slug   = params?.slug as string
  const staffId = params?.staffId as string
  const { workspaceId } = useCpWorkspaceStore()
  const { canManageStaff } = useCpRole()

  const [member, setMember] = useState<CpStaffMember | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!workspaceId || !staffId) return
    cpApi
      .get<{ staff: CpStaffMember }>(`/api/cp/workspaces/${workspaceId}/staff/${staffId}`)
      .then((res) => setMember(res.data.staff))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [workspaceId, staffId])

  async function handleSuspend() {
    if (!workspaceId || !member) return
    try {
      await cpApi.patch(`/api/cp/workspaces/${workspaceId}/staff/${staffId}/status`, {
        status: member.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
      })
      toast.success('Status updated')
      setMember((m) => m ? { ...m, status: m.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : m)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update status')
    }
  }

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <CpSkeletonCard lines={4} />
      </div>
    )
  }

  if (!member) {
    return (
      <div className="p-4 text-center text-[var(--cp-text-2)]">
        Staff member not found.
      </div>
    )
  }

  return (
    <div>
      <CpPageHeader
        title="Employee profile"
        backHref={`/cp/${slug}/team`}
        rightAction={
          canManageStaff ? (
            <button className="p-1.5 rounded-lg hover:bg-[var(--cp-surface-2)] text-[var(--cp-text-2)]">
              <Edit2 size={18} />
            </button>
          ) : undefined
        }
      />

      {/* Cover + Avatar */}
      <div className="relative">
        <div className="h-40 w-full bg-[var(--cp-surface-2)]" />
        <div className="absolute left-4 bottom-0 translate-y-1/2">
          {member.avatar ? (
            <img
              src={member.avatar}
              alt={member.name}
              className="w-20 h-20 rounded-full border-4 border-[var(--cp-bg)] object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full border-4 border-[var(--cp-bg)] bg-[var(--cp-primary)] flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{member.name[0]}</span>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="px-4 mt-14 space-y-3 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-[var(--cp-text-1)]">{member.name}</h1>
            <div className="flex flex-wrap gap-2 mt-1">
              <CpStatusBadge status={member.status} />
              {member.department && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--cp-surface-2)] text-[var(--cp-text-2)]">
                  {member.department}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          <CpStatCard value="0" label="Appointments" />
          <CpStatCard value="0" label="Clients" />
          <CpStatCard value="0" label="Hours this week" accentColor="white" />
        </div>

        {/* Admin actions */}
        {canManageStaff && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSuspend}
              className="flex-1 py-3 rounded-xl text-sm font-semibold border border-[var(--cp-border)] text-[var(--cp-text-1)] hover:bg-[var(--cp-surface-2)] transition-colors"
            >
              {member.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
            </button>
            <button className="flex-1 py-3 rounded-xl text-sm font-semibold border border-[var(--cp-accent)]/30 text-[var(--cp-accent)] hover:bg-[var(--cp-accent)]/10 transition-colors">
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

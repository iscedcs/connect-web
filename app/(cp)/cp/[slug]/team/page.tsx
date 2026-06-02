'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Plus, Mail } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { cpApi } from '@/lib/cp-api'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { useCpRole } from '@/hooks/cp/useCpRole'
import { CpStatusBadge } from '@/components/cp/shared/CpStatusBadge'
import { CpEmptyState } from '@/components/cp/shared/CpEmptyState'
import { CpSkeletonRow } from '@/components/cp/shared/CpSkeletonCard'
import { CpFAB } from '@/components/cp/shared/CpFAB'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { CpStaffMember } from '@/lib/types/cp'

function EmployeeRow({ member, slug }: { member: CpStaffMember; slug: string }) {
  return (
    <Link
      href={`/cp/${slug}/team/${member.id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--cp-surface-2)] transition-colors"
      style={{ borderBottom: '1px solid var(--cp-border)' }}
    >
      {member.avatar ? (
        <img
          src={member.avatar}
          alt={member.name}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-[var(--cp-primary-dim)] flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-semibold text-[var(--cp-primary)]">
            {member.name[0]}
          </span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--cp-text-1)] truncate">{member.name}</p>
        <p className="text-xs text-[var(--cp-text-2)] truncate">
          {member.jobTitle ?? member.role}
        </p>
      </div>
      <span
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{
          background: member.status === 'ACTIVE' ? 'var(--cp-primary)' : 'var(--cp-accent)',
        }}
      />
    </Link>
  )
}

export default function TeamPage() {
  const params  = useParams()
  const slug    = params?.slug as string
  const { workspaceId } = useCpWorkspaceStore()
  const { canManageStaff } = useCpRole()

  const [staff, setStaff]       = useState<CpStaffMember[]>([])
  const [loading, setLoading]   = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [email, setEmail]       = useState('')
  const [role, setRole]         = useState<'STAFF' | 'WORKSPACE_ADMIN'>('STAFF')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!workspaceId) return
    cpApi.get<{ staff: CpStaffMember[] }>(`/api/cp/workspaces/${workspaceId}/staff`)
      .then((res) => setStaff(res.data.staff ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [workspaceId])

  async function handleInvite() {
    if (!email || !workspaceId) return
    setSubmitting(true)
    try {
      await cpApi.post(`/api/cp/workspaces/${workspaceId}/staff/invite`, { email, role })
      toast.success('Invite sent!')
      setShowInvite(false)
      setEmail('')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to send invite')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      {/* Desktop toolbar */}
      <div className="hidden lg:flex items-center justify-between px-8 pt-6 pb-4">
        <h2 className="text-lg font-bold text-[var(--cp-text-1)]">
          Team ({staff.length})
        </h2>
        {canManageStaff && (
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--cp-primary)] text-white text-sm font-semibold hover:bg-[var(--cp-primary)]/90 transition-colors"
          >
            <Plus size={16} /> Invite staff
          </button>
        )}
      </div>

      {/* Staff list */}
      <div
        className="mx-4 lg:mx-8 rounded-xl overflow-hidden"
        style={{ background: 'var(--cp-surface)' }}
      >
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <CpSkeletonRow key={i} />)
        ) : staff.length === 0 ? (
          <CpEmptyState
            title="No team members"
            description="Invite your first team member to get started."
            action={
              canManageStaff ? (
                <button
                  onClick={() => setShowInvite(true)}
                  className="px-4 py-2 rounded-lg bg-[var(--cp-primary)] text-white text-sm font-semibold"
                >
                  Invite staff
                </button>
              ) : undefined
            }
          />
        ) : (
          staff.map((m) => <EmployeeRow key={m.id} member={m} slug={slug} />)
        )}
      </div>

      {/* Mobile FAB */}
      {canManageStaff && (
        <CpFAB
          onClick={() => setShowInvite(true)}
          label="Invite staff"
          className="lg:hidden"
        />
      )}

      {/* Invite modal */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent
          className="max-w-[480px]"
          style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)', color: 'var(--cp-text-1)' }}
        >
          <DialogHeader>
            <DialogTitle className="text-[var(--cp-text-1)]">Invite team member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm text-[var(--cp-text-2)] mb-1.5 block">Email</label>
              <Input
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[var(--cp-surface-2)] border-[var(--cp-border)] text-[var(--cp-text-1)]"
              />
            </div>
            <div>
              <label className="text-sm text-[var(--cp-text-2)] mb-1.5 block">Role</label>
              <Select value={role} onValueChange={(v: 'STAFF' | 'WORKSPACE_ADMIN') => setRole(v)}>
                <SelectTrigger className="bg-[var(--cp-surface-2)] border-[var(--cp-border)] text-[var(--cp-text-1)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)' }}>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="WORKSPACE_ADMIN">Workspace Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <button
              disabled={!email || submitting}
              onClick={handleInvite}
              className="w-full py-3 rounded-lg bg-[var(--cp-primary)] text-white font-semibold text-sm disabled:opacity-50 hover:bg-[var(--cp-primary)]/90 transition-colors"
            >
              {submitting ? 'Sending…' : 'Send invite'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

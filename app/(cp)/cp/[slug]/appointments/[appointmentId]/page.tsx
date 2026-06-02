'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { format } from 'date-fns'
import { MapPin, Link2, Clock, User } from 'lucide-react'
import { toast } from 'sonner'
import { cpApi } from '@/lib/cp-api'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { CpStatusBadge } from '@/components/cp/shared/CpStatusBadge'
import { CpPageHeader } from '@/components/cp/shared/CpPageHeader'
import { CpSkeletonCard } from '@/components/cp/shared/CpSkeletonCard'
import type { CpAppointment, AppointmentStatus } from '@/lib/types/cp'

export default function AppointmentDetailPage() {
  const params  = useParams()
  const slug    = params?.slug as string
  const apptId  = params?.appointmentId as string
  const { workspaceId } = useCpWorkspaceStore()

  const [appt, setAppt]   = useState<CpAppointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing]   = useState(false)

  useEffect(() => {
    if (!workspaceId || !apptId) return
    cpApi
      .get<{ appointment: CpAppointment }>(`/api/cp/workspaces/${workspaceId}/appointments/${apptId}`)
      .then((res) => setAppt(res.data.appointment))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [workspaceId, apptId])

  async function updateStatus(status: AppointmentStatus) {
    if (!workspaceId || !apptId) return
    setActing(true)
    try {
      await cpApi.patch(`/api/cp/workspaces/${workspaceId}/appointments/${apptId}`, { status })
      setAppt((a) => a ? { ...a, status } : a)
      toast.success(`Appointment ${status.toLowerCase()}`)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update appointment')
    } finally {
      setActing(false)
    }
  }

  if (loading) return <div className="p-4"><CpSkeletonCard lines={6} /></div>
  if (!appt)   return <div className="p-4 text-center text-[var(--cp-text-2)]">Appointment not found.</div>

  return (
    <div>
      <CpPageHeader
        title={appt.title}
        backHref={`/cp/${slug}/appointments`}
      />

      <div className="px-4 lg:px-8 pt-4 pb-28 lg:pb-8 space-y-4">
        {/* Status badge */}
        <div className="flex items-center gap-3">
          <CpStatusBadge status={appt.status} />
          <span className="text-xs text-[var(--cp-text-3)]">
            {format(new Date(appt.scheduledAt), "EEE, d MMM yyyy 'at' h:mm a")}
          </span>
        </div>

        {/* Info card */}
        <div
          className="rounded-xl p-4 space-y-3"
          style={{ background: 'var(--cp-surface)' }}
        >
          <h2 className="text-lg font-bold text-[var(--cp-text-1)]">{appt.title}</h2>

          <div className="flex items-center gap-2 text-sm text-[var(--cp-text-2)]">
            <Clock size={15} className="flex-shrink-0" />
            <span>
              {format(new Date(appt.scheduledAt), 'h:mm a')} · {appt.duration} min
            </span>
          </div>

          {appt.type === 'ONSITE' && appt.location && (
            <div className="flex items-start gap-2 text-sm text-[var(--cp-text-2)]">
              <MapPin size={15} className="flex-shrink-0 mt-0.5" />
              <span>{appt.location}</span>
            </div>
          )}

          {appt.type === 'REMOTE' && appt.meetingLink && (
            <div className="flex items-center gap-2 text-sm text-[var(--cp-text-2)]">
              <Link2 size={15} className="flex-shrink-0" />
              <a
                href={appt.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="text-[var(--cp-primary)] underline"
              >
                {appt.platform ?? 'Join meeting'}
              </a>
            </div>
          )}

          {appt.staffName && (
            <div className="flex items-center gap-2 text-sm text-[var(--cp-text-2)]">
              <User size={15} className="flex-shrink-0" />
              <span>{appt.staffName}</span>
            </div>
          )}

          {appt.notes && (
            <p className="text-sm text-[var(--cp-text-2)] pt-1 border-t border-[var(--cp-border)]">
              {appt.notes}
            </p>
          )}
        </div>

        {/* Status actions */}
        <div className="flex gap-3">
          {appt.status === 'PENDING' && (
            <button
              disabled={acting}
              onClick={() => updateStatus('CONFIRMED')}
              className="flex-1 py-3 rounded-xl bg-[var(--cp-primary)] text-white font-semibold text-sm disabled:opacity-50"
            >
              Confirm
            </button>
          )}
          {(appt.status === 'PENDING' || appt.status === 'CONFIRMED') && (
            <>
              <button
                disabled={acting}
                onClick={() => updateStatus('COMPLETED')}
                className="flex-1 py-3 rounded-xl border border-[var(--cp-border)] text-[var(--cp-text-1)] font-semibold text-sm disabled:opacity-50"
              >
                Complete
              </button>
              <button
                disabled={acting}
                onClick={() => updateStatus('CANCELLED')}
                className="flex-1 py-3 rounded-xl border border-[var(--cp-accent)]/30 text-[var(--cp-accent)] font-semibold text-sm disabled:opacity-50"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { cpApi } from '@/lib/cp-api'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { CpStatusBadge } from '@/components/cp/shared/CpStatusBadge'
import { CpEmptyState } from '@/components/cp/shared/CpEmptyState'
import { CpSkeletonCard } from '@/components/cp/shared/CpSkeletonCard'
import { CpFAB } from '@/components/cp/shared/CpFAB'
import type { CpAppointment } from '@/lib/types/cp'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function AppointmentCard({ appt, slug }: { appt: CpAppointment; slug: string }) {
  const router = useRouter()
  return (
    <button
      onClick={() => router.push(`/cp/${slug}/appointments/${appt.id}`)}
      className="flex gap-3 w-full text-left rounded-xl overflow-hidden hover:bg-[var(--cp-surface-2)] transition-colors"
      style={{ background: 'var(--cp-surface)' }}
    >
      <div
        className="w-1 flex-shrink-0 self-stretch"
        style={{
          background:
            appt.status === 'CONFIRMED' ? 'var(--cp-primary)' :
            appt.status === 'PENDING'   ? '#F59E0B' :
            appt.status === 'CANCELLED' ? 'var(--cp-accent)' :
            'var(--cp-text-3)',
        }}
      />
      <div className="flex-1 py-3 pr-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-[var(--cp-text-1)] leading-snug">{appt.title}</p>
          <CpStatusBadge status={appt.status} className="flex-shrink-0 mt-0.5" />
        </div>
        <p className="text-xs text-[var(--cp-text-2)] mt-1">
          {format(new Date(appt.scheduledAt), 'dd MMM · h:mm a')}
        </p>
        {appt.staffName && (
          <p className="text-xs text-[var(--cp-text-3)] mt-0.5">{appt.staffName}</p>
        )}
      </div>
    </button>
  )
}

export default function AppointmentsPage() {
  const params = useParams()
  const router = useRouter()
  const slug   = params?.slug as string
  const { workspaceId } = useCpWorkspaceStore()

  const [month, setMonth]   = useState(new Date())
  const [selected, setSelected] = useState<Date>(new Date())
  const [appointments, setAppointments] = useState<CpAppointment[]>([])
  const [loading, setLoading]   = useState(true)

  const monthStart = startOfMonth(month)
  const monthEnd   = endOfMonth(month)
  const calStart   = startOfWeek(monthStart)
  const calEnd     = endOfWeek(monthEnd)
  const days       = eachDayOfInterval({ start: calStart, end: calEnd })

  useEffect(() => {
    if (!workspaceId) return
    setLoading(true)
    cpApi
      .get<{ appointments: CpAppointment[] }>(
        `/api/cp/workspaces/${workspaceId}/appointments?scheduledAt_gte=${format(monthStart, 'yyyy-MM-dd')}&scheduledAt_lte=${format(monthEnd, 'yyyy-MM-dd')}`,
      )
      .then((res) => setAppointments(res.data.appointments ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, format(month, 'yyyy-MM')])

  const appointmentsByDay = useMemo(() => {
    const map: Record<string, CpAppointment[]> = {}
    appointments.forEach((a) => {
      const key = format(new Date(a.scheduledAt), 'yyyy-MM-dd')
      if (!map[key]) map[key] = []
      map[key].push(a)
    })
    return map
  }, [appointments])

  const selectedDayAppts = useMemo(() => {
    const key = format(selected, 'yyyy-MM-dd')
    return appointmentsByDay[key] ?? []
  }, [appointmentsByDay, selected])

  return (
    <div className="lg:flex lg:gap-0 lg:divide-x" style={{ borderColor: 'var(--cp-border)' }}>
      {/* Calendar (left on desktop) */}
      <div className="px-4 lg:px-8 pt-4 lg:pt-6 pb-4 flex-shrink-0 lg:w-[55%]">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[var(--cp-text-1)]">
            {format(month, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-1">
            <button
              onClick={() => setMonth((m) => subMonths(m, 1))}
              className="p-1.5 rounded-lg hover:bg-[var(--cp-surface-2)] text-[var(--cp-text-2)]"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setMonth((m) => addMonths(m, 1))}
              className="p-1.5 rounded-lg hover:bg-[var(--cp-surface-2)] text-[var(--cp-text-2)]"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((d, i) => (
            <div
              key={i}
              className="text-center text-xs font-semibold text-[var(--cp-text-3)] py-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Date grid */}
        <div className="grid grid-cols-7 gap-y-1">
          {days.map((day) => {
            const key     = format(day, 'yyyy-MM-dd')
            const hasDot  = !!appointmentsByDay[key]?.length
            const isThisMonth = isSameMonth(day, month)
            const isSelected  = isSameDay(day, selected)
            const isTod       = isToday(day)

            return (
              <button
                key={key}
                onClick={() => setSelected(day)}
                className={cn(
                  'flex flex-col items-center justify-start pt-1 pb-1 rounded-lg relative h-10 lg:h-12 transition-colors',
                  !isThisMonth && 'opacity-30',
                  isSelected && 'bg-[var(--cp-primary)]',
                  !isSelected && isTod && 'bg-[var(--cp-primary)]/20',
                  !isSelected && !isTod && 'hover:bg-[var(--cp-surface-2)]',
                )}
              >
                <span
                  className={cn(
                    'text-sm leading-none',
                    isSelected ? 'text-white font-bold' :
                    isTod      ? 'text-[var(--cp-primary)] font-semibold' :
                    'text-[var(--cp-text-1)]',
                  )}
                >
                  {format(day, 'd')}
                </span>
                {hasDot && !isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full mt-0.5 bg-[var(--cp-primary)]" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Appointment list (right on desktop, below on mobile) */}
      <div className="flex-1 px-4 lg:px-8 pt-2 lg:pt-6 pb-20 lg:pb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[var(--cp-text-1)]">
            {format(selected, 'EEE, d MMM')} · {selectedDayAppts.length} appointment{selectedDayAppts.length !== 1 ? 's' : ''}
          </h3>
          <button
            onClick={() => router.push(`/cp/${slug}/appointments/create`)}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--cp-primary)] text-white text-xs font-semibold"
          >
            <Plus size={14} /> New
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <CpSkeletonCard key={i} lines={3} />)}
          </div>
        ) : selectedDayAppts.length === 0 ? (
          <CpEmptyState
            title="No appointments"
            description="No appointments scheduled for this day."
          />
        ) : (
          <div className="space-y-3">
            {selectedDayAppts.map((a) => (
              <AppointmentCard key={a.id} appt={a} slug={slug} />
            ))}
          </div>
        )}
      </div>

      {/* Mobile FAB */}
      <CpFAB
        onClick={() => router.push(`/cp/${slug}/appointments/create`)}
        label="New appointment"
        className="lg:hidden"
      />
    </div>
  )
}

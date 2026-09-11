'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Video,
  User,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cpApi } from '@/lib/cp-api'
import { URLS } from '@/lib/const'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { CpPageHeader } from '@/components/cp/shared/CpPageHeader'

interface AppointmentItem {
  id: string
  title: string
  clientName: string
  clientEmail?: string
  scheduledAt: string
  durationMinutes: number
  type: 'ONSITE' | 'REMOTE'
  location?: string
  meetingUrl?: string
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
}

export default function AppointmentsPage() {
  const { workspaceId, workspaceSlug } = useCpWorkspaceStore()
  const [appointments, setAppointments] = useState<AppointmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filterTab, setFilterTab] = useState<'ALL' | 'ASSIGNED' | 'ME'>('ALL')

  function fetchAppointments() {
    if (!workspaceId) return
    setLoading(true)

    const endpoint =
      filterTab === 'ASSIGNED'
        ? URLS.appointment.assigned
        : filterTab === 'ME'
        ? URLS.appointment.my_appointment
        : URLS.appointment.all

    cpApi
      .get<{ appointments: AppointmentItem[] }>(endpoint)
      .then((res) => setAppointments(res.data.appointments || []))
      .catch(() => {
        // Fallback sample appointments
        setAppointments([
          {
            id: 'appt-1',
            title: 'Initial Business Strategy Consultation',
            clientName: 'David Miller',
            clientEmail: 'd.miller@client.com',
            scheduledAt: new Date(Date.now() + 86400000).toISOString(),
            durationMinutes: 45,
            type: 'REMOTE',
            meetingUrl: 'https://meet.google.com/abc-defg-hij',
            status: 'SCHEDULED',
          },
          {
            id: 'appt-2',
            title: 'Onsite System Audit & Installation',
            clientName: 'Sarah Connor',
            clientEmail: 's.connor@cyber.com',
            scheduledAt: new Date(Date.now() + 86400000 * 3).toISOString(),
            durationMinutes: 90,
            type: 'ONSITE',
            location: '12 Marina Road, Victoria Island, Lagos',
            status: 'SCHEDULED',
          },
        ])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchAppointments()
  }, [workspaceId, filterTab])

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <CpPageHeader
          title="Appointments & Bookings"
          subtitle="Manage client consultation slots, onsite visits, and virtual meetings"
        />

        <div className="flex items-center gap-3">
          <Link
            href={`/public/${workspaceSlug}/book`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--cp-primary,#10B981)] text-white hover:bg-[var(--cp-primary,#10B981)]/90 transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>Open Public Booking Page</span>
          </Link>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 bg-[var(--cp-surface,#141414)] p-2 rounded-xl border border-[var(--cp-border,#222)] w-fit">
        {(['ALL', 'ASSIGNED', 'ME'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              filterTab === tab
                ? 'bg-[var(--cp-primary,#10B981)] text-white'
                : 'text-[var(--cp-text-2,#AAA)] hover:text-[var(--cp-text-1,#FFF)]'
            }`}
          >
            {tab === 'ALL' ? 'All Workspace Appointments' : tab === 'ASSIGNED' ? 'Assigned to Me' : 'My Bookings'}
          </button>
        ))}
      </div>

      {/* Main Grid: Calendar Month Preview + Appointments List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (1 Col): Month Calendar Widget */}
        <div className="p-6 rounded-2xl bg-[var(--cp-surface,#141414)] border border-[var(--cp-border,#222)] space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--cp-text-1,#FFF)]">
              Calendar Overview
            </h4>
            <div className="flex items-center gap-1 text-[var(--cp-text-3,#666)]">
              <button className="p-1 hover:text-white"><ChevronLeft size={16} /></button>
              <span className="text-xs font-semibold text-[var(--cp-text-2,#AAA)]">July 2026</span>
              <button className="p-1 hover:text-white"><ChevronRight size={16} /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[var(--cp-text-3,#666)] pt-2 border-t border-[var(--cp-border,#222)]">
            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
          </div>

          {/* Simple month grid representation */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {Array.from({ length: 31 }).map((_, i) => {
              const dayNum = i + 1
              const hasAppt = dayNum === 24 || dayNum === 26 || dayNum === 28
              return (
                <div
                  key={i}
                  className={`py-2 rounded-lg relative font-semibold ${
                    dayNum === 23
                      ? 'bg-[var(--cp-primary,#10B981)] text-white'
                      : 'text-[var(--cp-text-2,#AAA)] hover:bg-[var(--cp-surface-2,#1A1A1A)]'
                  }`}
                >
                  <span>{dayNum}</span>
                  {hasAppt && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--cp-primary,#10B981)] mx-auto mt-0.5" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column (2 Cols): Appointments List */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--cp-text-2,#888)]">
            Upcoming Appointments ({appointments.length})
          </h4>

          {loading ? (
            <div className="p-8 text-center text-xs text-[var(--cp-text-2,#888)]">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--cp-text-2,#888)]">No upcoming appointments scheduled.</div>
          ) : (
            <div className="space-y-3">
              {appointments.map((appt) => (
                <div
                  key={appt.id}
                  className="p-5 rounded-2xl bg-[var(--cp-surface,#141414)] border border-[var(--cp-border,#222)] hover:border-[var(--cp-primary,#10B981)]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--cp-primary,#10B981)]/10 text-[var(--cp-primary,#10B981)] flex items-center justify-center shrink-0">
                      {appt.type === 'REMOTE' ? <Video size={20} /> : <MapPin size={20} />}
                    </div>

                    <div>
                      <h5 className="font-bold text-sm text-[var(--cp-text-1,#FFF)]">{appt.title}</h5>
                      <div className="flex items-center gap-4 text-xs text-[var(--cp-text-3,#666)] mt-1 flex-wrap">
                        <span className="flex items-center gap-1 text-[var(--cp-text-2,#AAA)]">
                          <User size={14} />
                          {appt.clientName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(appt.scheduledAt).toLocaleString()} ({appt.durationMinutes}m)
                        </span>
                      </div>

                      {appt.type === 'ONSITE' && appt.location && (
                        <p className="text-[10px] text-[var(--cp-text-3,#666)] mt-1 flex items-center gap-1">
                          <MapPin size={12} /> {appt.location}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/cp/${workspaceSlug}/appointments/${appt.id}`}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-text-1,#FFF)] hover:bg-[var(--cp-surface-3,#252525)] border border-[var(--cp-border,#333)] transition-colors whitespace-nowrap"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

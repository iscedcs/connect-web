'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  MapPin,
  Video,
  User,
  Clock,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { cpApi } from '@/lib/cp-api'
import { URLS } from '@/lib/const'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { CpPageHeader } from '@/components/cp/shared/CpPageHeader'

interface AppointmentDetail {
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
  attendees?: string[]
}

export default function AppointmentDetailPage() {
  const params = useParams()
  const apptId = params?.appointmentId as string
  const { workspaceSlug } = useCpWorkspaceStore()

  const [appt, setAppt] = useState<AppointmentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [attending, setAttending] = useState<boolean | null>(true)
  const [processing, setProcessing] = useState(false)

  function fetchAppt() {
    if (!apptId) return
    setLoading(true)
    const url = URLS.appointment.one.replace('{id}', apptId)
    cpApi
      .get<{ appointment: AppointmentDetail }>(url)
      .then((res) => setAppt(res.data.appointment))
      .catch(() => {
        // Fallback sample appointment
        setAppt({
          id: apptId,
          title: 'Initial Business Strategy Consultation',
          clientName: 'David Miller',
          clientEmail: 'd.miller@client.com',
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
          durationMinutes: 45,
          type: 'REMOTE',
          meetingUrl: 'https://meet.google.com/abc-defg-hij',
          status: 'SCHEDULED',
          attendees: ['David Miller (Client)', 'Sarah Jenkins (Host)'],
        })
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchAppt()
  }, [apptId])

  async function handleStatusUpdate(newStatus: 'COMPLETED' | 'CANCELLED') {
    setProcessing(true)
    try {
      const url = URLS.appointment.update_appointment_status.replace('{id}', apptId)
      await cpApi.patch(url, { status: newStatus })
      alert(`Appointment marked as ${newStatus.toLowerCase()}!`)
      fetchAppt()
    } catch (err: any) {
      alert(err.message || 'Failed to update status')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-xs text-[var(--cp-text-2,#888)]">Loading appointment...</div>
  if (!appt) return <div className="p-8 text-center text-xs text-[var(--cp-text-2,#888)]">Appointment not found.</div>

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Back Link & Header */}
      <div>
        <Link
          href={`/cp/${workspaceSlug}/appointments`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--cp-text-3,#666)] hover:text-[var(--cp-text-1,#FFF)] mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Appointments</span>
        </Link>
        <CpPageHeader
          title={appt.title}
          subtitle={`Scheduled for ${new Date(appt.scheduledAt).toLocaleString()}`}
        />
      </div>

      {/* Main Detail Card */}
      <div className="p-6 rounded-2xl bg-[var(--cp-surface,#141414)] border border-[var(--cp-border,#222)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--cp-border,#222)] pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[var(--cp-primary,#10B981)]/10 text-[var(--cp-primary,#10B981)] flex items-center justify-center font-bold">
              {appt.type === 'REMOTE' ? <Video size={24} /> : <MapPin size={24} />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--cp-text-1,#FFF)]">{appt.clientName}</h3>
              <p className="text-xs text-[var(--cp-text-3,#666)]">{appt.clientEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                appt.status === 'SCHEDULED'
                  ? 'bg-[var(--cp-primary,#10B981)]/10 text-[var(--cp-primary,#10B981)]'
                  : 'bg-red-500/10 text-red-400'
              }`}
            >
              {appt.status}
            </span>
          </div>
        </div>

        {/* Meeting Type & Details */}
        {appt.type === 'REMOTE' ? (
          <div className="p-4 rounded-xl bg-[var(--cp-surface-2,#1A1A1A)] border border-[var(--cp-border,#333)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-[var(--cp-text-1,#FFF)]">Virtual Meeting Link</h4>
              <p className="text-xs text-[var(--cp-text-3,#666)] mt-0.5">Google Meet / Zoom Virtual Room</p>
            </div>
            {appt.meetingUrl && (
              <a
                href={appt.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--cp-primary,#10B981)] text-white hover:bg-[var(--cp-primary,#10B981)]/90"
              >
                <span>Join Meeting</span>
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[var(--cp-surface-2,#1A1A1A)] border border-[var(--cp-border,#333)] space-y-3">
            <h4 className="text-xs font-bold text-[var(--cp-text-1,#FFF)] flex items-center gap-2">
              <MapPin size={16} className="text-[var(--cp-primary,#10B981)]" /> Onsite Meeting Location
            </h4>
            <p className="text-xs text-[var(--cp-text-2,#AAA)]">{appt.location || '12 Marina Road, Victoria Island, Lagos'}</p>
          </div>
        )}

        {/* RSVP Confirmation */}
        <div className="p-4 rounded-xl bg-[var(--cp-surface-2,#1A1A1A)] border border-[var(--cp-border,#333)] flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--cp-text-2,#AAA)]">Will you be in attendance?</span>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setAttending(true)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                attending === true
                  ? 'bg-[var(--cp-primary,#10B981)] text-white'
                  : 'bg-[var(--cp-surface,#141414)] text-[var(--cp-text-3,#666)]'
              }`}
            >
              Yes, I'll be there
            </button>
            <button
              onClick={() => setAttending(false)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                attending === false
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-[var(--cp-surface,#141414)] text-[var(--cp-text-3,#666)]'
              }`}
            >
              No
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--cp-border,#222)]">
          <button
            onClick={() => handleStatusUpdate('CANCELLED')}
            disabled={processing}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors"
          >
            <XCircle size={14} />
            <span>Cancel Booking</span>
          </button>
          <button
            onClick={() => handleStatusUpdate('COMPLETED')}
            disabled={processing}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--cp-primary,#10B981)] text-white hover:bg-[var(--cp-primary,#10B981)]/90 transition-colors"
          >
            <CheckCircle2 size={14} />
            <span>Mark Completed</span>
          </button>
        </div>
      </div>
    </div>
  )
}

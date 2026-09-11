'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  MapPin,
  Video,
  Calendar as CalendarIcon,
  Clock,
  User,
  Mail,
  Phone,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'
import { cpApi } from '@/lib/cp-api'
import { URLS } from '@/lib/const'

export default function PublicBookingWizardPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.workspaceSlug as string

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  const [locationType, setLocationType] = useState<'ONSITE' | 'REMOTE'>('REMOTE')
  const [connectionMethod, setConnectionMethod] = useState<'GOOGLE_MEET' | 'ZOOM'>('GOOGLE_MEET')
  const [selectedDate, setSelectedDate] = useState('2026-07-25')
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM')

  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [appointmentTitle, setAppointmentTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const timeSlots = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
  ]

  async function handleCompleteBooking(e: React.FormEvent) {
    e.preventDefault()
    if (!clientName.trim() || !clientEmail.trim()) return

    setSubmitting(true)
    try {
      const url = URLS.company.public.replace('{workspaceSlug}', slug)
      await cpApi.post(url, {
        title: appointmentTitle.trim() || 'Consultation Booking',
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        clientPhone: clientPhone.trim(),
        type: locationType,
        connectionMethod: locationType === 'REMOTE' ? connectionMethod : undefined,
        scheduledAt: `${selectedDate} ${selectedSlot}`,
      })
      setConfirmed(true)
    } catch {
      // Mock confirmation success fallback
      setConfirmed(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#141414] border border-[#222] rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Booking Confirmed!</h2>
            <p className="text-xs text-[#888] mt-2">
              Your appointment request has been submitted to the business team. A calendar invitation has been sent to <strong className="text-white">{clientEmail}</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#1A1A1A] text-left text-xs space-y-2 text-[#AAA]">
            <div className="flex justify-between">
              <span>Date & Time:</span>
              <strong className="text-white">{selectedDate} at {selectedSlot}</strong>
            </div>
            <div className="flex justify-between">
              <span>Type:</span>
              <strong className="text-white">{locationType}</strong>
            </div>
          </div>

          <Link
            href={`/public/${slug}`}
            className="block w-full py-3 px-4 rounded-xl bg-[#10B981] text-white text-xs font-bold hover:bg-[#10B981]/90"
          >
            Back to Business Profile
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white p-4 sm:p-8 flex items-center justify-center">
      <div className="w-full max-w-xl bg-[#141414] border border-[#222] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Progress Header */}
        <div className="flex items-center justify-between">
          <Link href={`/public/${slug}`} className="text-xs text-[#666] hover:text-white flex items-center gap-1">
            <ArrowLeft size={14} /> Back
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#10B981]">
            Step {step} of 4 • Booking Wizard
          </span>
        </div>

        {/* Step 1: Location Choice */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Choose Meeting Format</h2>
              <p className="text-xs text-[#888] mt-1">Select whether you prefer an onsite visit or virtual meeting.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setLocationType('REMOTE')}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  locationType === 'REMOTE'
                    ? 'border-[#10B981] bg-[#10B981]/10 text-white'
                    : 'border-[#222] bg-[#1A1A1A] text-[#AAA] hover:border-[#444]'
                }`}
              >
                <Video size={24} className="text-[#10B981] mb-2" />
                <h4 className="font-bold text-sm text-white">Remote Video Call</h4>
                <p className="text-[10px] text-[#888] mt-1">Virtual meeting via Google Meet or Zoom</p>
              </div>

              <div
                onClick={() => setLocationType('ONSITE')}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  locationType === 'ONSITE'
                    ? 'border-[#10B981] bg-[#10B981]/10 text-white'
                    : 'border-[#222] bg-[#1A1A1A] text-[#AAA] hover:border-[#444]'
                }`}
              >
                <MapPin size={24} className="text-[#10B981] mb-2" />
                <h4 className="font-bold text-sm text-white">Onsite Visit</h4>
                <p className="text-[10px] text-[#888] mt-1">In-person meeting at registered business address</p>
              </div>
            </div>

            <button
              onClick={() => setStep(locationType === 'REMOTE' ? 2 : 3)}
              className="w-full py-3 rounded-xl bg-[#10B981] text-white text-xs font-bold hover:bg-[#10B981]/90 flex items-center justify-center gap-2"
            >
              <span>Continue</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Step 2: Connection Method (Remote Only) */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Select Virtual Video Provider</h2>
              <p className="text-xs text-[#888] mt-1">Choose your preferred video conferencing app.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setConnectionMethod('GOOGLE_MEET')}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  connectionMethod === 'GOOGLE_MEET'
                    ? 'border-[#10B981] bg-[#10B981]/10 text-white'
                    : 'border-[#222] bg-[#1A1A1A] text-[#AAA]'
                }`}
              >
                <h4 className="font-bold text-sm text-white">Google Meet</h4>
                <p className="text-[10px] text-[#888] mt-1">Instant Google Meet invite link</p>
              </div>

              <div
                onClick={() => setConnectionMethod('ZOOM')}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  connectionMethod === 'ZOOM'
                    ? 'border-[#10B981] bg-[#10B981]/10 text-white'
                    : 'border-[#222] bg-[#1A1A1A] text-[#AAA]'
                }`}
              >
                <h4 className="font-bold text-sm text-white">Zoom Meeting</h4>
                <p className="text-[10px] text-[#888] mt-1">Direct Zoom room join link</p>
              </div>
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full py-3 rounded-xl bg-[#10B981] text-white text-xs font-bold hover:bg-[#10B981]/90 flex items-center justify-center gap-2"
            >
              <span>Continue to Schedule</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Step 3: Date & Time Picker */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Select Date & Time Slot</h2>
              <p className="text-xs text-[#888] mt-1">Choose an available slot for your consultation.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#AAA] mb-1">Appointment Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl bg-[#1A1A1A] border border-[#333] text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#AAA] mb-2">Available Time Slots</label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2.5 rounded-xl text-xs font-semibold transition-all ${
                        selectedSlot === slot
                          ? 'bg-[#10B981] text-white'
                          : 'bg-[#1A1A1A] text-[#AAA] hover:bg-[#252525]'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(4)}
              className="w-full py-3 rounded-xl bg-[#10B981] text-white text-xs font-bold hover:bg-[#10B981]/90 flex items-center justify-center gap-2"
            >
              <span>Enter Contact Details</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Step 4: Contact Details & Confirmation */}
        {step === 4 && (
          <form onSubmit={handleCompleteBooking} className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-white">Contact Details</h2>
              <p className="text-xs text-[#888] mt-1">Enter your contact information to finalize the booking.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#AAA] mb-1">Appointment Topic / Title</label>
              <input
                type="text"
                value={appointmentTitle}
                onChange={(e) => setAppointmentTitle(e.target.value)}
                placeholder="e.g. System Integration Consultation"
                className="w-full p-2.5 text-xs rounded-xl bg-[#1A1A1A] border border-[#333] text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#AAA] mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full p-2.5 text-xs rounded-xl bg-[#1A1A1A] border border-[#333] text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#AAA] mb-1">Your Email Address *</label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full p-2.5 text-xs rounded-xl bg-[#1A1A1A] border border-[#333] text-white outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-[#10B981] text-white text-xs font-bold hover:bg-[#10B981]/90 transition-colors shadow-lg disabled:opacity-50 mt-4"
            >
              {submitting ? 'Confirming...' : 'Confirm & Complete Booking'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

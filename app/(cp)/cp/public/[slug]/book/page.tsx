'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { toast } from 'sonner'
import { cpApi } from '@/lib/cp-api'
import { Input } from '@/components/ui/input'

interface Service { id: string; name: string; duration: number; price: number; currency: string }
interface Slot    { time: string; available: boolean }

const STEPS = ['Service', 'Date & Time', 'Details', 'Confirm']

export default function BookingPage() {
  const params       = useParams()
  const router       = useRouter()
  const searchParams = useSearchParams()
  const slug         = params?.slug as string
  const preselect    = searchParams.get('service')

  const [step, setStep]       = useState(0)
  const [services, setServices] = useState<Service[]>([])
  const [service, setService]   = useState<Service | null>(null)
  const [date, setDate]         = useState<Date>(new Date())
  const [slots, setSlots]       = useState<Slot[]>([])
  const [slot, setSlot]         = useState<string | null>(null)
  const [form, setForm]         = useState({ name: '', email: '', phone: '', notes: '' })
  const [loading, setLoading]   = useState(false)
  const [booked, setBooked]     = useState(false)

  useEffect(() => {
    cpApi
      .get<{ services: Service[] }>(`/api/cp/public/${slug}/services`)
      .then((r) => {
        const svc = r.data.services ?? []
        setServices(svc)
        if (preselect) {
          const found = svc.find((s) => s.id === preselect)
          if (found) { setService(found); setStep(1) }
        }
      })
      .catch(() => {})
  }, [slug, preselect])

  useEffect(() => {
    if (!service) return
    const dateStr = format(date, 'yyyy-MM-dd')
    cpApi
      .get<{ slots: Slot[] }>(`/api/cp/public/${slug}/slots?serviceId=${service.id}&date=${dateStr}`)
      .then((r) => setSlots(r.data.slots ?? []))
      .catch(() => setSlots([]))
  }, [service, date, slug])

  async function submit() {
    if (!service || !slot) return
    setLoading(true)
    try {
      await cpApi.post(`/api/cp/public/${slug}/book`, {
        serviceId: service.id,
        scheduledAt: `${format(date, 'yyyy-MM-dd')}T${slot}`,
        ...form,
      })
      setBooked(true)
    } catch {
      toast.error('Booking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (booked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--cp-bg)' }}>
        <div className="text-center max-w-sm">
          <CheckCircle size={64} className="text-[var(--cp-primary)] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[var(--cp-text-1)]">Booking confirmed!</h2>
          <p className="text-sm text-[var(--cp-text-2)] mt-2">
            {service?.name} on {format(date, 'EEE d MMM')} at {slot}.<br />
            A confirmation will be sent to {form.email}.
          </p>
          <button
            onClick={() => router.push(`/cp/public/${slug}`)}
            className="mt-6 px-6 py-3 rounded-xl bg-[var(--cp-primary)] text-white font-semibold"
          >
            Back to Profile
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--cp-bg)' }}>
      {/* Progress */}
      <div className="sticky top-0 z-20 px-4 py-4" style={{ background: 'var(--cp-surface)', borderBottom: '1px solid var(--cp-border)' }}>
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => step > 0 && setStep(step - 1)} className="text-[var(--cp-text-2)]">
              <ChevronLeft size={20} />
            </button>
            <p className="text-sm font-semibold text-[var(--cp-text-1)]">{STEPS[step]}</p>
            <span className="text-xs text-[var(--cp-text-3)]">{step + 1}/{STEPS.length}</span>
          </div>
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div key={i} className="flex-1 h-1 rounded-full transition-all" style={{ background: i <= step ? 'var(--cp-primary)' : 'var(--cp-surface-2)' }} />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* Step 0: Service */}
        {step === 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-[var(--cp-text-1)]">Choose a service</h2>
            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => { setService(s); setStep(1) }}
                className={`w-full text-left p-4 rounded-xl transition-colors ${service?.id === s.id ? 'border-[var(--cp-primary)]' : ''}`}
                style={{ background: 'var(--cp-surface)', border: `1px solid ${service?.id === s.id ? 'var(--cp-primary)' : 'var(--cp-border)'}` }}
              >
                <p className="font-semibold text-[var(--cp-text-1)]">{s.name}</p>
                <p className="text-sm text-[var(--cp-text-2)] mt-0.5">{s.duration} min · {s.currency} {s.price.toLocaleString()}</p>
              </button>
            ))}
          </div>
        )}

        {/* Step 1: Date & Slot */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-[var(--cp-text-1)]">Pick a date & time</h2>
            {/* Date picker: next 14 days */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {Array.from({ length: 14 }, (_, i) => addDays(new Date(), i)).map((d) => {
                const sel = format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                return (
                  <button
                    key={d.toISOString()}
                    onClick={() => setDate(d)}
                    className="flex-shrink-0 flex flex-col items-center p-3 rounded-xl transition-colors"
                    style={{ background: sel ? 'var(--cp-primary)' : 'var(--cp-surface)', border: '1px solid var(--cp-border)', color: sel ? 'white' : 'var(--cp-text-2)' }}
                  >
                    <span className="text-[10px] font-semibold">{format(d, 'EEE')}</span>
                    <span className="text-base font-bold">{format(d, 'd')}</span>
                  </button>
                )
              })}
            </div>

            {/* Time slots */}
            <div className="grid grid-cols-3 gap-2">
              {slots.length === 0 ? (
                <p className="col-span-3 text-sm text-[var(--cp-text-3)] text-center py-4">No slots available</p>
              ) : slots.map((s) => (
                <button
                  key={s.time}
                  disabled={!s.available}
                  onClick={() => setSlot(s.time)}
                  className="py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-40"
                  style={{
                    background: slot === s.time ? 'var(--cp-primary)' : 'var(--cp-surface)',
                    color: slot === s.time ? 'white' : 'var(--cp-text-2)',
                    border: '1px solid var(--cp-border)',
                  }}
                >
                  {s.time}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!slot}
              className="w-full py-3 rounded-xl bg-[var(--cp-primary)] text-white font-semibold disabled:opacity-40"
            >
              Continue <ChevronRight size={16} className="inline" />
            </button>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[var(--cp-text-1)]">Your details</h2>
            <div><p className="text-xs text-[var(--cp-text-3)] mb-1">Full name *</p><Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>
            <div><p className="text-xs text-[var(--cp-text-3)] mb-1">Email *</p><Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} /></div>
            <div><p className="text-xs text-[var(--cp-text-3)] mb-1">Phone</p><Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} /></div>
            <div><p className="text-xs text-[var(--cp-text-3)] mb-1">Notes (optional)</p><textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} rows={3} className="w-full px-4 py-2.5 rounded-xl bg-[var(--cp-surface-2)] text-sm text-[var(--cp-text-1)] border border-[var(--cp-border)] outline-none resize-none" /></div>
            <button
              onClick={() => setStep(3)}
              disabled={!form.name || !form.email}
              className="w-full py-3 rounded-xl bg-[var(--cp-primary)] text-white font-semibold disabled:opacity-40"
            >
              Review Booking
            </button>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && service && slot && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-[var(--cp-text-1)]">Confirm booking</h2>
            <div className="p-5 rounded-2xl space-y-3" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)' }}>
              {[
                ['Service', service.name],
                ['Date', format(date, 'EEEE, d MMMM yyyy')],
                ['Time', slot],
                ['Duration', `${service.duration} min`],
                ['Price', `${service.currency} ${service.price.toLocaleString()}`],
                ['Name', form.name],
                ['Email', form.email],
                form.phone ? ['Phone', form.phone] : null,
              ].filter((x): x is string[] => x !== null).map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-[var(--cp-text-3)]">{k}</span>
                  <span className="text-[var(--cp-text-1)] font-medium">{v}</span>
                </div>
              ))}
            </div>
            <button
              onClick={submit}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[var(--cp-primary)] text-white font-bold disabled:opacity-50"
            >
              {loading ? 'Booking…' : 'Confirm Booking'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

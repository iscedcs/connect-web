'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Building, Clock, CalendarDays, FileText, Bell, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { csrfFetch } from '@/lib/csrf-client'
import { cpApi } from '@/lib/cp-api'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { CpPageHeader } from '@/components/cp/shared/CpPageHeader'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const NAV_ITEMS = [
  { id: 'profile',     label: 'Company Profile',      icon: Building },
  { id: 'hours',       label: 'Business Hours',        icon: Clock },
  { id: 'appointments',label: 'Appointment Defaults',  icon: CalendarDays },
  { id: 'invoices',    label: 'Invoice Defaults',      icon: FileText },
  { id: 'notifications',label: 'Notifications',        icon: Bell },
  { id: 'danger',      label: 'Danger Zone',           icon: Trash2 },
]

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5 space-y-4" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)' }}>
      <h3 className="font-semibold text-[var(--cp-text-1)]">{title}</h3>
      {children}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-[var(--cp-text-3)] mb-1">{children}</p>
}

function SaveBtn({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  return (
    <button onClick={onClick} disabled={saving} className="px-5 py-2.5 rounded-xl bg-[var(--cp-primary)] text-white text-sm font-semibold disabled:opacity-50">
      {saving ? 'Saving…' : 'Save changes'}
    </button>
  )
}

/* ---- Sections ---- */
function ProfileSection() {
  const { workspaceId } = useCpWorkspaceStore()
  const [form, setForm] = useState({ name: '', category: '', address: '', website: '', bio: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!workspaceId) return
    cpApi.get<{ workspace: typeof form }>(`/api/cp/workspaces/${workspaceId}`)
      .then((r) => setForm((p) => ({ ...p, ...r.data.workspace })))
      .catch(() => {})
  }, [workspaceId])

  async function save() {
    if (!workspaceId) return
    setSaving(true)
    try {
      await csrfFetch(`/api/cp/workspaces/${workspaceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      toast.success('Profile updated')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  return (
    <SectionCard title="Company Profile">
      <div className="space-y-3">
        <div><Label>Business name</Label><Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>
        <div><Label>Category / Industry</Label><Input value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} /></div>
        <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} /></div>
        <div><Label>Website</Label><Input value={form.website} onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))} /></div>
        <div><Label>Bio</Label><Textarea rows={3} value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} /></div>
        <SaveBtn onClick={save} saving={saving} />
      </div>
    </SectionCard>
  )
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

function HoursSection() {
  const { workspaceId } = useCpWorkspaceStore()
  const [hours, setHours] = useState<Record<string, { open: boolean; from: string; to: string }>>(
    Object.fromEntries(DAYS.map((d) => [d, { open: d !== 'sunday', from: '09:00', to: '17:00' }]))
  )
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!workspaceId) return
    setSaving(true)
    try {
      await csrfFetch(`/api/cp/workspaces/${workspaceId}/hours`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours }),
      })
      toast.success('Hours updated')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  return (
    <SectionCard title="Business Hours">
      <div className="space-y-2">
        {DAYS.map((day) => (
          <div key={day} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={hours[day].open}
              onChange={(e) => setHours((p) => ({ ...p, [day]: { ...p[day], open: e.target.checked } }))}
              className="accent-green-500"
            />
            <span className="w-24 text-sm text-[var(--cp-text-1)] capitalize">{day}</span>
            <input
              type="time"
              value={hours[day].from}
              disabled={!hours[day].open}
              onChange={(e) => setHours((p) => ({ ...p, [day]: { ...p[day], from: e.target.value } }))}
              className="px-2 py-1 rounded-lg text-sm bg-[var(--cp-surface-2)] text-[var(--cp-text-1)] border border-[var(--cp-border)] disabled:opacity-40"
            />
            <span className="text-[var(--cp-text-3)] text-sm">→</span>
            <input
              type="time"
              value={hours[day].to}
              disabled={!hours[day].open}
              onChange={(e) => setHours((p) => ({ ...p, [day]: { ...p[day], to: e.target.value } }))}
              className="px-2 py-1 rounded-lg text-sm bg-[var(--cp-surface-2)] text-[var(--cp-text-1)] border border-[var(--cp-border)] disabled:opacity-40"
            />
          </div>
        ))}
        <SaveBtn onClick={save} saving={saving} />
      </div>
    </SectionCard>
  )
}

function AppointmentDefaultsSection() {
  const { workspaceId } = useCpWorkspaceStore()
  const [form, setForm] = useState({ duration: 60, buffer: 15, confirmationMessage: '', reminderHours: 24 })
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!workspaceId) return
    setSaving(true)
    try {
      await csrfFetch(`/api/cp/workspaces/${workspaceId}/appointment-defaults`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      toast.success('Defaults updated')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  return (
    <SectionCard title="Appointment Defaults">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Duration (min)</Label><Input type="number" value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: +e.target.value }))} /></div>
        <div><Label>Buffer (min)</Label><Input type="number" value={form.buffer} onChange={(e) => setForm((p) => ({ ...p, buffer: +e.target.value }))} /></div>
        <div><Label>Reminder (hrs before)</Label><Input type="number" value={form.reminderHours} onChange={(e) => setForm((p) => ({ ...p, reminderHours: +e.target.value }))} /></div>
      </div>
      <div><Label>Confirmation message</Label><Textarea rows={2} value={form.confirmationMessage} onChange={(e) => setForm((p) => ({ ...p, confirmationMessage: e.target.value }))} /></div>
      <SaveBtn onClick={save} saving={saving} />
    </SectionCard>
  )
}

function InvoiceDefaultsSection() {
  const { workspaceId } = useCpWorkspaceStore()
  const [form, setForm] = useState({ payTo: '', currency: 'NGN', taxRate: 0, dueDays: 7, notes: '' })
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!workspaceId) return
    setSaving(true)
    try {
      await csrfFetch(`/api/cp/workspaces/${workspaceId}/invoice-defaults`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      toast.success('Invoice defaults updated')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  return (
    <SectionCard title="Invoice Defaults">
      <div className="space-y-3">
        <div><Label>Pay to (bank / account info)</Label><Input value={form.payTo} onChange={(e) => setForm((p) => ({ ...p, payTo: e.target.value }))} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Currency</Label><Input value={form.currency} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))} /></div>
          <div><Label>Default tax %</Label><Input type="number" value={form.taxRate} onChange={(e) => setForm((p) => ({ ...p, taxRate: +e.target.value }))} /></div>
          <div><Label>Due after (days)</Label><Input type="number" value={form.dueDays} onChange={(e) => setForm((p) => ({ ...p, dueDays: +e.target.value }))} /></div>
        </div>
        <div><Label>Default notes</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} /></div>
        <SaveBtn onClick={save} saving={saving} />
      </div>
    </SectionCard>
  )
}

function NotificationsSection() {
  const toggles = [
    { key: 'newLead',       label: 'New lead submitted' },
    { key: 'newBooking',    label: 'New booking / appointment' },
    { key: 'invoicePaid',   label: 'Invoice paid' },
    { key: 'staffCheckin',  label: 'Staff check-in / check-out' },
    { key: 'chatMessage',   label: 'New chat message' },
  ]
  const [prefs, setPrefs] = useState<Record<string, boolean>>(Object.fromEntries(toggles.map((t) => [t.key, true])))
  const [saving, setSaving] = useState(false)
  const { workspaceId } = useCpWorkspaceStore()

  async function save() {
    if (!workspaceId) return
    setSaving(true)
    try {
      await csrfFetch(`/api/cp/workspaces/${workspaceId}/notification-prefs`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      })
      toast.success('Notification preferences saved')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  return (
    <SectionCard title="Notification Preferences">
      <div className="space-y-3">
        {toggles.map((t) => (
          <label key={t.key} className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-[var(--cp-text-1)]">{t.label}</span>
            <input type="checkbox" checked={prefs[t.key]} onChange={(e) => setPrefs((p) => ({ ...p, [t.key]: e.target.checked }))} className="accent-green-500 w-4 h-4" />
          </label>
        ))}
        <SaveBtn onClick={save} saving={saving} />
      </div>
    </SectionCard>
  )
}

function DangerSection() {
  const { workspaceId, workspaceSlug } = useCpWorkspaceStore()
  const router = useRouter()
  const [confirm, setConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)

  async function deleteWorkspace() {
    if (!workspaceId) return
    setDeleting(true)
    try {
      await csrfFetch(`/api/cp/workspaces/${workspaceId}`, { method: 'DELETE' })
      router.push('/cp/org')
    } catch { toast.error('Failed to delete workspace') }
    finally { setDeleting(false) }
  }

  return (
    <SectionCard title="Danger Zone">
      <div className="p-4 rounded-xl" style={{ border: '1px solid var(--cp-accent)', background: 'rgba(236,72,153,0.05)' }}>
        <p className="text-sm font-semibold text-[var(--cp-accent)] mb-1">Delete workspace</p>
        <p className="text-xs text-[var(--cp-text-2)] mb-3">This will permanently delete all data including staff, invoices, appointments and clients. Type the workspace slug to confirm.</p>
        <Input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder={workspaceSlug ?? 'workspace-slug'}
          className="mb-3"
        />
        <button
          onClick={deleteWorkspace}
          disabled={confirm !== workspaceSlug || deleting}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
          style={{ background: 'var(--cp-accent)' }}
        >
          {deleting ? 'Deleting…' : 'Delete Workspace'}
        </button>
      </div>
    </SectionCard>
  )
}

const SECTION_COMPONENTS: Record<string, React.FC> = {
  profile:      ProfileSection,
  hours:        HoursSection,
  appointments: AppointmentDefaultsSection,
  invoices:     InvoiceDefaultsSection,
  notifications:NotificationsSection,
  danger:       DangerSection,
}

export default function SettingsPage() {
  const params = useParams()
  const slug   = params?.slug as string
  const [active, setActive] = useState('profile')

  const ActiveSection = SECTION_COMPONENTS[active]

  return (
    <div className="flex flex-col lg:flex-row h-full">
      <CpPageHeader title="Settings" />

      {/* Nav */}
      <nav
        className="lg:w-56 lg:flex-shrink-0 lg:flex lg:flex-col lg:border-r"
        style={{ borderColor: 'var(--cp-border)' }}
      >
        {/* Mobile: horizontal scroll */}
        <div className="flex gap-2 overflow-x-auto px-4 py-3 lg:hidden">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${active === item.id ? 'bg-[var(--cp-primary-dim)] text-[var(--cp-primary)]' : 'text-[var(--cp-text-2)] bg-[var(--cp-surface-2)]'}`}
            >
              <item.icon size={14} /> {item.label}
            </button>
          ))}
        </div>

        {/* Desktop: vertical nav */}
        <div className="hidden lg:flex flex-col pt-4 pb-6">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors text-left ${active === item.id ? 'text-[var(--cp-primary)]' : 'text-[var(--cp-text-2)] hover:text-[var(--cp-text-1)]'}`}
              style={active === item.id ? { borderLeft: '3px solid var(--cp-primary)', background: 'rgba(34,197,94,0.08)' } : { borderLeft: '3px solid transparent' }}
            >
              <item.icon size={16} /> {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-24 lg:pb-10 pt-4">
        <ActiveSection />
      </div>
    </div>
  )
}

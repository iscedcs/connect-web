'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { csrfFetch } from '@/lib/csrf-client'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const STEPS = ['Organization', 'Workspace', 'Company Profile', 'Invite Team', 'All done!']

type Form = {
  orgName: string
  workspaceName: string
  workspaceSlug: string
  category: string
  address: string
  website: string
  bio: string
  inviteEmails: string
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="space-y-2 mb-8">
      <div className="flex justify-between text-xs text-[var(--cp-text-3)]">
        <span>{STEPS[step]}</span>
        <span>{step + 1} / {STEPS.length}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--cp-surface-2)]">
        <div
          className="h-full rounded-full transition-all"
          style={{ background: 'var(--cp-primary)', width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep]   = useState(0)
  const [form, setForm]   = useState<Form>({
    orgName: '', workspaceName: '', workspaceSlug: '', category: '',
    address: '', website: '', bio: '', inviteEmails: '',
  })
  const [saving, setSaving]   = useState(false)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [workspaceSlugFinal, setWorkspaceSlugFinal] = useState<string>('')

  function set(field: keyof Form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }))
  }

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  async function handleNext() {
    if (step === 0) {
      // Create org + workspace
      setSaving(true)
      try {
        const res = await csrfFetch('/api/cp/onboarding/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orgName: form.orgName, workspaceName: form.workspaceName, workspaceSlug: form.workspaceSlug }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message)
        setWorkspaceId(data.workspaceId)
        setWorkspaceSlugFinal(data.slug)
        setStep(1)
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Setup failed')
      } finally { setSaving(false) }
    } else if (step === 2 && workspaceId) {
      // Save company profile
      setSaving(true)
      try {
        await csrfFetch(`/api/cp/workspaces/${workspaceId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: form.category, address: form.address, website: form.website, bio: form.bio }),
        })
        setStep(3)
      } catch { toast.error('Failed to save profile') }
      finally { setSaving(false) }
    } else if (step === 3 && workspaceId) {
      // Send invites
      if (form.inviteEmails.trim()) {
        setSaving(true)
        const emails = form.inviteEmails.split(/[\n,]/).map((e) => e.trim()).filter(Boolean)
        try {
          await csrfFetch(`/api/cp/workspaces/${workspaceId}/staff/invite-bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emails, role: 'STAFF' }),
          })
        } catch { toast.error('Some invites failed to send') }
        finally { setSaving(false) }
      }
      setStep(4)
    } else {
      setStep((p) => p + 1)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--cp-bg)' }}>
      <div className="w-full max-w-md">

        {/* Product identity */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-base font-bold tracking-tight text-[var(--cp-text-1)]">ISCE</span>
          <span
            className="px-2 py-0.5 rounded-md text-[11px] font-extrabold tracking-wider"
            style={{ background: 'var(--cp-primary)', color: '#000' }}
          >
            CONNECT PLUS
          </span>
        </div>

        {step < 4 && <ProgressBar step={step} />}

        {/* Step 0: Org + Workspace */}
        {step === 0 && (
          <div className="space-y-5">
            <h1 className="text-2xl font-bold text-[var(--cp-text-1)]">Set up your organization</h1>
            <p className="text-sm text-[var(--cp-text-2)]">Create your Connect Plus organization and first workspace. This takes less than 2 minutes.</p>
            <div className="space-y-3">
              <div><p className="text-xs text-[var(--cp-text-3)] mb-1">Organization name</p><Input value={form.orgName} onChange={set('orgName')} placeholder="Acme Inc." /></div>
              <div>
                <p className="text-xs text-[var(--cp-text-3)] mb-1">Workspace name</p>
                <Input
                  value={form.workspaceName}
                  onChange={(e) => setForm((p) => ({ ...p, workspaceName: e.target.value, workspaceSlug: autoSlug(e.target.value) }))}
                  placeholder="Main Office"
                />
              </div>
              <div>
                <p className="text-xs text-[var(--cp-text-3)] mb-1">Workspace URL slug</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--cp-text-3)]">/cp/</span>
                  <Input value={form.workspaceSlug} onChange={set('workspaceSlug')} placeholder="main-office" className="font-mono" />
                </div>
              </div>
            </div>
            <button onClick={handleNext} disabled={saving || !form.orgName || !form.workspaceName} className="w-full py-3 rounded-xl bg-[var(--cp-primary)] text-white font-bold disabled:opacity-50">
              {saving ? 'Creating…' : 'Continue'}
            </button>
          </div>
        )}

        {/* Step 1: Workspace details (just description) */}
        {step === 1 && (
          <div className="space-y-5">
            <h1 className="text-2xl font-bold text-[var(--cp-text-1)]">Workspace created! 🎉</h1>
            <p className="text-sm text-[var(--cp-text-2)]">Your workspace is live at <strong className="text-[var(--cp-primary)]">/cp/{workspaceSlugFinal}</strong>. Let's set up your company profile next.</p>
            <button onClick={() => setStep(2)} className="w-full py-3 rounded-xl bg-[var(--cp-primary)] text-white font-bold">
              Continue
            </button>
            <button onClick={() => setStep(4)} className="w-full py-2 text-sm text-[var(--cp-text-3)] hover:text-[var(--cp-text-2)]">
              Skip for now
            </button>
          </div>
        )}

        {/* Step 2: Company profile */}
        {step === 2 && (
          <div className="space-y-5">
            <h1 className="text-2xl font-bold text-[var(--cp-text-1)]">Company profile</h1>
            <p className="text-sm text-[var(--cp-text-2)]">This is shown on your public business profile.</p>
            <div className="space-y-3">
              <div><p className="text-xs text-[var(--cp-text-3)] mb-1">Industry / Category</p><Input value={form.category} onChange={set('category')} /></div>
              <div><p className="text-xs text-[var(--cp-text-3)] mb-1">Address</p><Input value={form.address} onChange={set('address')} /></div>
              <div><p className="text-xs text-[var(--cp-text-3)] mb-1">Website</p><Input value={form.website} onChange={set('website')} /></div>
              <div><p className="text-xs text-[var(--cp-text-3)] mb-1">Bio</p><Textarea rows={3} value={form.bio} onChange={set('bio')} /></div>
            </div>
            <button onClick={handleNext} disabled={saving} className="w-full py-3 rounded-xl bg-[var(--cp-primary)] text-white font-bold disabled:opacity-50">
              {saving ? 'Saving…' : 'Save & Continue'}
            </button>
            <button onClick={() => setStep(3)} className="w-full py-2 text-sm text-[var(--cp-text-3)]">Skip</button>
          </div>
        )}

        {/* Step 3: Invite team */}
        {step === 3 && (
          <div className="space-y-5">
            <h1 className="text-2xl font-bold text-[var(--cp-text-1)]">Invite your team</h1>
            <p className="text-sm text-[var(--cp-text-2)]">Add team members by email. Separate multiple emails with commas or new lines.</p>
            <Textarea
              rows={5}
              placeholder="alice@example.com&#10;bob@example.com"
              value={form.inviteEmails}
              onChange={set('inviteEmails')}
            />
            <button onClick={handleNext} disabled={saving} className="w-full py-3 rounded-xl bg-[var(--cp-primary)] text-white font-bold disabled:opacity-50">
              {saving ? 'Sending…' : 'Send Invites'}
            </button>
            <button onClick={() => setStep(4)} className="w-full py-2 text-sm text-[var(--cp-text-3)]">Skip</button>
          </div>
        )}

        {/* Step 4: Done */}
        {step === 4 && (
          <div className="text-center space-y-6">
            <CheckCircle size={72} className="text-[var(--cp-primary)] mx-auto" />
            <div>
              <h1 className="text-2xl font-bold text-[var(--cp-text-1)]">You're all set!</h1>
              <p className="text-sm text-[var(--cp-text-2)] mt-2">Your Connect Plus workspace is ready. Start managing your business.</p>
            </div>
            <button
              onClick={() => router.push(workspaceSlugFinal ? `/cp/${workspaceSlugFinal}/dashboard` : '/cp')}
              className="w-full py-3 rounded-xl bg-[var(--cp-primary)] text-white font-bold"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

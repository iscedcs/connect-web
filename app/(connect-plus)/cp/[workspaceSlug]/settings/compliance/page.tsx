'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AlertTriangle, Check, Loader2, ShieldCheck } from 'lucide-react'
import { cpApi } from '@/lib/cp-api'
import { URLS } from '@/lib/const'
import { CpPageHeader } from '@/components/cp/shared/CpPageHeader'
import {
  clearBannerDismissal,
  useCompliance,
} from '@/hooks/cp/useCompliance'
import {
  IDENTIFICATION_TYPES,
  type ComplianceRequirement,
} from '@/lib/types/cp-compliance'

/**
 * Compliance form — the banner's link target (ENG-424).
 *
 * The fields are generated from the same `incomplete-requirements` response
 * that drives the banner, so the two can never disagree about what is
 * outstanding, and a change to the backend's requirement list needs no
 * frontend change here.
 */
export default function CompliancePage() {
  const params = useParams()
  const router = useRouter()
  const slug = (params?.workspaceSlug || params?.slug) as string

  const { status, loading, unavailable, refresh } = useCompliance(true)
  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  // Seed empty values for whatever the API says is missing.
  useEffect(() => {
    if (!status?.missing) return
    setValues((prev) => {
      const next = { ...prev }
      for (const req of status.missing) {
        if (!(req.key in next)) next[req.key] = ''
      }
      return next
    })
  }, [status])

  const missing = status?.missing ?? []
  const allFilled =
    missing.length > 0 &&
    missing.every((req) => (values[req.key] ?? '').trim().length > 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!allFilled || saving) return

    setSaving(true)
    setError('')
    try {
      await cpApi.post(URLS.compliance.submit, values)
      // A fresh submission should also un-hide the banner if it is still
      // outstanding for another reason.
      clearBannerDismissal()
      setDone(true)
      refresh()
      setTimeout(() => router.push(`/cp/${slug}/dashboard`), 1200)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not save your compliance details. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 lg:p-8">
      <CpPageHeader
        title="Compliance details"
        subtitle="Required information we still need for your business account"
        backHref={`/cp/${slug}/dashboard`}
      />

      {loading && (
        <div className="flex items-center gap-2 rounded-xl border border-[#222] bg-[#141414] p-6 text-sm text-neutral-400">
          <Loader2 size={16} className="animate-spin" />
          <span>Checking what&apos;s outstanding…</span>
        </div>
      )}

      {/* ENG-416 has not shipped; say so plainly rather than implying the
          user is compliant. */}
      {!loading && unavailable && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-amber-300">
              Compliance checks aren&apos;t available yet
            </p>
            <p className="mt-1 text-xs leading-relaxed text-amber-200/70">
              We couldn&apos;t reach the compliance service. Nothing is wrong
              with your account — please check back shortly.
            </p>
          </div>
        </div>
      )}

      {!loading && !unavailable && status?.complete && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-400" />
          <div>
            <p className="text-sm font-semibold text-emerald-300">
              You&apos;re all set
            </p>
            <p className="mt-1 text-xs text-emerald-200/70">
              There are no outstanding compliance requirements on this account.
            </p>
          </div>
        </div>
      )}

      {!loading && !unavailable && !status?.complete && missing.length > 0 && (
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-[#222222] bg-[#141414] p-5 sm:p-6"
        >
          {missing.map((req) => (
            <ComplianceField
              key={req.key}
              requirement={req}
              value={values[req.key] ?? ''}
              onChange={(v) =>
                setValues((prev) => ({ ...prev, [req.key]: v }))
              }
              disabled={saving || done}
            />
          ))}

          {error && (
            <p className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}

          {done && (
            <p className="flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
              <Check size={14} />
              Saved. Taking you back to your dashboard…
            </p>
          )}

          <button
            type="submit"
            disabled={!allFilled || saving || done}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10B981] px-4 py-3 text-sm font-bold text-black transition-colors hover:bg-[#0EA271] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving && <Loader2 size={15} className="animate-spin" />}
            {saving ? 'Saving…' : 'Submit compliance details'}
          </button>
        </form>
      )}
    </div>
  )
}

function ComplianceField({
  requirement,
  value,
  onChange,
  disabled,
}: {
  requirement: ComplianceRequirement
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  const inputClass =
    'w-full rounded-xl border border-[#2B2B2B] bg-[#1F1F1F] px-3.5 py-2.5 text-xs text-white outline-none focus:border-neutral-500 disabled:opacity-50'

  return (
    <div>
      <label
        htmlFor={requirement.key}
        className="mb-1 block text-xs font-semibold text-neutral-300"
      >
        {requirement.label}
      </label>

      {requirement.key === 'identificationType' ? (
        <select
          id={requirement.key}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        >
          <option value="">Select an identification type</option>
          {IDENTIFICATION_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      ) : requirement.key === 'dob' ? (
        <input
          id={requirement.key}
          type="date"
          value={value}
          disabled={disabled}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      ) : (
        <input
          id={requirement.key}
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder={requirement.description}
          className={inputClass}
        />
      )}

      {requirement.description && requirement.key !== 'address' && (
        <p className="mt-1 text-[11px] text-neutral-500">
          {requirement.description}
        </p>
      )}
    </div>
  )
}

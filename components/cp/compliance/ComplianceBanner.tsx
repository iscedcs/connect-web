'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AlertTriangle, ArrowRight, X } from 'lucide-react'
import {
  dismissBannerForSession,
  isBannerDismissed,
  useCompliance,
} from '@/hooks/cp/useCompliance'

/**
 * Persistent "your compliance details are incomplete" banner (ENG-424).
 *
 * Rendered from `CpShell`, so it follows the user across every LYNCON Plus
 * screen rather than only the dashboard — compliance stays visible
 * until it is actually resolved.
 *
 * Dismissal is session-scoped on purpose: `sessionStorage`, never
 * `localStorage`. A permanent dismissal would let someone bury a mandatory
 * requirement forever, which defeats the gate.
 */
export function ComplianceBanner() {
  const params = useParams()
  const slug = (params?.workspaceSlug || params?.slug) as string | undefined

  const { status, loading, unavailable } = useCompliance(Boolean(slug))
  const [dismissed, setDismissed] = useState(true)

  // Read dismissal after mount so the server and first client render agree.
  useEffect(() => {
    setDismissed(isBannerDismissed())
  }, [])

  function handleDismiss() {
    dismissBannerForSession()
    setDismissed(true)
  }

  // Nothing to say while loading, when the backend module is not deployed,
  // when the user is compliant, or when they have dismissed it this session.
  if (loading || unavailable || dismissed) return null
  if (!status || status.complete || status.missing.length === 0) return null

  const items = status.missing

  return (
    <div
      role="status"
      className="mx-4 mt-4 lg:mx-8 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          size={18}
          className="mt-0.5 shrink-0 text-amber-400"
          aria-hidden
        />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-amber-300">
            Complete your compliance details
          </p>
          <p className="mt-1 text-xs leading-relaxed text-amber-200/70">
            Your account is active, but we still need{' '}
            {items.length === 1 ? 'one more detail' : `${items.length} more details`}{' '}
            to stay compliant.
          </p>

          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            {items.map((item) => (
              <li
                key={item.key}
                className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-200"
              >
                {item.label}
              </li>
            ))}
          </ul>

          <Link
            href={`/cp/${slug}/settings/compliance`}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-black transition-colors hover:bg-amber-400"
          >
            <span>Complete now</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss until next session"
          title="Hide until your next session"
          className="shrink-0 rounded-lg p-1.5 text-amber-400/60 transition-colors hover:bg-amber-500/10 hover:text-amber-300"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

export default ComplianceBanner

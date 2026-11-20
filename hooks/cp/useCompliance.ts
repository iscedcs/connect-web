'use client'

import { useCallback, useEffect, useState } from 'react'
import { cpApi } from '@/lib/cp-api'
import { URLS } from '@/lib/const'
import {
  normalizeRequirements,
  type ComplianceStatus,
} from '@/lib/types/cp-compliance'

/** Session-scoped dismissal — compliance must reappear next session (ENG-424). */
const DISMISS_KEY = 'cp_compliance_banner_dismissed'

export function isBannerDismissed(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return sessionStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

export function dismissBannerForSession(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(DISMISS_KEY, '1')
  } catch {
    // Private mode / blocked storage — the banner simply stays visible,
    // which is the safer failure for a compliance gate.
  }
}

export function clearBannerDismissal(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(DISMISS_KEY)
  } catch {
    // no-op
  }
}

interface UseComplianceResult {
  status: ComplianceStatus | null
  loading: boolean
  /** True only when the endpoint itself is unavailable (e.g. ENG-416 unshipped). */
  unavailable: boolean
  refresh: () => void
}

/**
 * Reads the outstanding compliance requirements for the current workspace.
 *
 * Until ENG-416 ships this 404s, which is reported as `unavailable` rather
 * than as "compliant". Callers must not treat an unreachable endpoint as a
 * pass — but they also must not block the dashboard on it, so the banner
 * simply does not render.
 */
export function useCompliance(enabled = true): UseComplianceResult {
  const [status, setStatus] = useState<ComplianceStatus | null>(null)
  const [loading, setLoading] = useState(enabled)
  const [unavailable, setUnavailable] = useState(false)
  const [nonce, setNonce] = useState(0)

  const refresh = useCallback(() => setNonce((n) => n + 1), [])

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)

    cpApi
      .get(URLS.compliance.incomplete_requirements)
      .then((res) => {
        if (!active) return
        setStatus(normalizeRequirements(res.data))
        setUnavailable(false)
      })
      .catch(() => {
        if (!active) return
        setStatus(null)
        setUnavailable(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [enabled, nonce])

  return { status, loading, unavailable, refresh }
}

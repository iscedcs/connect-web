'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { QrCode } from 'lucide-react'
import { cpApi } from '@/lib/cp-api'

interface CardProfile {
  businessName: string
  businessSlug: string
  staffName: string
  role: string
  avatar: string | null
  logo: string | null
}

export default function NfcTapPage() {
  const params  = useParams()
  const router  = useRouter()
  const code    = params?.cardCode as string
  const [profile, setProfile] = useState<CardProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!code) return
    cpApi
      .get<{ profile: CardProfile }>(`/api/cp/public/cards/${code}`)
      .then((r) => {
        const p = r.data.profile
        setProfile(p)
        // Auto-redirect after short display
        if (p?.businessSlug) {
          setTimeout(() => router.push(`/cp/public/${p.businessSlug}`), 2000)
        }
      })
      .catch(() => setLoading(false))
      .finally(() => setLoading(false))
  }, [code, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'var(--cp-bg)' }}>
      {loading ? (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full border-2 border-[var(--cp-primary)] border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-[var(--cp-text-2)]">Loading card…</p>
        </div>
      ) : !profile ? (
        <div className="text-center">
          <QrCode size={48} className="text-[var(--cp-text-3)] mx-auto mb-4" />
          <p className="text-[var(--cp-text-1)] font-semibold">Card not found</p>
          <p className="text-sm text-[var(--cp-text-2)] mt-1">This NFC card is not registered.</p>
        </div>
      ) : (
        <div className="text-center max-w-xs w-full space-y-4">
          {/* Business logo */}
          <div className="w-20 h-20 rounded-2xl mx-auto bg-[var(--cp-surface)] flex items-center justify-center overflow-hidden border border-[var(--cp-border)]">
            {profile.logo ? (
              <img src={profile.logo} alt={profile.businessName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-[var(--cp-primary)]">{profile.businessName[0]}</span>
            )}
          </div>

          {/* Staff */}
          <div>
            <p className="text-xl font-bold text-[var(--cp-text-1)]">{profile.staffName}</p>
            <p className="text-sm text-[var(--cp-text-2)]">{profile.role}</p>
            <p className="text-xs text-[var(--cp-text-3)] mt-0.5">{profile.businessName}</p>
          </div>

          {/* Redirect indicator */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-[var(--cp-primary)] border-t-transparent animate-spin" />
            <p className="text-xs text-[var(--cp-text-2)]">Redirecting to profile…</p>
          </div>

          <button
            onClick={() => router.push(`/cp/public/${profile.businessSlug}`)}
            className="w-full py-3 rounded-xl bg-[var(--cp-primary)] text-white font-semibold text-sm"
          >
            View Profile Now
          </button>
        </div>
      )}
    </div>
  )
}

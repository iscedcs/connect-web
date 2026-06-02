'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Share2, Phone, Globe, ChevronRight, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { cpApi } from '@/lib/cp-api'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { CpStatCard } from '@/components/cp/shared/CpStatCard'
import { CpSkeletonCard, CpSkeletonRow } from '@/components/cp/shared/CpSkeletonCard'
import type { CpAnalytics, CpWorkspace } from '@/lib/types/cp'

interface QuickLink {
  icon: string
  label: string
  href: string
}

const quickLinks: QuickLink[] = [
  { icon: '⚙️', label: 'Access settings',          href: 'settings' },
  { icon: '🔔', label: 'Notification settings',    href: 'settings/notifications' },
  { icon: '✏️', label: 'Edit about',               href: 'settings' },
  { icon: '💬', label: 'Connect support',          href: 'https://isce.com/support' },
  { icon: '🔒', label: 'Privacy policy',           href: '/privacy' },
  { icon: '📄', label: 'Terms of service',         href: '/terms' },
  { icon: '🚪', label: 'Sign out',                 href: '/auth/logout' },
]

export default function DashboardPage() {
  const params  = useParams()
  const slug    = params?.slug as string
  const { workspaceId, workspaceName, workspaceLogo } = useCpWorkspaceStore()

  const [analytics, setAnalytics] = useState<CpAnalytics | null>(null)
  const [workspace, setWorkspace] = useState<CpWorkspace | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!workspaceId) return
    Promise.all([
      cpApi.get<{ analytics: CpAnalytics }>(`/api/cp/workspaces/${workspaceId}/analytics`),
      cpApi.get<{ workspace: CpWorkspace }>(`/api/cp/workspaces/${workspaceId}`),
    ])
      .then(([analyticsRes, wsRes]) => {
        setAnalytics(analyticsRes.data.analytics)
        setWorkspace(wsRes.data.workspace)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [workspaceId])

  return (
    <div className="flex flex-col gap-0">
      {/* Hero section */}
      <div className="px-4 pt-6 pb-4 flex flex-col items-center text-center gap-3">
        {workspaceLogo ? (
          <img
            src={workspaceLogo}
            alt={workspaceName}
            className="w-[72px] h-[72px] rounded-full object-cover"
          />
        ) : (
          <div className="w-[72px] h-[72px] rounded-full bg-[var(--cp-primary)] flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {workspaceName?.[0] ?? 'W'}
            </span>
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-[var(--cp-text-1)]">
            {workspaceName ?? workspace?.name ?? '…'}
          </h1>
          {workspace?.category && (
            <p className="text-sm text-[var(--cp-text-2)]">{workspace.category}</p>
          )}
          {workspace?.address && (
            <p className="text-sm text-[var(--cp-text-2)] flex items-center justify-center gap-1">
              <span>📍</span> {workspace.address}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-1">
          {[
            { icon: <Share2 size={18} />, label: 'Share' },
            { icon: <Phone size={18} />,  label: 'Contact' },
            { icon: <Globe size={18} />,  label: 'Website' },
          ].map((btn) => (
            <button
              key={btn.label}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-[var(--cp-surface-2)] text-[var(--cp-text-2)] text-xs"
            >
              <span className="text-[var(--cp-text-1)]">{btn.icon}</span>
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="px-4 pb-4">
        <div className="flex gap-3 overflow-x-auto pb-1 lg:grid lg:grid-cols-4 lg:overflow-visible scrollbar-hide">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <CpSkeletonCard key={i} lines={2} className="min-w-[96px] lg:min-w-0 flex-shrink-0" />
            ))
          ) : (
            <>
              <CpStatCard
                value={analytics?.profileViews ? `${(analytics.profileViews / 1000).toFixed(1)}k` : '—'}
                label="Profile views"
                trend={analytics?.trends?.profileViews}
              />
              <CpStatCard
                value={analytics?.followers ? `${(analytics.followers / 1000).toFixed(1)}k` : '—'}
                label="Followers"
                trend={analytics?.trends?.followers}
              />
              <CpStatCard
                value={analytics?.tapCount ?? '—'}
                label="Tap count"
                trend={analytics?.trends?.tapCount}
              />
              <CpStatCard
                value={analytics?.activeStaff ?? '—'}
                label="Active staff"
                accentColor="white"
              />
            </>
          )}
        </div>
      </div>

      {/* Quick links list */}
      <div
        className="mx-4 rounded-xl overflow-hidden"
        style={{ background: 'var(--cp-surface)' }}
      >
        {quickLinks.map((link, i) => (
          <Link
            key={link.label}
            href={link.href.startsWith('http') || link.href.startsWith('/') ? link.href : `/cp/${slug}/${link.href}`}
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--cp-surface-2)] transition-colors"
            style={{
              borderBottom: i < quickLinks.length - 1 ? '1px solid var(--cp-border)' : undefined,
            }}
          >
            <span className="text-lg leading-none w-6 flex-shrink-0">{link.icon}</span>
            <span className="flex-1 text-sm text-[var(--cp-text-1)]">{link.label}</span>
            <ChevronRight size={16} className="text-[var(--cp-text-3)]" />
          </Link>
        ))}
      </div>

      {/* Add team member CTA */}
      <div className="px-4 py-6">
        <Link
          href={`/cp/${slug}/team`}
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[var(--cp-primary)] text-white font-semibold text-sm hover:bg-[var(--cp-primary)]/90 transition-colors"
        >
          <UserPlus size={18} />
          Add team member
        </Link>
      </div>
    </div>
  )
}

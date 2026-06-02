'use client'

import { useEffect, useState } from 'react'
import { Bell, Check } from 'lucide-react'
import { format } from 'date-fns'
import { csrfFetch } from '@/lib/csrf-client'
import { cpApi } from '@/lib/cp-api'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { CpEmptyState } from '@/components/cp/shared/CpEmptyState'
import { CpSkeletonRow } from '@/components/cp/shared/CpSkeletonCard'
import { CpPageHeader } from '@/components/cp/shared/CpPageHeader'
import type { CpNotification } from '@/lib/types/cp'

export default function NotificationsPage() {
  const { workspaceId } = useCpWorkspaceStore()
  const [notifications, setNotifications] = useState<CpNotification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!workspaceId) return
    cpApi
      .get<{ notifications: CpNotification[] }>(`/api/cp/workspaces/${workspaceId}/notifications`)
      .then((r) => setNotifications(r.data.notifications ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [workspaceId])

  async function markAllRead() {
    if (!workspaceId) return
    await csrfFetch(`/api/cp/workspaces/${workspaceId}/notifications/read-all`, { method: 'PATCH' }).catch(() => {})
    setNotifications((p) => p.map((n) => ({ ...n, read: true })))
  }

  async function markRead(id: string) {
    if (!workspaceId) return
    await csrfFetch(`/api/cp/workspaces/${workspaceId}/notifications/${id}/read`, { method: 'PATCH' }).catch(() => {})
    setNotifications((p) => p.map((n) => n.id === id ? { ...n, read: true } : n))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="flex flex-col">
      <CpPageHeader title="Notifications" />

      <div className="hidden lg:flex items-center justify-between px-6 py-4">
        <h1 className="text-xl font-bold text-[var(--cp-text-1)]">
          Notifications {unreadCount > 0 && <span className="text-sm font-normal text-[var(--cp-text-2)]">({unreadCount} unread)</span>}
        </h1>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1.5 text-sm text-[var(--cp-primary)] hover:underline">
            <Check size={14} /> Mark all read
          </button>
        )}
      </div>

      {/* Mobile mark all */}
      {unreadCount > 0 && (
        <div className="lg:hidden flex justify-end px-4 py-2">
          <button onClick={markAllRead} className="text-xs text-[var(--cp-primary)]">Mark all read</button>
        </div>
      )}

      {loading ? (
        <div className="px-4">{Array.from({ length: 5 }).map((_, i) => <CpSkeletonRow key={i} />)}</div>
      ) : notifications.length === 0 ? (
        <CpEmptyState icon={<Bell size={32} />} title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="divide-y pb-24 lg:pb-0" style={{ borderColor: 'var(--cp-border)' }}>
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.read && markRead(n.id)}
              className={`flex items-start gap-3 w-full px-4 py-4 text-left transition-colors hover:bg-[var(--cp-surface-2)] ${!n.read ? 'bg-[var(--cp-primary-dim)]/10' : ''}`}
            >
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-[var(--cp-primary)]' : 'bg-transparent'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--cp-text-1)] font-medium">{n.title}</p>
                {n.body && <p className="text-xs text-[var(--cp-text-2)] mt-0.5 leading-relaxed">{n.body}</p>}
                <p className="text-[10px] text-[var(--cp-text-3)] mt-1">{format(new Date(n.createdAt), 'd MMM, HH:mm')}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

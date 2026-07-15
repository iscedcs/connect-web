'use client'

import { useState, useEffect } from 'react'
import { Bell, Search } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { getCurrentUser } from '@/actions/auth'

const routeTitles: Record<string, string> = {
  dashboard:    'Dashboard',
  team:         'Team',
  invoices:     'Invoices',
  appointments: 'Appointments',
  chat:         'Chat',
  leads:        'Leads',
  clients:      'Clients',
  attendance:   'Attendance',
  cards:        'Connect Cards',
  settings:     'Settings',
}

export function CpTopbar() {
  const pathname = usePathname()
  const { workspaceName } = useCpWorkspaceStore()
  const [user, setUser] = useState<UserInfo | null>(null)

  useEffect(() => {
    getCurrentUser().then(setUser)
  }, [])

  const segments = pathname?.split('/').filter(Boolean) ?? []
  const last     = segments[segments.length - 1] ?? ''
  const title    = routeTitles[last] ?? workspaceName ?? 'Connect Plus'

  return (
    <header
      className="sticky top-0 z-30 hidden lg:flex items-center gap-4 px-8"
      style={{
        height: 'var(--cp-topbar-height)',
        background: 'transparent',
        borderBottom: '1px solid transparent',
      }}
    >
      <h1 className="text-lg font-bold text-[var(--cp-text-1)] flex-shrink-0">
        {title}
      </h1>

      {/* Search */}
      <div className="flex-1 max-w-[360px] relative ml-4">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--cp-text-3)]"
        />
        <input
          type="text"
          placeholder="Search…"
          className="w-full rounded-lg pl-9 pr-4 py-2 text-sm bg-[var(--cp-surface-2)] text-[var(--cp-text-1)] placeholder:text-[var(--cp-text-3)] border border-[var(--cp-border)] outline-none focus:border-[var(--cp-primary)] transition-colors"
        />
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Notification bell */}
        <button
          className="relative p-2 rounded-lg hover:bg-[var(--cp-surface-2)] transition-colors"
          aria-label="Notifications"
        >
          <Bell size={20} className="text-[var(--cp-text-2)]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--cp-accent)]" />
        </button>

        {/* User avatar */}
        <div className="w-9 h-9 rounded-full overflow-hidden bg-[var(--cp-primary)] flex items-center justify-center cursor-pointer flex-shrink-0">
          {user?.displayPicture ? (
            <img
              src={user.displayPicture}
              alt={user.firstName ?? 'User'}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-bold text-white">
              {user?.firstName?.[0]?.toUpperCase() ??
                user?.email?.[0]?.toUpperCase() ??
                'U'}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}

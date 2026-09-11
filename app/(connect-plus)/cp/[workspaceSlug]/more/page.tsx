'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  Briefcase,
  Clock,
  CreditCard,
  MessageSquare,
  Receipt,
  Settings,
  Building,
  ArrowLeft,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { getCurrentUser } from '@/actions/auth'
import { CpPageHeader } from '@/components/cp/shared/CpPageHeader'

export default function MobileMorePage() {
  const { workspaceSlug, workspaceName } = useCpWorkspaceStore()
  const [user, setUser] = useState<UserInfo | null>(null)

  useEffect(() => {
    getCurrentUser().then(setUser)
  }, [])

  const displayName =
    user ?
      `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
      user.email ||
      'User'
    : 'User'

  const userInitial =
    user?.firstName?.[0]?.toUpperCase() ??
    user?.email?.[0]?.toUpperCase() ??
    'U'

  const navGroups = [
    {
      title: 'Workspace Navigation',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', href: `/cp/${workspaceSlug}/dashboard` },
        { icon: Users, label: 'Leads', href: `/cp/${workspaceSlug}/leads` },
        { icon: UserCheck, label: 'Clients', href: `/cp/${workspaceSlug}/clients` },
        { icon: Calendar, label: 'Appointments', href: `/cp/${workspaceSlug}/appointments` },
        { icon: Briefcase, label: 'Team / Staff', href: `/cp/${workspaceSlug}/team` },
        { icon: Clock, label: 'Attendance', href: `/cp/${workspaceSlug}/attendance` },
        { icon: CreditCard, label: 'Connect Cards', href: `/cp/${workspaceSlug}/cards` },
        { icon: MessageSquare, label: 'Chat', href: `/cp/${workspaceSlug}/chat` },
        { icon: Receipt, label: 'Invoices', href: `/cp/${workspaceSlug}/invoices` },
      ],
    },
    {
      title: 'System & Account',
      items: [
        { icon: Settings, label: 'Workspace Settings', href: `/cp/${workspaceSlug}/settings` },
        { icon: Building, label: 'Organization Dashboard', href: '/cp/org' },
        { icon: ArrowLeft, label: 'Back to Connect Main', href: '/dashboard' },
      ],
    },
  ]

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto pb-24">
      <CpPageHeader
        title="Account & Navigation"
        subtitle={`Overview for ${workspaceName || 'Connect Plus'}`}
      />

      {/* User Session Info Card */}
      <div className="p-4 rounded-2xl bg-[var(--cp-surface,#141414)] border border-[var(--cp-border,#222)] flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[var(--cp-primary,#10B981)] flex items-center justify-center text-white text-base font-bold shrink-0 overflow-hidden">
          {user?.displayPicture ? (
            <img src={user.displayPicture} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            userInitial
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-[var(--cp-text-1,#FFF)] truncate">
            {displayName}
          </h3>
          {user?.email && (
            <p className="text-xs text-[var(--cp-text-3,#888)] truncate mt-0.5">
              {user.email}
            </p>
          )}
          {user?.userType && (
            <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--cp-primary,#10B981)]/10 text-[var(--cp-primary,#10B981)]">
              {user.userType}
            </span>
          )}
        </div>
      </div>

      {/* Navigation Sections */}
      {navGroups.map((group) => (
        <div key={group.title} className="space-y-2">
          <p className="px-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--cp-text-3,#666)]">
            {group.title}
          </p>
          <div className="rounded-2xl bg-[var(--cp-surface,#141414)] border border-[var(--cp-border,#222)] divide-y divide-[var(--cp-border,#222)] overflow-hidden">
            {group.items.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between p-3.5 hover:bg-[var(--cp-surface-2,#1F1F1F)] transition-colors group"
                >
                  <div className="flex items-center gap-3 text-sm text-[var(--cp-text-1,#FFF)]">
                    <Icon size={18} className="text-[var(--cp-text-3,#888)] group-hover:text-[var(--cp-primary,#10B981)] transition-colors" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight size={16} className="text-[var(--cp-text-3,#555)]" />
                </Link>
              )
            })}
          </div>
        </div>
      ))}

      {/* Logout Action */}
      <div className="pt-2">
        <Link
          href="/auth/logout"
          className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-semibold text-sm hover:bg-red-500/20 transition-colors"
        >
          <LogOut size={18} />
          <span>Log Out of Connect Plus</span>
        </Link>
      </div>
    </div>
  )
}

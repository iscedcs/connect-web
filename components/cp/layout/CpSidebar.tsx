'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Receipt,
  Calendar,
  UserCheck,
  CreditCard,
  ChevronRight,
  ChevronDown,
  Sparkles,
} from 'lucide-react'
import {
  AccountSettingsIcon,
  NotificationIcon,
  InviteIcon,
  ContactIcon,
  TermsIcon,
  PrivacyIcon,
  SignOutIcon,
} from '@/lib/icons'
import { cn } from '@/lib/utils'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { getCurrentUser } from '@/actions/auth'

export function CpSidebar() {
  const params   = useParams()
  const pathname = usePathname()
  const slug     = (params?.workspaceSlug || params?.slug) as string
  const { workspaceName, workspaceLogo } = useCpWorkspaceStore()
  const [user, setUser] = useState<any | null>(null)

  useEffect(() => {
    getCurrentUser().then(setUser)
  }, [])

  // Core Workspace Navigation
  const workspaceItems = [
    { icon: LayoutDashboard, label: 'Overview',              href: `/cp/${slug}/dashboard` },
    { icon: Users,           label: 'Team Directory',        href: `/cp/${slug}/team` },
    { icon: Receipt,         label: 'Invoices & Billing',    href: `/cp/${slug}/invoices` },
    { icon: Calendar,        label: 'Appointments',          href: `/cp/${slug}/appointments` },
    { icon: UserCheck,       label: 'Leads & CRM',           href: `/cp/${slug}/leads` },
    { icon: CreditCard,      label: 'Connect Cards',         href: `/cp/${slug}/cards` },
  ]

  // Account & Support Settings Navigation
  const accountItems = [
    { CustomIcon: AccountSettingsIcon, label: 'Edit profile',           href: `/cp/${slug}/settings/company` },
    { CustomIcon: AccountSettingsIcon, label: 'Account settings',       href: `/cp/${slug}/settings` },
    { CustomIcon: NotificationIcon,    label: 'Notification settings',  href: `/cp/${slug}/settings` },
    { CustomIcon: InviteIcon,          label: 'Invite a friend',        href: `/cp/${slug}/invites` },
    { CustomIcon: ContactIcon,         label: 'Contact support',        href: `/cp/${slug}/chat` },
    { CustomIcon: TermsIcon,           label: 'Terms of service',       href: '/terms' },
    { CustomIcon: PrivacyIcon,         label: 'Privacy policy',         href: '/privacy' },
  ]

  function isActive(href: string) {
    if (!pathname) return false
    if (href === `/cp/${slug}/dashboard`) {
      return pathname === href || pathname.endsWith('/dashboard')
    }
    return pathname.startsWith(href)
  }

  return (
    <aside
      className="hidden lg:flex flex-col fixed left-0 top-0 h-full z-40 w-[250px] overflow-y-auto bg-[#141414] text-white select-none"
      style={{
        borderRight: '1px solid var(--cp-border, #222222)',
      }}
    >
      {/* Brand Header: IISCE ECOSYSTEM */}
      <div
        className="flex items-center justify-between px-6 shrink-0"
        style={{ height: 64, borderBottom: '1px solid var(--cp-border, #222222)' }}
      >
        <div className="flex items-center gap-1.5 text-white font-extrabold">
          <span className="text-lg tracking-tighter select-none font-mono text-[#10B981]">||</span>
          <span className="text-xs font-black tracking-wider uppercase">IISCE ECOSYSTEM</span>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30">
          PLUS
        </span>
      </div>

      {/* Main Sidebar Navigation Menu */}
      <div className="flex-1 px-4 py-5 space-y-6 overflow-y-auto">
        {/* Workspace Main Navigation */}
        <div>
          <p className="px-2 pb-2.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Workspace
          </p>
          <nav className="space-y-1">
            {workspaceItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all group',
                    active
                      ? 'bg-[#1F1F1F] text-white border border-[#2A2A2A] shadow-sm'
                      : 'text-neutral-300 hover:bg-[#1A1A1A] hover:text-white',
                  )}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon size={16} className={cn('shrink-0 transition-colors', active ? 'text-[#10B981]' : 'text-neutral-400 group-hover:text-white')} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  <ChevronRight size={14} className={cn('shrink-0 transition-colors', active ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-300')} />
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Account Settings Menu */}
        <div>
          <p className="px-2 pb-2.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Account Settings
          </p>
          <nav className="space-y-1">
            {accountItems.map((item) => {
              const { CustomIcon } = item
              const active = isActive(item.href)
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all group',
                    active
                      ? 'bg-[#1F1F1F] text-white border border-[#2A2A2A] shadow-sm'
                      : 'text-neutral-300 hover:bg-[#1A1A1A] hover:text-white',
                  )}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-4 h-4 shrink-0 flex items-center justify-center text-neutral-400 group-hover:text-white">
                      <CustomIcon className="w-4 h-4" />
                    </div>
                    <span className="truncate">{item.label}</span>
                  </div>
                  <ChevronRight size={14} className={cn('shrink-0 transition-colors', active ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-300')} />
                </Link>
              )
            })}

            {/* Red Sign out from this device */}
            <Link
              href="/auth/logout"
              className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors group pt-3"
            >
              <div className="flex items-center gap-3 truncate">
                <div className="w-4 h-4 shrink-0 flex items-center justify-center text-red-400">
                  <SignOutIcon className="w-4 h-4" />
                </div>
                <span className="truncate font-semibold">Sign out from this device</span>
              </div>
              <ChevronRight size={14} className="text-red-400/70 shrink-0" />
            </Link>
          </nav>
        </div>
      </div>

      {/* Bottom Pinned Workspace Switcher */}
      <div
        className="p-3 border-t border-[var(--cp-border,#222222)] bg-[#111111] shrink-0"
      >
        <Link
          href="/cp/org"
          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-neutral-800 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-[#10B981] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
            {workspaceName?.[0]?.toUpperCase() ?? 'W'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate leading-tight">
              {workspaceName ?? 'Workspace'}
            </p>
            <p className="text-[10px] text-neutral-400 truncate leading-tight mt-0.5">
              Switch Organization
            </p>
          </div>
          <ChevronDown size={14} className="text-neutral-400 shrink-0" />
        </Link>
      </div>
    </aside>
  )
}




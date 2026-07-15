'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
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
  MoreHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'

const primaryTabs = [
  { icon: LayoutDashboard, label: 'Summary', href: 'dashboard' },
  { icon: Briefcase,       label: 'Team',    href: 'team' },
  { icon: Receipt,         label: 'Invoices',href: 'invoices' },
  { icon: Calendar,        label: 'Appts',   href: 'appointments' },
  { icon: MoreHorizontal,  label: 'More',    href: 'more' },
]

export function CpBottomNav() {
  const params  = useParams()
  const pathname = usePathname()
  const slug    = params?.slug as string

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex lg:hidden"
      style={{
        background: 'var(--cp-surface)',
        borderTop: '1px solid var(--cp-border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        height: 'calc(64px + env(safe-area-inset-bottom))',
      }}
    >
      {primaryTabs.map((tab) => {
        const href    = `/cp/${slug}/${tab.href}`
        const active  = pathname?.startsWith(href)
        const Icon    = tab.icon

        return (
          <Link
            key={tab.href}
            href={href}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 min-w-0"
          >
            <Icon
              size={22}
              className={cn(
                'transition-colors',
                active
                  ? 'text-[var(--cp-primary)]'
                  : 'text-[var(--cp-text-3)]',
              )}
            />
            {active && (
              <span className="text-[10px] font-medium text-[var(--cp-primary)] leading-none">
                {tab.label}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

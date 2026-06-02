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
  Settings,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'

interface NavItem {
  icon: React.ElementType
  label: string
  href: string
  badgeKey?: string
}

const workspaceNav: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard',   href: 'dashboard' },
  { icon: Users,           label: 'Leads',        href: 'leads' },
  { icon: UserCheck,       label: 'Clients',      href: 'clients' },
  { icon: Calendar,        label: 'Appointments', href: 'appointments' },
]

const teamNav: NavItem[] = [
  { icon: Briefcase,  label: 'Staff',         href: 'team' },
  { icon: Clock,      label: 'Attendance',    href: 'attendance' },
  { icon: CreditCard, label: 'Connect Cards', href: 'cards' },
]

const operationsNav: NavItem[] = [
  { icon: MessageSquare, label: 'Chat',     href: 'chat' },
  { icon: Receipt,       label: 'Invoices', href: 'invoices' },
]

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--cp-text-3)]">
      {label}
    </p>
  )
}

function NavLink({
  item,
  slug,
  active,
}: {
  item: NavItem
  slug: string
  active: boolean
}) {
  const Icon = item.icon
  return (
    <Link
      href={`/cp/${slug}/${item.href}`}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
        active
          ? 'border-l-[3px] border-[var(--cp-primary)] bg-[var(--cp-primary)]/10 text-[var(--cp-primary)]'
          : 'text-[var(--cp-text-2)] hover:bg-[var(--cp-surface-2)] hover:text-[var(--cp-text-1)] border-l-[3px] border-transparent',
      )}
    >
      <Icon size={20} className="flex-shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  )
}

export function CpSidebar() {
  const params   = useParams()
  const pathname = usePathname()
  const slug     = params?.slug as string
  const { workspaceName, workspaceLogo } = useCpWorkspaceStore()

  function isActive(href: string) {
    return pathname?.includes(`/${href}`)
  }

  return (
    <aside
      className="hidden lg:flex flex-col fixed left-0 top-0 h-full z-40 w-[240px] overflow-y-auto"
      style={{
        background: 'var(--cp-surface)',
        borderRight: '1px solid var(--cp-border)',
      }}
    >
      {/* Workspace switcher */}
      <div
        className="flex items-center gap-2 px-3 cursor-pointer hover:bg-[var(--cp-surface-2)] transition-colors"
        style={{ height: 64, borderBottom: '1px solid var(--cp-border)' }}
      >
        {workspaceLogo ? (
          <img
            src={workspaceLogo}
            alt={workspaceName}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[var(--cp-primary)] flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">
              {workspaceName?.[0] ?? 'W'}
            </span>
          </div>
        )}
        <span className="text-sm font-semibold text-[var(--cp-text-1)] truncate flex-1">
          {workspaceName ?? 'Workspace'}
        </span>
        <ChevronDown size={16} className="text-[var(--cp-text-3)] flex-shrink-0" />
      </div>

      {/* Nav sections */}
      <nav className="flex-1 px-2 py-4 space-y-4">
        <div>
          <SectionLabel label="Workspace" />
          {workspaceNav.map((item) => (
            <NavLink key={item.href} item={item} slug={slug} active={isActive(item.href)} />
          ))}
        </div>
        <div>
          <SectionLabel label="Team" />
          {teamNav.map((item) => (
            <NavLink key={item.href} item={item} slug={slug} active={isActive(item.href)} />
          ))}
        </div>
        <div>
          <SectionLabel label="Operations" />
          {operationsNav.map((item) => (
            <NavLink key={item.href} item={item} slug={slug} active={isActive(item.href)} />
          ))}
        </div>
      </nav>

      {/* Bottom pinned */}
      <div
        className="px-2 py-4 space-y-1"
        style={{ borderTop: '1px solid var(--cp-border)' }}
      >
        <NavLink
          item={{ icon: Settings, label: 'Settings', href: 'settings' }}
          slug={slug}
          active={isActive('settings')}
        />
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--cp-text-3)] hover:text-[var(--cp-text-2)] transition-colors"
        >
          <ArrowLeft size={20} className="flex-shrink-0" />
          <span>Back to Connect</span>
        </Link>
      </div>
    </aside>
  )
}

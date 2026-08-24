'use client'

import { useState, useEffect } from 'react'
import { Bell, Search, LogOut, Settings, Building, ArrowLeft, Image as ImageIcon, Mail } from 'lucide-react'
import { usePathname, useParams } from 'next/navigation'
import Link from 'next/link'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { getCurrentUser } from '@/actions/auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
  const params   = useParams()
  const slug     = (params?.workspaceSlug || params?.slug) as string
  const { workspaceName } = useCpWorkspaceStore()
  const [user, setUser] = useState<UserInfo | null>(null)

  useEffect(() => {
    getCurrentUser().then(setUser)
  }, [])

  const segments = pathname?.split('/').filter(Boolean) ?? []
  const last     = segments[segments.length - 1] ?? ''
  const title    = routeTitles[last] ?? workspaceName ?? 'Connect Plus'

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

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 lg:px-8 bg-[var(--cp-bg,#0D0D0D)] lg:bg-transparent"
      style={{
        height: 'var(--cp-topbar-height)',
        borderBottom: '1px solid var(--cp-border,#222222)',
      }}
    >
      <div className="flex items-center gap-3">
        <h1 className="text-base lg:text-lg font-bold text-[var(--cp-text-1)] flex-shrink-0">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Media / Gallery Icon */}
        <button
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          aria-label="Media"
        >
          <ImageIcon size={18} />
        </button>

        {/* Notification bell */}
        <button
          className="relative p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#10B981]" />
        </button>

        {/* Mail / Message Icon */}
        <button
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          aria-label="Messages"
        >
          <Mail size={18} />
        </button>

        {/* User profile dropdown menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="w-9 h-9 rounded-full overflow-hidden bg-[var(--cp-primary)] flex items-center justify-center cursor-pointer flex-shrink-0 ring-2 ring-transparent hover:ring-[var(--cp-primary)]/50 transition-all focus:outline-none"
              aria-label="User menu"
            >
              {user?.displayPicture ? (
                <img
                  src={user.displayPicture}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-white">
                  {userInitial}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-60 bg-[var(--cp-surface,#141414)] border-[var(--cp-border,#222)] text-[var(--cp-text-1,#FFF)]"
          >
            <DropdownMenuLabel className="font-normal px-3 py-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold truncate leading-none">
                  {displayName}
                </p>
                {user?.email && (
                  <p className="text-xs text-[var(--cp-text-3,#888)] truncate leading-none">
                    {user.email}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[var(--cp-border,#222)]" />
            {slug && (
              <DropdownMenuItem asChild>
                <Link
                  href={`/cp/${slug}/settings`}
                  className="flex items-center gap-2 cursor-pointer hover:bg-[var(--cp-surface-2)] text-xs py-2"
                >
                  <Settings size={14} className="text-[var(--cp-text-3)]" />
                  <span>Workspace Settings</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link
                href="/cp/org"
                className="flex items-center gap-2 cursor-pointer hover:bg-[var(--cp-surface-2)] text-xs py-2"
              >
                <Building size={14} className="text-[var(--cp-text-3)]" />
                <span>Organization Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 cursor-pointer hover:bg-[var(--cp-surface-2)] text-xs py-2"
              >
                <ArrowLeft size={14} className="text-[var(--cp-text-3)]" />
                <span>Back to Connect</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[var(--cp-border,#222)]" />
            <DropdownMenuItem asChild variant="destructive">
              <Link
                href="/auth/logout"
                className="flex items-center gap-2 cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs py-2 font-medium"
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}


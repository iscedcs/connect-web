'use client'

import React from 'react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'

interface WorkspaceHeroHeaderProps {
  coverImage?: string
  logoImage?: string
  name?: string
  location?: string
  category?: string
  activeTab?: 'overview' | 'team' | 'invoices' | 'appointments'
  onSendMoney?: () => void
  onClientsClick?: () => void
}

export function WorkspaceHeroHeader({
  coverImage = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1600&auto=format&fit=crop',
  logoImage,
  name,
  location = 'California, United States',
  category = 'Coffee shop',
  activeTab,
  onSendMoney,
  onClientsClick,
}: WorkspaceHeroHeaderProps) {
  const params = useParams()
  const pathname = usePathname()
  const slug = (params?.workspaceSlug || params?.slug) as string
  const { workspaceName, workspaceLogo } = useCpWorkspaceStore()

  const tabs = [
    { label: 'Overview', href: `/cp/${slug}/dashboard`, key: 'overview' },
    { label: 'Team', href: `/cp/${slug}/team`, key: 'team' },
    { label: 'Invoices', href: `/cp/${slug}/invoices`, key: 'invoices' },
    { label: 'Appointments', href: `/cp/${slug}/appointments`, key: 'appointments' },
  ]

  function currentIsActive(tabKey: string, href: string) {
    if (activeTab) return activeTab === tabKey
    if (tabKey === 'overview') return pathname?.endsWith('/dashboard') || pathname === `/cp/${slug}`
    return pathname?.includes(`/${tabKey}`)
  }

  return (
    <div className="space-y-4">
      {/* Cover Banner & Overlaid Store Logo Avatar */}
      <div className="relative">
        <div className="h-44 sm:h-60 w-full rounded-2xl sm:rounded-3xl overflow-hidden relative border border-[var(--cp-border,#222)] bg-neutral-900">
          <img
            src={coverImage}
            alt={workspaceName || 'Store Banner'}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>

        {/* Floating Store Logo Avatar */}
        <div className="absolute -bottom-7 sm:-bottom-8 left-6 sm:left-8 w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-[var(--cp-bg,#0D0D0D)] bg-[#141414] overflow-hidden flex items-center justify-center shadow-xl z-10">
          {(logoImage || workspaceLogo) ? (
            <img
              src={logoImage || workspaceLogo}
              alt={name || workspaceName || 'Logo'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center font-black text-2xl sm:text-3xl">
              {(name || workspaceName)?.[0]?.toUpperCase() ?? 'S'}
            </div>
          )}
        </div>
      </div>

      {/* Hero Meta Info & Action Buttons */}
      <div className="pt-8 sm:pt-9 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {name || workspaceName || 'Workspace'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 font-medium mt-1">
            {location} &bull; {category}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onSendMoney || (() => alert('Send money modal opening...'))}
            className="px-5 py-2.5 rounded-full bg-white text-black font-bold text-xs sm:text-sm hover:bg-neutral-200 transition-colors shadow-sm cursor-pointer"
          >
            Send money
          </button>
          <Link
            href={`/cp/${slug}/clients`}
            className="px-5 py-2.5 rounded-full bg-white/10 text-white font-semibold text-xs sm:text-sm border border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
          >
            Clients
          </Link>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="mt-6 border-b border-[var(--cp-border,#222)] flex items-center gap-8 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const active = currentIsActive(tab.key, tab.href)
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`pb-3 text-sm font-semibold transition-all whitespace-nowrap ${
                active
                  ? 'text-white border-b-2 border-white'
                  : 'text-neutral-400 hover:text-neutral-200 border-b-2 border-transparent'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

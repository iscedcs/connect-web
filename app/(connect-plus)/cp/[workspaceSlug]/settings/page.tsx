'use client'

import Link from 'next/link'
import {
  Building,
  Shield,
  Bell,
  ArrowRight,
  LogOut,
  Receipt,
  Calendar,
  CreditCard,
  Globe,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
} from 'lucide-react'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { CpPageHeader } from '@/components/cp/shared/CpPageHeader'

export default function WorkspaceSettingsPage() {
  const { workspaceSlug, workspaceName } = useCpWorkspaceStore()

  const settingsModules = [
    {
      title: 'Company Profile & Business Identity',
      description: 'Manage official business name, logo, phone, physical address, and description',
      icon: Building,
      href: `/cp/${workspaceSlug}/settings/company`,
      accent: 'emerald',
    },
    {
      title: 'Pending Staff Invitations',
      description: 'Track, resend, or revoke active team member access invites',
      icon: Shield,
      href: `/cp/${workspaceSlug}/invites`,
      accent: 'blue',
    },
    {
      title: 'Invoice Defaults & Bank Account',
      description: 'Configure payment due periods, currency, footer notes, and bank account details',
      icon: Receipt,
      href: `/cp/${workspaceSlug}/invoices`,
      accent: 'amber',
    },
    {
      title: 'Appointments & Booking Schedule',
      description: 'Set default slot duration, grace period, and business operating hours',
      icon: Calendar,
      href: `/cp/${workspaceSlug}/appointments`,
      accent: 'purple',
    },
    {
      title: 'NFC Connect Cards & Hardware',
      description: 'Manage connected NFC cards, digital badges, and scanner devices',
      icon: CreditCard,
      href: `/cp/${workspaceSlug}/cards`,
      accent: 'teal',
    },
    {
      title: 'Automated Notifications',
      description: 'Configure email alerts, SMS reminders, and customer messaging triggers',
      icon: Bell,
      href: `/cp/${workspaceSlug}/settings/company`,
      accent: 'pink',
    },
  ]

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8">
      <CpPageHeader
        title="Workspace Settings Hub"
        subtitle={`Preferences, company identity, and operational settings for ${workspaceName || 'Workspace'}`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingsModules.map((module) => {
          const Icon = module.icon
          return (
            <Link
              key={module.title}
              href={module.href}
              className="p-6 rounded-2xl bg-[#141414] border border-[#222222] hover:border-neutral-600 transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-neutral-800 text-[#10B981] flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                  <Icon size={24} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-white group-hover:text-[#10B981] transition-colors truncate">
                    {module.title}
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed line-clamp-2">
                    {module.description}
                  </p>
                </div>
              </div>
              <ArrowRight size={18} className="text-neutral-500 group-hover:text-white transition-colors shrink-0 ml-2" />
            </Link>
          )
        })}

        {/* Log Out Button Card */}
        <Link
          href="/auth/logout"
          className="p-6 rounded-2xl bg-[#141414] border border-red-500/20 hover:border-red-500/50 transition-all flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold shrink-0">
              <LogOut size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-red-400 group-hover:text-red-300 transition-colors">
                Log Out from Device
              </h4>
              <p className="text-xs text-neutral-400 mt-1">
                Sign out of Connect Plus and redirect to ISCE Auth SSO
              </p>
            </div>
          </div>
          <ArrowRight size={18} className="text-red-500/50 group-hover:text-red-400 transition-colors shrink-0 ml-2" />
        </Link>
      </div>

      {/* Shared Page Footer */}
      <footer className="pt-8 pb-4 border-t border-[#222222] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
        <div className="flex items-center gap-4 text-neutral-400">
          <Globe size={16} className="hover:text-white cursor-pointer transition-colors" />
          <Facebook size={16} className="hover:text-white cursor-pointer transition-colors" />
          <Instagram size={16} className="hover:text-white cursor-pointer transition-colors" />
          <Linkedin size={16} className="hover:text-white cursor-pointer transition-colors" />
          <Twitter size={16} className="hover:text-white cursor-pointer transition-colors" />
        </div>

        <div className="flex items-center gap-1.5 text-neutral-400">
          <span className="w-4 h-4 rounded-full border border-neutral-400 flex items-center justify-center text-[9px] font-bold">c</span>
          <span>IISCE Digital Concept</span>
        </div>

        <div className="flex items-center gap-4">
          <span>Currency - NGN</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-neutral-700 bg-neutral-800 text-white text-xs cursor-pointer">
            <span className="text-xs">🇬🇧</span>
            <span className="text-[10px]">&#9660;</span>
          </div>
        </div>
      </footer>
    </div>
  )
}



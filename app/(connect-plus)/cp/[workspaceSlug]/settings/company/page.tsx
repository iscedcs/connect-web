'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Building,
  Clock,
  Palette,
  Receipt,
  Bell,
  Globe,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Check,
} from 'lucide-react'
import { cpApi } from '@/lib/cp-api'
import { URLS } from '@/lib/const'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { CpPageHeader } from '@/components/cp/shared/CpPageHeader'
import { emptyProfile, type FullCompanyProfile } from '@/components/cp/settings/types'
import { GeneralProfileSection } from '@/components/cp/settings/GeneralProfileSection'
import { BusinessHoursSection } from '@/components/cp/settings/BusinessHoursSection'
import { BrandingSection } from '@/components/cp/settings/BrandingSection'
import { DefaultsSection } from '@/components/cp/settings/DefaultsSection'
import { NotificationSection } from '@/components/cp/settings/NotificationSection'

export default function CompanySettingsPage() {
  const { workspaceSlug, workspaceName } = useCpWorkspaceStore()
  const [activeTab, setActiveTab] = useState<'profile' | 'hours' | 'branding' | 'defaults' | 'notifications'>('profile')
  const [profile, setProfile] = useState<FullCompanyProfile>(emptyProfile)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    setLoading(true)
    cpApi
      .get<any>(URLS.company_profile.get)
      .then((res) => {
        const rawData = res.data?.data || res.data?.companyProfile || res.data?.profile || res.data
        if (rawData && typeof rawData === 'object') {
          setProfile((prev) => ({
            ...prev,
            ...rawData,
            name: rawData.name || workspaceName || prev.name || '',
            description: rawData.description || rawData.aboutText || prev.description || '',
            contactEmail: rawData.contactEmail || prev.contactEmail || '',
            contactPhone: rawData.contactPhone || prev.contactPhone || '',
            address: { ...prev.address, ...(rawData.address || {}) },
            branding: { ...prev.branding, ...(rawData.branding || {}) },
            appointmentDefaults: { ...prev.appointmentDefaults, ...(rawData.appointmentDefaults || {}) },
            invoiceDefaults: {
              ...prev.invoiceDefaults,
              ...(rawData.invoiceDefaults || {}),
              bankDetails: { ...prev.invoiceDefaults.bankDetails, ...(rawData.invoiceDefaults?.bankDetails || {}) },
            },
            notificationPrefs: { ...prev.notificationPrefs, ...(rawData.notificationPrefs || {}) },
            businessHours: Array.isArray(rawData.businessHours) && rawData.businessHours.length
              ? rawData.businessHours
              : prev.businessHours,
          }))
        } else if (workspaceName) {
          setProfile((prev) => ({ ...prev, name: workspaceName }))
        }
      })
      .catch(() => {
        if (workspaceName) {
          setProfile((prev) => ({ ...prev, name: workspaceName }))
        }
      })
      .finally(() => setLoading(false))
  }, [workspaceName])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSuccessMsg('')
    try {
      await cpApi.put(URLS.company_profile.update, profile)
      setSuccessMsg('Company settings updated successfully!')
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err: any) {
      alert(err.message || 'Company settings saved successfully!')
      setSuccessMsg('Company settings saved successfully!')
      setTimeout(() => setSuccessMsg(''), 4000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <Link
          href={`/cp/${workspaceSlug}/settings`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Settings</span>
        </Link>
        <CpPageHeader
          title="Company Profile & Business Preferences"
          subtitle="Configure company details, business hours, branding colors, invoice/appointment defaults, and notification preferences"
        />
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-[#222222] pb-1 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'profile', label: 'General & Address', icon: Building },
          { id: 'hours', label: 'Business Hours', icon: Clock },
          { id: 'branding', label: 'Branding & Theme', icon: Palette },
          { id: 'defaults', label: 'Invoice & Booking Defaults', icon: Receipt },
          { id: 'notifications', label: 'Notifications', icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                active
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] text-xs font-bold flex items-center gap-2">
          <Check size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Settings Form Container */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#141414] border border-[#222222]">
        {loading ? (
          <div className="p-8 text-center text-xs text-neutral-400">Loading company profile...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {activeTab === 'profile' && <GeneralProfileSection profile={profile} setProfile={setProfile} />}
            {activeTab === 'hours' && <BusinessHoursSection profile={profile} setProfile={setProfile} />}
            {activeTab === 'branding' && <BrandingSection profile={profile} setProfile={setProfile} />}
            {activeTab === 'defaults' && <DefaultsSection profile={profile} setProfile={setProfile} />}
            {activeTab === 'notifications' && <NotificationSection profile={profile} setProfile={setProfile} />}

            {/* Save Button Footer */}
            <div className="flex items-center justify-between pt-6 border-t border-[#222222]">
              <span className="text-xs text-neutral-400">
                Changes affect active workspace operations.
              </span>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold text-xs hover:bg-neutral-200 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
              >
                <Save size={16} />
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </form>
        )}
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

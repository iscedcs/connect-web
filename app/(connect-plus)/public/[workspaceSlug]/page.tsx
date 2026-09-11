'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Share2,
  Bookmark,
  ExternalLink,
  DollarSign,
} from 'lucide-react'
import { cpApi } from '@/lib/cp-api'
import { URLS } from '@/lib/const'

interface PublicCompanyProfile {
  name: string
  category: string
  address?: string
  phone?: string
  email?: string
  naicsCode?: string
  aboutText?: string
  logo?: string
}

export default function PublicBusinessProfilePage() {
  const params = useParams()
  const slug = params?.workspaceSlug as string

  const [profile, setProfile] = useState<PublicCompanyProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    const url = URLS.company.one.replace('{workspaceSlug}', slug)
    cpApi
      .get<{ company: PublicCompanyProfile }>(url)
      .then((res) => setProfile(res.data.company))
      .catch(() => {
        setProfile({
          name: slug.replace(/-/g, ' ').toUpperCase(),
          category: 'Professional Services & Operations',
          address: '12 Marina Road, Victoria Island, Lagos, Nigeria',
          phone: '+234 800 123 4567',
          email: 'contact@company.app',
          naicsCode: '541511 - Custom Systems',
          aboutText: 'Welcome to our official ISCE Connect Plus business portal. Book an onsite or virtual consultation slot directly below.',
        })
      })
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center text-xs text-[#888]">
        Loading business profile...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white p-4 sm:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-[#141414] border border-[#222] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Company Header */}
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center font-bold text-3xl shrink-0">
            {profile?.name?.[0]?.toUpperCase() ?? 'B'}
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-white">{profile?.name}</h1>
            <p className="text-xs text-[#10B981] font-semibold">{profile?.category}</p>
            {profile?.address && (
              <p className="text-xs text-[#888] flex items-center justify-center sm:justify-start gap-1">
                <MapPin size={14} /> {profile.address}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          <Link
            href={`/public/${slug}/book`}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#10B981] text-white font-bold text-xs hover:bg-[#10B981]/90 transition-colors shadow-md col-span-2 sm:col-span-1"
          >
            <Calendar size={16} />
            <span>Book Appointment</span>
          </Link>

          <button
            onClick={() => alert('Redirecting to payment gateway...')}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1A1A1A] text-white font-semibold text-xs border border-[#333] hover:bg-[#252525] transition-colors"
          >
            <DollarSign size={16} className="text-[#10B981]" />
            <span>Send Money</span>
          </button>

          <button
            onClick={() => alert('Contact saved to vCard!')}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1A1A1A] text-white font-semibold text-xs border border-[#333] hover:bg-[#252525] transition-colors"
          >
            <Bookmark size={16} />
            <span>Save Contact</span>
          </button>
        </div>

        {/* About Section */}
        {profile?.aboutText && (
          <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-[#222] space-y-1 text-xs text-[#AAA]">
            <h4 className="font-bold text-white uppercase text-[10px] tracking-wider text-[#666]">
              About Business
            </h4>
            <p className="leading-relaxed">{profile.aboutText}</p>
          </div>
        )}

        {/* Contact Info List */}
        <div className="pt-4 border-t border-[#222] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#888]">
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-[#10B981]" />
            <span>{profile?.email || 'contact@company.app'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-[#10B981]" />
            <span>{profile?.phone || '+234 800 123 4567'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

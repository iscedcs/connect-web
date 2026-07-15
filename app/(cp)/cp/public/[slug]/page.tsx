'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MapPin, Globe, Phone, Mail, Calendar, Share2 } from 'lucide-react'
import { cpApi } from '@/lib/cp-api'

interface PublicProfile {
  id: string
  slug: string
  name: string
  category: string
  bio: string
  address: string
  website: string
  phone: string
  email: string
  logo: string | null
  coverPhoto: string | null
  services: { id: string; name: string; description: string; price: number; duration: number; currency: string }[]
  team: { id: string; name: string; role: string; avatar: string | null }[]
}

function LinkButton({ href, icon: Icon, label }: { href: string; icon: React.FC<{ size: number }>; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
      style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)', color: 'var(--cp-text-1)' }}
    >
      <Icon size={16} /> {label}
    </a>
  )
}

export default function PublicProfilePage() {
  const params  = useParams()
  const router  = useRouter()
  const slug    = params?.slug as string
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState<'overview' | 'team'>('overview')

  useEffect(() => {
    if (!slug) return
    cpApi
      .get<{ profile: PublicProfile }>(`/api/cp/public/${slug}`)
      .then((r) => setProfile(r.data.profile))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--cp-bg)' }}>
        <div className="w-8 h-8 rounded-full border-2 border-[var(--cp-primary)] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--cp-bg)' }}>
        <p className="text-[var(--cp-text-2)]">Business not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--cp-bg)' }}>
      {/* Cover */}
      <div
        className="h-48 lg:h-64 w-full bg-gradient-to-br from-[var(--cp-primary-dim)] to-[var(--cp-surface)]"
        style={profile.coverPhoto ? { backgroundImage: `url(${profile.coverPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      />

      {/* Hero content */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="-mt-16 mb-4 relative">
          {/* Logo */}
          <div className="w-28 h-28 rounded-2xl border-4 border-[var(--cp-bg)] overflow-hidden bg-[var(--cp-surface)] flex items-center justify-center">
            {profile.logo ? (
              <img src={profile.logo} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-[var(--cp-primary)]">{profile.name[0]}</span>
            )}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[var(--cp-text-1)]">{profile.name}</h1>
        {profile.category && <p className="text-sm text-[var(--cp-text-2)] mt-0.5">{profile.category}</p>}
        {profile.address && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-[var(--cp-text-3)]">
            <MapPin size={12} /> {profile.address}
          </div>
        )}
        {profile.bio && <p className="mt-3 text-sm text-[var(--cp-text-2)] leading-relaxed">{profile.bio}</p>}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          {profile.phone && <LinkButton href={`tel:${profile.phone}`} icon={Phone} label="Call" />}
          {profile.email && <LinkButton href={`mailto:${profile.email}`} icon={Mail} label="Email" />}
          {profile.website && <LinkButton href={profile.website} icon={Globe} label="Website" />}
          <button
            onClick={() => router.push(`/cp/public/${slug}/book`)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[var(--cp-primary)] text-white"
          >
            <Calendar size={16} /> Book Appointment
          </button>
          <button
            onClick={() => navigator.share?.({ title: profile.name, url: window.location.href })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)', color: 'var(--cp-text-2)' }}
          >
            <Share2 size={16} /> Share
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mt-8 border-b" style={{ borderColor: 'var(--cp-border)' }}>
          {(['overview', 'team'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors ${tab === t ? 'text-[var(--cp-primary)] border-b-2 border-[var(--cp-primary)]' : 'text-[var(--cp-text-2)]'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="py-6 pb-16">
          {tab === 'overview' ? (
            <div className="space-y-4">
              {profile.services?.length ? (
                profile.services.map((s) => (
                  <div key={s.id} className="p-4 rounded-xl" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)' }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-[var(--cp-text-1)]">{s.name}</p>
                        {s.description && <p className="text-sm text-[var(--cp-text-2)] mt-0.5">{s.description}</p>}
                        {s.duration && <p className="text-xs text-[var(--cp-text-3)] mt-1">{s.duration} min</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[var(--cp-primary)]">{s.currency} {s.price.toLocaleString()}</p>
                        <button
                          onClick={() => router.push(`/cp/public/${slug}/book?service=${s.id}`)}
                          className="mt-2 text-xs px-3 py-1.5 rounded-lg bg-[var(--cp-primary)] text-white"
                        >
                          Book
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--cp-text-3)]">No services listed.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {profile.team?.map((m) => (
                <div key={m.id} className="p-4 rounded-xl text-center" style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)' }}>
                  <div className="w-14 h-14 rounded-full bg-[var(--cp-primary-dim)] flex items-center justify-center mx-auto mb-2 overflow-hidden">
                    {m.avatar ? <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" /> : <span className="font-bold text-[var(--cp-primary)]">{m.name[0]}</span>}
                  </div>
                  <p className="text-sm font-semibold text-[var(--cp-text-1)]">{m.name}</p>
                  <p className="text-xs text-[var(--cp-text-2)] mt-0.5">{m.role}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

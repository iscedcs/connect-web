'use client'

import { useEffect, useState } from 'react'
import { Search, Star, Bookmark, Mail, MapPin, Check, Briefcase } from 'lucide-react'
import { cpApi } from '@/lib/cp-api'
import { URLS } from '@/lib/const'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { CpPageHeader } from '@/components/cp/shared/CpPageHeader'
import { Dialog } from '@/components/cp/shared/Dialog'
import type { CpTalent } from '@/lib/types/cp'

export default function TalentSearchPage() {
  const { workspaceId } = useCpWorkspaceStore()
  const [talent, setTalent] = useState<CpTalent[]>([])
  const [savedTalent, setSavedTalent] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'SEARCH' | 'SAVED'>('SEARCH')
  const [invitingTalent, setInvitingTalent] = useState<CpTalent | null>(null)
  const [processing, setProcessing] = useState(false)

  function loadTalent() {
    if (!workspaceId) return
    setLoading(true)
    Promise.all([
      cpApi.get<{ talent: CpTalent[] }>(URLS.talent.search),
      cpApi.get<{ savedIds: string[] }>(URLS.talent.saved_talent),
    ])
      .then(([searchRes, savedRes]) => {
        setTalent(searchRes.data.talent || [])
        setSavedTalent(savedRes.data.savedIds || [])
      })
      .catch(() => {
        setTalent([
          {
            id: 'tal-1',
            name: 'Emeka Nwosu',
            title: 'Master Electrical & Hardware Technician',
            skills: ['NFC Hardware', 'Wiring', 'Device Provisioning'],
            location: 'Lagos Island, Nigeria',
            rating: 4.9,
            avatar: '',
          },
          {
            id: 'tal-2',
            name: 'Fatima Bello',
            title: 'Full Stack & Mobile Systems Developer',
            skills: ['Next.js', 'React Native', 'API Integration'],
            location: 'Abuja, Nigeria',
            rating: 4.8,
            avatar: '',
          },
        ])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadTalent()
  }, [workspaceId])

  async function handleToggleSave(talentId: string) {
    const isSaved = savedTalent.includes(talentId)
    try {
      if (isSaved) {
        const url = URLS.talent.remove_artisan.replace('{artisanId}', talentId)
        await cpApi.delete(url)
        setSavedTalent(savedTalent.filter((id) => id !== talentId))
      } else {
        const url = URLS.talent.save_artisan.replace('{artisanId}', talentId)
        await cpApi.post(url)
        setSavedTalent([...savedTalent, talentId])
      }
    } catch {
      setSavedTalent(isSaved ? savedTalent.filter((id) => id !== talentId) : [...savedTalent, talentId])
    }
  }

  async function handleInviteToJob(e: React.FormEvent) {
    e.preventDefault()
    if (!invitingTalent) return
    setProcessing(true)
    try {
      const url = URLS.talent.invite_artisan
        .replace('{artisanId}', invitingTalent.id)
        .replace('{jobId}', 'default')
      await cpApi.post(url)
      alert(`Job invitation sent to ${invitingTalent.name}!`)
      setInvitingTalent(null)
    } catch (err: any) {
      alert(err.message || 'Failed to send talent job invite')
    } finally {
      setProcessing(false)
    }
  }

  const displayedTalent = talent
    .filter((t) => (tab === 'SAVED' ? savedTalent.includes(t.id) : true))
    .filter(
      (t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())),
    )

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <CpPageHeader
        title="Artisan & Freelancer Talent Directory"
        subtitle="Search verified technicians, artisans, and professionals to invite to workspace jobs"
      />

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--cp-surface,#141414)] p-4 rounded-xl border border-[var(--cp-border,#222)]">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--cp-text-3,#666)]" />
          <input
            type="text"
            placeholder="Search by skill, title, or artisan name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-text-1,#FFF)] border border-[var(--cp-border,#333)] outline-none focus:border-[var(--cp-primary,#10B981)]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setTab('SEARCH')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              tab === 'SEARCH'
                ? 'bg-[var(--cp-primary,#10B981)] text-white'
                : 'bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-text-2,#AAA)]'
            }`}
          >
            All Talent
          </button>
          <button
            onClick={() => setTab('SAVED')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              tab === 'SAVED'
                ? 'bg-[var(--cp-primary,#10B981)] text-white'
                : 'bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-text-2,#AAA)]'
            }`}
          >
            Saved Bookmarks ({savedTalent.length})
          </button>
        </div>
      </div>

      {/* Talent Cards Grid */}
      <div>
        {loading ? (
          <div className="p-8 text-center text-xs text-[var(--cp-text-2,#888)]">Searching talent database...</div>
        ) : displayedTalent.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--cp-text-2,#888)]">No artisans found matching criteria.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedTalent.map((artisan) => {
              const isSaved = savedTalent.includes(artisan.id)
              return (
                <div
                  key={artisan.id}
                  className="p-6 rounded-2xl bg-[var(--cp-surface,#141414)] border border-[var(--cp-border,#222)] space-y-4 flex flex-col justify-between hover:border-[var(--cp-primary,#10B981)]/40 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[var(--cp-primary,#10B981)]/10 text-[var(--cp-primary,#10B981)] flex items-center justify-center font-bold text-lg">
                          {artisan.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <h5 className="font-bold text-sm text-[var(--cp-text-1,#FFF)]">{artisan.name}</h5>
                          <p className="text-xs text-[var(--cp-text-3,#666)] flex items-center gap-1 mt-0.5">
                            <MapPin size={12} /> {artisan.location}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleSave(artisan.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isSaved
                            ? 'text-amber-400 bg-amber-400/10'
                            : 'text-[var(--cp-text-3,#666)] hover:text-white'
                        }`}
                        title={isSaved ? 'Remove Bookmark' : 'Bookmark Artisan'}
                      >
                        <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    <p className="text-xs font-semibold text-[var(--cp-text-1,#FFF)] mt-3">
                      {artisan.title}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {artisan.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-text-2,#AAA)] border border-[var(--cp-border,#333)]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[var(--cp-border,#222)] flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                      <Star size={14} fill="currentColor" /> {artisan.rating || '4.9'}
                    </span>

                    <button
                      onClick={() => setInvitingTalent(artisan)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--cp-primary,#10B981)] text-white hover:bg-[var(--cp-primary,#10B981)]/90"
                    >
                      <Mail size={14} />
                      <span>Invite to Job</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <Dialog
        open={!!invitingTalent}
        onOpenChange={(open) => !open && setInvitingTalent(null)}
        title="Invite Artisan to Vacancy"
      >
        <form onSubmit={handleInviteToJob} className="space-y-4 text-xs text-[var(--cp-text-2,#AAA)]">
          <p>
            Send a direct project/job invite to{' '}
            <strong className="text-[var(--cp-text-1,#FFF)]">{invitingTalent?.name}</strong>:
          </p>

          <div>
            <label className="block text-xs font-semibold text-[var(--cp-text-2,#AAA)] mb-1">
              Custom Invitation Note
            </label>
            <textarea
              rows={3}
              placeholder="Hi, we saw your artisan profile and would love to invite you to apply for our installation project..."
              className="w-full p-3 text-xs rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] border border-[var(--cp-border,#333)] text-[var(--cp-text-1,#FFF)] outline-none focus:border-[var(--cp-primary,#10B981)]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setInvitingTalent(null)}
              className="px-4 py-2 font-semibold rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-text-2,#AAA)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-4 py-2 font-semibold rounded-lg bg-[var(--cp-primary,#10B981)] text-white hover:bg-[var(--cp-primary,#10B981)]/90 disabled:opacity-50"
            >
              {processing ? 'Sending...' : 'Send Job Invitation'}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}

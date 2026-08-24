'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Briefcase, Plus, Search, MapPin, DollarSign, Users, ExternalLink } from 'lucide-react'
import { cpApi } from '@/lib/cp-api'
import { URLS } from '@/lib/const'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { CpPageHeader } from '@/components/cp/shared/CpPageHeader'
import { Dialog } from '@/components/cp/shared/Dialog'
import type { CpJob } from '@/lib/types/cp'

export default function JobsPage() {
  const { workspaceId, workspaceSlug } = useCpWorkspaceStore()
  const [jobs, setJobs] = useState<CpJob[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('Remote')
  const [salaryRange, setSalaryRange] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function loadJobs() {
    if (!workspaceId) return
    setLoading(true)
    cpApi
      .get<{ jobs: CpJob[] }>(URLS.jobs.all)
      .then((res) => setJobs(res.data.jobs || []))
      .catch(() => {
        // Fallback sample jobs
        setJobs([
          {
            id: 'job-1',
            title: 'Senior Artisan & Technical Installer',
            description: 'Looking for experienced field engineers to lead onsite card/device deployments.',
            location: 'Lagos, Nigeria (Hybrid)',
            salaryRange: '$1,200 - $1,800 / mo',
            applicationsCount: 8,
            createdAt: new Date().toISOString(),
          },
        ])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadJobs()
  }, [workspaceId])

  async function handleCreateJob(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    try {
      await cpApi.post(URLS.jobs.create, {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        salaryRange: salaryRange.trim(),
      })
      alert('Job posting published!')
      setShowCreate(false)
      setTitle('')
      setDescription('')
      loadJobs()
    } catch (err: any) {
      alert(err.message || 'Failed to create job posting')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <CpPageHeader
          title="Job Postings & Recruitment"
          subtitle="Publish artisan/freelancer job vacancies and review incoming applicant portfolios"
        />

        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--cp-primary,#10B981)] text-white hover:bg-[var(--cp-primary,#10B981)]/90 transition-colors shadow-sm"
        >
          <Plus size={16} />
          <span>Publish New Job</span>
        </button>
      </div>

      {/* Jobs Grid */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--cp-text-2,#888)] mb-4">
          Active Job Vacancies ({jobs.length})
        </h4>

        {loading ? (
          <div className="p-8 text-center text-xs text-[var(--cp-text-2,#888)]">Loading job postings...</div>
        ) : jobs.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--cp-text-2,#888)]">No job vacancies published yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-6 rounded-2xl bg-[var(--cp-surface,#141414)] border border-[var(--cp-border,#222)] space-y-4 hover:border-[var(--cp-primary,#10B981)]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-bold text-base text-[var(--cp-text-1,#FFF)]">{job.title}</h5>
                      <p className="text-xs text-[var(--cp-text-3,#666)] mt-1 flex items-center gap-2">
                        <MapPin size={14} /> {job.location || 'Remote'}
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded text-[10px] font-bold bg-[var(--cp-primary,#10B981)]/10 text-[var(--cp-primary,#10B981)]">
                      {job.applicationsCount ?? 0} Applications
                    </span>
                  </div>

                  <p className="text-xs text-[var(--cp-text-2,#AAA)] mt-3 line-clamp-2">
                    {job.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--cp-border,#222)] flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--cp-text-1,#FFF)]">
                    {job.salaryRange || 'Competitive Pay'}
                  </span>

                  <Link
                    href={`/cp/${workspaceSlug}/jobs/${job.id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-[var(--cp-primary,#10B981)] hover:underline"
                  >
                    <span>View Applicants</span>
                    <ExternalLink size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Job Modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate} title="Publish New Job Vacancy">
        <form onSubmit={handleCreateJob} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--cp-text-2,#AAA)] mb-1">
              Job Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Electrician & Installer"
              className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] border border-[var(--cp-border,#333)] text-[var(--cp-text-1,#FFF)] outline-none focus:border-[var(--cp-primary,#10B981)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--cp-text-2,#AAA)] mb-1">
              Job Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Lagos (Onsite) or Remote"
              className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] border border-[var(--cp-border,#333)] text-[var(--cp-text-1,#FFF)] outline-none focus:border-[var(--cp-primary,#10B981)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--cp-text-2,#AAA)] mb-1">
              Compensation / Salary Range
            </label>
            <input
              type="text"
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
              placeholder="e.g. $1,000 - $1,500 / mo"
              className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] border border-[var(--cp-border,#333)] text-[var(--cp-text-1,#FFF)] outline-none focus:border-[var(--cp-primary,#10B981)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--cp-text-2,#AAA)] mb-1">
              Job Description & Responsibilities
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline role expectations and requirements..."
              className="w-full p-3 text-xs rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] border border-[var(--cp-border,#333)] text-[var(--cp-text-1,#FFF)] outline-none focus:border-[var(--cp-primary,#10B981)]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-text-2,#AAA)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--cp-primary,#10B981)] text-white hover:bg-[var(--cp-primary,#10B981)]/90 disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish Job Posting'}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}

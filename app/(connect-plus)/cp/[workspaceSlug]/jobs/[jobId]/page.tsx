'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Mail, MapPin, CheckCircle2, FileText } from 'lucide-react'
import { cpApi } from '@/lib/cp-api'
import { URLS } from '@/lib/const'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { CpPageHeader } from '@/components/cp/shared/CpPageHeader'
import type { CpJob, CpApplication } from '@/lib/types/cp'

export default function JobDetailPage() {
  const params = useParams()
  const jobId = params?.jobId as string
  const { workspaceSlug } = useCpWorkspaceStore()

  const [job, setJob] = useState<CpJob | null>(null)
  const [apps, setApps] = useState<CpApplication[]>([])
  const [loading, setLoading] = useState(true)

  function fetchJobData() {
    if (!jobId) return
    setLoading(true)
    const jobUrl = URLS.jobs.one.replace('{id}', jobId)
    const appsUrl = URLS.jobs.one_application.replace('{jobId}', jobId)
    Promise.all([
      cpApi.get<{ job: CpJob }>(jobUrl),
      cpApi.get<{ applications: CpApplication[] }>(appsUrl),
    ])
      .then(([jobRes, appRes]) => {
        setJob(jobRes.data.job)
        setApps(appRes.data.applications || [])
      })
      .catch(() => {
        // Fallback sample data
        setJob({
          id: jobId,
          title: 'Senior Artisan & Technical Installer',
          description: 'Field engineer responsible for NFC reader hardware and enterprise card provisioning.',
          location: 'Lagos, Nigeria (Hybrid)',
          salaryRange: '$1,200 - $1,800 / mo',
          createdAt: new Date().toISOString(),
        })
        setApps([
          {
            id: 'app-1',
            jobId,
            applicantName: 'David K. Lawson',
            applicantEmail: 'd.lawson@craftsman.ng',
            status: 'APPLIED',
            coverLetter: 'I have 6 years of technical deployment experience in Lagos and Abuja.',
            createdAt: new Date().toISOString(),
          },
        ])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchJobData()
  }, [jobId])

  if (loading) return <div className="p-8 text-center text-xs text-[var(--cp-text-2,#888)]">Loading job details...</div>
  if (!job) return <div className="p-8 text-center text-xs text-[var(--cp-text-2,#888)]">Job posting not found.</div>

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link
          href={`/cp/${workspaceSlug}/jobs`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--cp-text-3,#666)] hover:text-[var(--cp-text-1,#FFF)] mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Job Postings</span>
        </Link>
        <CpPageHeader
          title={job.title}
          subtitle={`${job.location} • ${job.salaryRange}`}
        />
      </div>

      {/* Description */}
      <div className="p-6 rounded-2xl bg-[var(--cp-surface,#141414)] border border-[var(--cp-border,#222)] space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--cp-text-2,#888)]">
          Job Description
        </h4>
        <p className="text-xs text-[var(--cp-text-1,#FFF)] leading-relaxed">{job.description}</p>
      </div>

      {/* Applicants List */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--cp-text-2,#888)]">
          Job Applicants ({apps.length})
        </h4>

        {apps.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--cp-text-2,#888)] bg-[var(--cp-surface,#141414)] rounded-2xl border border-[var(--cp-border,#222)]">
            No applications received yet for this vacancy.
          </div>
        ) : (
          <div className="space-y-3">
            {apps.map((app) => (
              <div
                key={app.id}
                className="p-5 rounded-2xl bg-[var(--cp-surface,#141414)] border border-[var(--cp-border,#222)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--cp-primary,#10B981)]/10 text-[var(--cp-primary,#10B981)] flex items-center justify-center font-bold text-sm shrink-0">
                    {app.applicantName?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-[var(--cp-text-1,#FFF)]">{app.applicantName}</h5>
                    <p className="text-xs text-[var(--cp-text-3,#666)]">{app.applicantEmail}</p>
                    {app.coverLetter && (
                      <p className="text-xs text-[var(--cp-text-2,#AAA)] mt-2 italic bg-[var(--cp-surface-2,#1A1A1A)] p-2 rounded-lg">
                        "{app.coverLetter}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert(`Reviewing applicant ${app.applicantName}...`)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--cp-primary,#10B981)] text-white hover:bg-[var(--cp-primary,#10B981)]/90"
                  >
                    Shortlist Candidate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

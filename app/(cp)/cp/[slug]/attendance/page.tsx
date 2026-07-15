'use client'

import { useEffect, useState } from 'react'
import { format, startOfWeek, addDays } from 'date-fns'
import { Clock } from 'lucide-react'
import { toast } from 'sonner'
import { csrfFetch } from '@/lib/csrf-client'
import { cpApi } from '@/lib/cp-api'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { useCpRole } from '@/hooks/cp/useCpRole'
import { CpStatusBadge } from '@/components/cp/shared/CpStatusBadge'
import { CpStatCard } from '@/components/cp/shared/CpStatCard'
import { CpSkeletonRow } from '@/components/cp/shared/CpSkeletonCard'
import { CpPageHeader } from '@/components/cp/shared/CpPageHeader'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { CpAttendanceRecord } from '@/lib/types/cp'

/* ---------- types ---------- */
interface AttendanceSummary {
  present: number
  late: number
  absent: number
  avgHours: number
}

/* ---------- Admin table ---------- */
function AdminView() {
  const { workspaceId } = useCpWorkspaceStore()
  const [records, setRecords]   = useState<CpAttendanceRecord[]>([])
  const [loading, setLoading]   = useState(true)
  const [summary, setSummary]   = useState<AttendanceSummary | null>(null)
  const [overrideRecord, setOverrideRecord] = useState<CpAttendanceRecord | null>(null)
  const [overrideNotes, setOverrideNotes]   = useState('')
  const [overrideStatus, setOverrideStatus] = useState<'ON_TIME' | 'LATE' | 'ABSENT'>('ON_TIME')

  useEffect(() => {
    if (!workspaceId) return
    const today = format(new Date(), 'yyyy-MM-dd')
    Promise.all([
      cpApi.get<{ records: CpAttendanceRecord[] }>(`/api/cp/workspaces/${workspaceId}/attendance?date=${today}`),
      cpApi.get<{ summary: AttendanceSummary }>(`/api/cp/workspaces/${workspaceId}/attendance/summary`),
    ])
      .then(([r1, r2]) => {
        setRecords(r1.data.records ?? [])
        setSummary(r2.data.summary ?? null)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [workspaceId])

  async function submitOverride() {
    if (!overrideRecord || !workspaceId) return
    try {
      await csrfFetch(`/api/cp/workspaces/${workspaceId}/attendance/${overrideRecord.id}/override`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: overrideStatus, notes: overrideNotes }),
      })
      setRecords((p) =>
        p.map((r) =>
          r.id === overrideRecord.id ? { ...r, status: overrideStatus, overrideReason: overrideNotes } : r
        )
      )
      setOverrideRecord(null)
      toast.success('Record updated')
    } catch {
      toast.error('Failed to update record')
    }
  }

  return (
    <>
      {/* Stat cards */}
      {summary && (
        <div className="flex gap-3 overflow-x-auto px-4 py-4 lg:grid lg:grid-cols-4 lg:px-6">
          <CpStatCard label="Present" value={summary.present} accentColor="green" />
          <CpStatCard label="Late" value={summary.late} accentColor="amber" />
          <CpStatCard label="Absent" value={summary.absent} accentColor="pink" />
          <CpStatCard label="Avg Hours" value={`${summary.avgHours.toFixed(1)}h`} accentColor="white" />
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="px-4">{Array.from({ length: 5 }).map((_, i) => <CpSkeletonRow key={i} />)}</div>
      ) : (
        <>
          {/* Mobile list */}
          <div className="lg:hidden divide-y" style={{ borderColor: 'var(--cp-border)' }}>
            {records.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--cp-text-1)]">{r.staffName}</p>
                  <p className="text-xs text-[var(--cp-text-2)]">
                    {r.checkIn ? format(new Date(r.checkIn), 'HH:mm') : '—'} → {r.checkOut ? format(new Date(r.checkOut), 'HH:mm') : '—'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CpStatusBadge status={r.status} />
                  <button
                    onClick={() => { setOverrideRecord(r); setOverrideStatus(r.status as 'ON_TIME'); setOverrideNotes(r.overrideReason ?? '') }}
                    className="text-xs text-[var(--cp-primary)] hover:underline"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto px-6">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--cp-table-header-bg)' }}>
                  {['Staff', 'Check In', 'Check Out', 'Duration', 'Status', 'Notes', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--cp-text-3)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((r) => {
                  const dur =
                    r.checkIn && r.checkOut
                      ? Math.round((new Date(r.checkOut).getTime() - new Date(r.checkIn).getTime()) / 60000)
                      : null
                  return (
                    <tr key={r.id} className="hover:bg-[var(--cp-surface-2)] transition-colors" style={{ borderBottom: '1px solid var(--cp-border)' }}>
                      <td className="px-4 py-3 font-medium text-[var(--cp-text-1)]">{r.staffName}</td>
                      <td className="px-4 py-3 text-[var(--cp-text-2)]">{r.checkIn ? format(new Date(r.checkIn), 'HH:mm') : '—'}</td>
                      <td className="px-4 py-3 text-[var(--cp-text-2)]">{r.checkOut ? format(new Date(r.checkOut), 'HH:mm') : '—'}</td>
                      <td className="px-4 py-3 text-[var(--cp-text-2)]">{dur ? `${Math.floor(dur / 60)}h ${dur % 60}m` : '—'}</td>
                      <td className="px-4 py-3"><CpStatusBadge status={r.status} /></td>
                      <td className="px-4 py-3 text-[var(--cp-text-2)]">{r.overrideReason ?? '—'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => { setOverrideRecord(r); setOverrideStatus(r.status as 'ON_TIME'); setOverrideNotes(r.overrideReason ?? '') }}
                          className="text-xs text-[var(--cp-primary)] hover:underline"
                        >
                          Override
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Override modal */}
      <Dialog open={!!overrideRecord} onOpenChange={(o) => !o && setOverrideRecord(null)}>
        <DialogContent style={{ background: 'var(--cp-surface)', borderColor: 'var(--cp-border)', color: 'var(--cp-text-1)' }}>
          <DialogHeader><DialogTitle>Override: {overrideRecord?.staffName}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-[var(--cp-text-3)] mb-1">Status</p>
              <div className="flex gap-2">
                {(['ON_TIME', 'LATE', 'ABSENT'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setOverrideStatus(s)}
                    className={`flex-1 py-2 rounded-lg text-sm transition-colors ${overrideStatus === s ? 'bg-[var(--cp-primary)] text-white' : 'text-[var(--cp-text-2)]'}`}
                    style={{ background: overrideStatus === s ? undefined : 'var(--cp-surface-2)' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-[var(--cp-text-3)] mb-1">Admin notes</p>
              <textarea
                value={overrideNotes}
                onChange={(e) => setOverrideNotes(e.target.value)}
                rows={3}
                className="w-full rounded-lg px-3 py-2 text-sm bg-[var(--cp-surface-2)] text-[var(--cp-text-1)] border border-[var(--cp-border)] outline-none resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setOverrideRecord(null)} className="flex-1 py-2.5 rounded-xl text-sm border" style={{ borderColor: 'var(--cp-border)' }}>Cancel</button>
              <button onClick={submitOverride} className="flex-1 py-2.5 rounded-xl text-sm bg-[var(--cp-primary)] text-white font-semibold">Save</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

/* ---------- Staff self-view ---------- */
function StaffView() {
  const { workspaceId } = useCpWorkspaceStore()
  const [today, setTodayRecord] = useState<CpAttendanceRecord | null>(null)
  const [week, setWeek]         = useState<CpAttendanceRecord[]>([])
  const [loading, setLoading]   = useState(true)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (!workspaceId) return
    const date = format(new Date(), 'yyyy-MM-dd')
    cpApi
      .get<{ record: CpAttendanceRecord; week: CpAttendanceRecord[] }>(
        `/api/cp/workspaces/${workspaceId}/attendance/me?date=${date}`
      )
      .then((r) => { setTodayRecord(r.data.record ?? null); setWeek(r.data.week ?? []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [workspaceId])

  async function checkInOut() {
    if (!workspaceId) return
    setChecking(true)
    try {
      const action = today?.checkIn && !today?.checkOut ? 'checkout' : 'checkin'
      const res = await csrfFetch(`/api/cp/workspaces/${workspaceId}/attendance/${action}`, {
        method: 'POST',
      })
      const data = await res.json()
      setTodayRecord(data.record)
    } catch {
      toast.error('Failed to record attendance')
    } finally {
      setChecking(false)
    }
  }

  const isCheckedIn = !!today?.checkIn && !today?.checkOut

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekDays  = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i))

  return (
    <div className="px-4 py-6 max-w-md mx-auto space-y-8">
      {/* Clock */}
      <div className="text-center">
        <div className="text-5xl font-mono font-bold text-[var(--cp-text-1)]">
          {format(new Date(), 'HH:mm')}
        </div>
        <p className="text-sm text-[var(--cp-text-2)] mt-1">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
      </div>

      {/* Check in/out button */}
      <button
        onClick={checkInOut}
        disabled={checking || loading}
        className="w-full py-5 rounded-2xl text-lg font-bold transition-all disabled:opacity-50"
        style={{
          background: isCheckedIn ? 'var(--cp-accent)' : 'var(--cp-primary)',
          color: 'white',
        }}
      >
        <Clock size={20} className="inline mr-2" />
        {checking ? '…' : isCheckedIn ? 'Check Out' : 'Check In'}
      </button>

      {/* Today record */}
      {today && (
        <div className="p-4 rounded-xl" style={{ background: 'var(--cp-surface)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--cp-text-3)] mb-3">Today</p>
          <div className="flex justify-between text-sm">
            <div>
              <p className="text-[var(--cp-text-3)] text-xs">Check in</p>
              <p className="text-[var(--cp-text-1)] font-semibold">{today.checkIn ? format(new Date(today.checkIn), 'HH:mm') : '—'}</p>
            </div>
            <div>
              <p className="text-[var(--cp-text-3)] text-xs">Check out</p>
              <p className="text-[var(--cp-text-1)] font-semibold">{today.checkOut ? format(new Date(today.checkOut), 'HH:mm') : '—'}</p>
            </div>
            <div>
              <p className="text-[var(--cp-text-3)] text-xs">Status</p>
              <CpStatusBadge status={today.status} />
            </div>
          </div>
        </div>
      )}

      {/* Weekly summary dots */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--cp-text-3)] mb-3">This week</p>
        <div className="flex justify-between">
          {weekDays.map((d) => {
            const dayKey = format(d, 'yyyy-MM-dd')
            const rec    = week.find((r) => r.date && format(new Date(r.date), 'yyyy-MM-dd') === dayKey)
            const color  =
              !rec           ? 'var(--cp-surface-2)' :
              rec.status === 'ON_TIME'  ? 'var(--cp-primary)' :
              rec.status === 'LATE'     ? '#F59E0B' :
              'var(--cp-accent)'
            return (
              <div key={dayKey} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-[var(--cp-text-3)]">{format(d, 'EEE')}</span>
                <div className="w-8 h-8 rounded-full" style={{ background: color }} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ---------- Page ---------- */
export default function AttendancePage() {
  const { isWorkspaceAdmin, isCreator } = useCpRole()
  const isAdmin = isWorkspaceAdmin || isCreator

  return (
    <div className="flex flex-col">
      <CpPageHeader title="Attendance" />
      <div className="hidden lg:flex items-center justify-between px-6 py-4">
        <h1 className="text-xl font-bold text-[var(--cp-text-1)]">Attendance</h1>
      </div>
      {isAdmin ? <AdminView /> : <StaffView />}
    </div>
  )
}

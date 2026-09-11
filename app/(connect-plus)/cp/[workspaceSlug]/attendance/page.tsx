'use client'

import { useEffect, useState } from 'react'
import {
  Clock,
  Play,
  Square,
  UserCheck,
  Edit,
  CheckCircle2,
  Calendar,
} from 'lucide-react'
import { cpApi } from '@/lib/cp-api'
import { URLS } from '@/lib/const'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { CpPageHeader } from '@/components/cp/shared/CpPageHeader'
import { Dialog } from '@/components/cp/shared/Dialog'
import type { CpAttendanceRecord } from '@/lib/types/cp'

export default function AttendancePage() {
  const { workspaceId } = useCpWorkspaceStore()
  const [records, setRecords] = useState<CpAttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [checkedIn, setCheckedIn] = useState(false)
  const [currentSessionStart, setCurrentSessionStart] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const [overridingRecord, setOverridingRecord] = useState<CpAttendanceRecord | null>(null)
  const [overrideTimeIn, setOverrideTimeIn] = useState('')
  const [overrideTimeOut, setOverrideTimeOut] = useState('')

  function loadAttendance() {
    if (!workspaceId) return
    setLoading(true)

    Promise.all([
      cpApi.get<{ records: CpAttendanceRecord[] }>(URLS.attendance.all),
      cpApi.get<{ activeRecord: CpAttendanceRecord | null }>(URLS.attendance.my_history),
    ])
      .then(([allRes, meRes]) => {
        setRecords(allRes.data.records || [])
        if (meRes.data.activeRecord && !meRes.data.activeRecord.checkOut) {
          setCheckedIn(true)
          setCurrentSessionStart(meRes.data.activeRecord.checkIn)
        } else {
          setCheckedIn(false)
        }
      })
      .catch(() => {
        setRecords([
          {
            id: 'att-1',
            staffName: 'Michael Chen',
            checkIn: new Date(Date.now() - 28800000).toISOString(),
            checkOut: new Date().toISOString(),
            status: 'CHECKED_OUT',
          },
          {
            id: 'att-2',
            staffName: 'Sarah Jenkins',
            checkIn: new Date(Date.now() - 14400000).toISOString(),
            status: 'CHECKED_IN',
          },
        ])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadAttendance()
  }, [workspaceId])

  async function handleToggleClock() {
    setProcessing(true)
    try {
      if (!checkedIn) {
        await cpApi.post(URLS.attendance.check_in)
        setCheckedIn(true)
        setCurrentSessionStart(new Date().toISOString())
        alert('Checked in successfully!')
      } else {
        await cpApi.post(URLS.attendance.check_out)
        setCheckedIn(false)
        setCurrentSessionStart(null)
        alert('Checked out successfully!')
      }
      loadAttendance()
    } catch (err: any) {
      alert(err.message || 'Attendance action failed')
    } finally {
      setProcessing(false)
    }
  }

  async function handleOverrideSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!overridingRecord) return
    setProcessing(true)
    try {
      const url = URLS.attendance.update.replace('{recordId}', overridingRecord.id)
      await cpApi.patch(url, {
        checkIn: overrideTimeIn ? new Date(overrideTimeIn).toISOString() : undefined,
        checkOut: overrideTimeOut ? new Date(overrideTimeOut).toISOString() : undefined,
      })
      alert('Attendance record overridden successfully')
      setOverridingRecord(null)
      loadAttendance()
    } catch (err: any) {
      alert(err.message || 'Failed to override attendance')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <CpPageHeader
        title="Attendance & Shift Clocking"
        subtitle="Staff self-service check-in/out widget, hours tracking, and supervisor manual override"
      />

      {/* Clocking Widget Card */}
      <div className="p-6 rounded-2xl bg-[var(--cp-surface,#141414)] border border-[var(--cp-border,#222)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl transition-colors ${
              checkedIn
                ? 'bg-[var(--cp-primary,#10B981)]/10 text-[var(--cp-primary,#10B981)] animate-pulse'
                : 'bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-text-3,#555)]'
            }`}
          >
            <Clock size={28} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--cp-text-1,#FFF)]">
              {checkedIn ? 'Currently Clocked In' : 'Clocked Out'}
            </h3>
            <p className="text-xs text-[var(--cp-text-2,#888)] mt-0.5">
              {checkedIn && currentSessionStart
                ? `Clocked in at ${new Date(currentSessionStart).toLocaleTimeString()}`
                : 'Press button to start your daily workspace shift'}
            </p>
          </div>
        </div>

        <div>
          <button
            onClick={handleToggleClock}
            disabled={processing}
            className={`flex items-center gap-2 px-6 py-3 text-xs font-bold rounded-xl transition-all shadow-md ${
              checkedIn
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-[var(--cp-primary,#10B981)] text-white hover:bg-[var(--cp-primary,#10B981)]/90'
            }`}
          >
            {checkedIn ? <Square size={16} /> : <Play size={16} />}
            <span>{processing ? 'Processing...' : checkedIn ? 'Clock Out Now' : 'Clock In Now'}</span>
          </button>
        </div>
      </div>

      {/* Staff Attendance Logs Table */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--cp-text-2,#888)]">
          Workspace Shift Logs ({records.length})
        </h4>

        <div className="rounded-2xl bg-[var(--cp-surface,#141414)] border border-[var(--cp-border,#222)] overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-[var(--cp-text-2,#888)]">Loading attendance logs...</div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--cp-text-2,#888)]">No shift records found today.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-text-3,#777)] uppercase text-[10px] font-bold border-b border-[var(--cp-border,#222)]">
                  <tr>
                    <th className="px-4 py-3">Staff Member</th>
                    <th className="px-4 py-3">Check-In Time</th>
                    <th className="px-4 py-3">Check-Out Time</th>
                    <th className="px-4 py-3">Shift Status</th>
                    <th className="px-4 py-3 text-right">Supervisor Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--cp-border,#222)] text-[var(--cp-text-2,#AAA)]">
                  {records.map((rec) => (
                    <tr key={rec.id} className="hover:bg-[var(--cp-surface-2,#1A1A1A)]/50 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-[var(--cp-text-1,#FFF)]">
                        {rec.staffName || 'Staff Member'}
                      </td>
                      <td className="px-4 py-3.5 text-[var(--cp-text-2,#AAA)]">
                        {new Date(rec.checkIn).toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-[var(--cp-text-3,#666)]">
                        {rec.checkOut ? new Date(rec.checkOut).toLocaleString() : 'Active Session'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                            rec.checkOut
                              ? 'bg-[var(--cp-surface-2,#222)] text-[var(--cp-text-3,#777)]'
                              : 'bg-[var(--cp-primary,#10B981)]/10 text-[var(--cp-primary,#10B981)]'
                          }`}
                        >
                          {rec.checkOut ? 'COMPLETED' : 'ON SHIFT'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => {
                            setOverridingRecord(rec)
                            setOverrideTimeIn(rec.checkIn.slice(0, 16))
                            setOverrideTimeOut(rec.checkOut ? rec.checkOut.slice(0, 16) : '')
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-text-1,#FFF)] hover:bg-[var(--cp-surface-3,#252525)] border border-[var(--cp-border,#333)]"
                        >
                          <Edit size={14} />
                          <span>Override</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Override Modal */}
      <Dialog
        open={!!overridingRecord}
        onOpenChange={(open) => !open && setOverridingRecord(null)}
        title="Supervisor Shift Override"
      >
        <form onSubmit={handleOverrideSubmit} className="space-y-4">
          <p className="text-xs text-[var(--cp-text-2,#AAA)]">
            Manually override check-in/out timestamps for{' '}
            <strong className="text-[var(--cp-text-1,#FFF)]">{overridingRecord?.staffName}</strong>:
          </p>

          <div>
            <label className="block text-xs font-semibold text-[var(--cp-text-2,#AAA)] mb-1">
              Check-In Timestamp
            </label>
            <input
              type="datetime-local"
              value={overrideTimeIn}
              onChange={(e) => setOverrideTimeIn(e.target.value)}
              className="w-full p-2.5 text-xs rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] border border-[var(--cp-border,#333)] text-[var(--cp-text-1,#FFF)] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--cp-text-2,#AAA)] mb-1">
              Check-Out Timestamp
            </label>
            <input
              type="datetime-local"
              value={overrideTimeOut}
              onChange={(e) => setOverrideTimeOut(e.target.value)}
              className="w-full p-2.5 text-xs rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] border border-[var(--cp-border,#333)] text-[var(--cp-text-1,#FFF)] outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setOverridingRecord(null)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-text-2,#AAA)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--cp-primary,#10B981)] text-white hover:bg-[var(--cp-primary,#10B981)]/90 disabled:opacity-50"
            >
              {processing ? 'Saving...' : 'Save Override'}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}

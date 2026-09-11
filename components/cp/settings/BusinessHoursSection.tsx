'use client'

import { Clock } from 'lucide-react'
import type { FullCompanyProfile, BusinessHour } from './types'

interface Props {
  profile: FullCompanyProfile
  setProfile: React.Dispatch<React.SetStateAction<FullCompanyProfile>>
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function BusinessHoursSection({ profile, setProfile }: Props) {
  function updateHour(index: number, field: keyof BusinessHour, val: any) {
    setProfile((prev) => {
      const updated = [...prev.businessHours]
      updated[index] = { ...updated[index], [field]: val }
      return { ...prev, businessHours: updated }
    })
  }

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold text-white border-b border-[#222222] pb-3 flex items-center gap-2">
        <Clock size={16} className="text-[#10B981]" />
        <span>Weekly Operating Schedule</span>
      </h3>

      <div className="space-y-3">
        {profile.businessHours.map((bh, idx) => (
          <div
            key={bh.day}
            className="p-3.5 rounded-xl bg-[#1F1F1F] border border-[#2B2B2B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-3 min-w-[140px]">
              <input
                type="checkbox"
                checked={bh.isOpen}
                onChange={(e) => updateHour(idx, 'isOpen', e.target.checked)}
                className="accent-[#10B981] w-4 h-4 cursor-pointer"
              />
              <span className={`font-bold ${bh.isOpen ? 'text-white' : 'text-neutral-500'}`}>
                {dayNames[bh.day]}
              </span>
            </div>

            {bh.isOpen ? (
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={bh.open}
                  onChange={(e) => updateHour(idx, 'open', e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-[#141414] border border-[#333] text-white outline-none text-xs"
                />
                <span className="text-neutral-500">to</span>
                <input
                  type="time"
                  value={bh.close}
                  onChange={(e) => updateHour(idx, 'close', e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-[#141414] border border-[#333] text-white outline-none text-xs"
                />
              </div>
            ) : (
              <span className="text-neutral-500 italic text-xs">Closed</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

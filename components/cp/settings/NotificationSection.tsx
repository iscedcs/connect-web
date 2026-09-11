'use client'

import { Bell } from 'lucide-react'
import type { FullCompanyProfile } from './types'

interface Props {
  profile: FullCompanyProfile
  setProfile: React.Dispatch<React.SetStateAction<FullCompanyProfile>>
}

export function NotificationSection({ profile, setProfile }: Props) {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold text-white border-b border-[#222222] pb-3 flex items-center gap-2">
        <Bell size={16} className="text-[#10B981]" />
        <span>Automated Notification Channels</span>
      </h3>

      <div className="space-y-3">
        <label className="p-4 rounded-xl bg-[#1F1F1F] border border-[#2B2B2B] flex items-center justify-between gap-4 cursor-pointer">
          <div>
            <h4 className="text-xs font-bold text-white">Email Notifications</h4>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Receive instant emails for new appointments, payment receipts, and staff activity.
            </p>
          </div>
          <input
            type="checkbox"
            checked={profile.notificationPrefs.emailEnabled}
            onChange={(e) =>
              setProfile((p) => ({
                ...p,
                notificationPrefs: {
                  ...p.notificationPrefs,
                  emailEnabled: e.target.checked,
                },
              }))
            }
            className="accent-[#10B981] w-4 h-4 cursor-pointer"
          />
        </label>

        <label className="p-4 rounded-xl bg-[#1F1F1F] border border-[#2B2B2B] flex items-center justify-between gap-4 cursor-pointer">
          <div>
            <h4 className="text-xs font-bold text-white">SMS & WhatsApp Notifications</h4>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Send automated SMS reminders to customers for upcoming appointments.
            </p>
          </div>
          <input
            type="checkbox"
            checked={profile.notificationPrefs.smsEnabled}
            onChange={(e) =>
              setProfile((p) => ({
                ...p,
                notificationPrefs: {
                  ...p.notificationPrefs,
                  smsEnabled: e.target.checked,
                },
              }))
            }
            className="accent-[#10B981] w-4 h-4 cursor-pointer"
          />
        </label>
      </div>
    </div>
  )
}

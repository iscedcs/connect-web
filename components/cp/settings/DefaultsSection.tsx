'use client'

import { Receipt, Calendar } from 'lucide-react'
import type { FullCompanyProfile } from './types'
import { BankNameSelect } from './BankNameSelect'

interface Props {
  profile: FullCompanyProfile
  setProfile: React.Dispatch<React.SetStateAction<FullCompanyProfile>>
}

export function DefaultsSection({ profile, setProfile }: Props) {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold text-white border-b border-[#222222] pb-3 flex items-center gap-2">
        <Receipt size={16} className="text-[#10B981]" />
        <span>Invoice & Bank Account Defaults</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">
            Invoice Due Period (Days)
          </label>
          <input
            type="number"
            value={profile.invoiceDefaults.dueDays}
            onChange={(e) =>
              setProfile((p) => ({
                ...p,
                invoiceDefaults: { ...p.invoiceDefaults, dueDays: parseInt(e.target.value) || 0 },
              }))
            }
            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#1F1F1F] border border-[#2B2B2B] text-white outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">
            Default Currency
          </label>
          <select
            value={profile.invoiceDefaults.currency}
            onChange={(e) =>
              setProfile((p) => ({
                ...p,
                invoiceDefaults: { ...p.invoiceDefaults, currency: e.target.value },
              }))
            }
            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#1F1F1F] border border-[#2B2B2B] text-white outline-none"
          >
            <option value="NGN">NGN (₦)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#1F1F1F] border border-[#2B2B2B] space-y-4">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
          Bank Account Details for Invoices
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <BankNameSelect
            value={profile.invoiceDefaults.bankDetails.bankName}
            onChange={(bankName) =>
              setProfile((p) => ({
                ...p,
                invoiceDefaults: {
                  ...p.invoiceDefaults,
                  bankDetails: { ...p.invoiceDefaults.bankDetails, bankName },
                },
              }))
            }
          />
          <div>
            <label className="block text-[11px] text-neutral-400 mb-1">Account Name</label>
            <input
              type="text"
              placeholder="e.g. Company Ltd"
              value={profile.invoiceDefaults.bankDetails.accountName}
              onChange={(e) =>
                setProfile((p) => ({
                  ...p,
                  invoiceDefaults: {
                    ...p.invoiceDefaults,
                    bankDetails: { ...p.invoiceDefaults.bankDetails, accountName: e.target.value },
                  },
                }))
              }
              className="w-full px-3 py-2 text-xs rounded-lg bg-[#141414] border border-[#333] text-white outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] text-neutral-400 mb-1">Account Number</label>
            <input
              type="text"
              placeholder="e.g. 0123456789"
              value={profile.invoiceDefaults.bankDetails.accountNumber}
              onChange={(e) =>
                setProfile((p) => ({
                  ...p,
                  invoiceDefaults: {
                    ...p.invoiceDefaults,
                    bankDetails: { ...p.invoiceDefaults.bankDetails, accountNumber: e.target.value },
                  },
                }))
              }
              className="w-full px-3 py-2 text-xs rounded-lg bg-[#141414] border border-[#333] text-white outline-none"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-neutral-300 mb-1">
          Invoice Footer Notes
        </label>
        <textarea
          rows={2}
          placeholder="Thank you for your business..."
          value={profile.invoiceDefaults.notes}
          onChange={(e) =>
            setProfile((p) => ({
              ...p,
              invoiceDefaults: { ...p.invoiceDefaults, notes: e.target.value },
            }))
          }
          className="w-full p-3.5 text-xs rounded-xl bg-[#1F1F1F] border border-[#2B2B2B] text-white outline-none"
        />
      </div>

      <h3 className="text-sm font-bold text-white border-b border-[#222222] pb-3 pt-4 flex items-center gap-2">
        <Calendar size={16} className="text-[#10B981]" />
        <span>Appointment & Booking Defaults</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">
            Slot Duration (Minutes)
          </label>
          <input
            type="number"
            value={profile.appointmentDefaults.duration}
            onChange={(e) =>
              setProfile((p) => ({
                ...p,
                appointmentDefaults: {
                  ...p.appointmentDefaults,
                  duration: parseInt(e.target.value) || 0,
                },
              }))
            }
            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#1F1F1F] border border-[#2B2B2B] text-white outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">
            Grace Period (Minutes)
          </label>
          <input
            type="number"
            value={profile.appointmentDefaults.gracePeriod}
            onChange={(e) =>
              setProfile((p) => ({
                ...p,
                appointmentDefaults: {
                  ...p.appointmentDefaults,
                  gracePeriod: parseInt(e.target.value) || 0,
                },
              }))
            }
            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#1F1F1F] border border-[#2B2B2B] text-white outline-none"
          />
        </div>
      </div>
    </div>
  )
}

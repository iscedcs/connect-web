'use client'

import { Palette } from 'lucide-react'
import type { FullCompanyProfile } from './types'

interface Props {
  profile: FullCompanyProfile
  setProfile: React.Dispatch<React.SetStateAction<FullCompanyProfile>>
}

export function BrandingSection({ profile, setProfile }: Props) {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold text-white border-b border-[#222222] pb-3 flex items-center gap-2">
        <Palette size={16} className="text-[#10B981]" />
        <span>Custom Branding Tokens</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">
            Primary Accent Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={profile.branding.primaryColor}
              onChange={(e) =>
                setProfile((p) => ({
                  ...p,
                  branding: { ...p.branding, primaryColor: e.target.value },
                }))
              }
              className="w-10 h-10 rounded-lg bg-transparent border-0 cursor-pointer"
            />
            <input
              type="text"
              value={profile.branding.primaryColor}
              onChange={(e) =>
                setProfile((p) => ({
                  ...p,
                  branding: { ...p.branding, primaryColor: e.target.value },
                }))
              }
              className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-[#1F1F1F] border border-[#2B2B2B] text-white outline-none uppercase font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">
            Secondary Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={profile.branding.secondaryColor}
              onChange={(e) =>
                setProfile((p) => ({
                  ...p,
                  branding: { ...p.branding, secondaryColor: e.target.value },
                }))
              }
              className="w-10 h-10 rounded-lg bg-transparent border-0 cursor-pointer"
            />
            <input
              type="text"
              value={profile.branding.secondaryColor}
              onChange={(e) =>
                setProfile((p) => ({
                  ...p,
                  branding: { ...p.branding, secondaryColor: e.target.value },
                }))
              }
              className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-[#1F1F1F] border border-[#2B2B2B] text-white outline-none uppercase font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">
            Brand Font Family
          </label>
          <select
            value={profile.branding.fontFamily}
            onChange={(e) =>
              setProfile((p) => ({
                ...p,
                branding: { ...p.branding, fontFamily: e.target.value },
              }))
            }
            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#1F1F1F] border border-[#2B2B2B] text-white outline-none"
          >
            <option value="Inter">Inter (System Default)</option>
            <option value="Roboto">Roboto</option>
            <option value="Outfit">Outfit</option>
            <option value="Poppins">Poppins</option>
          </select>
        </div>
      </div>
    </div>
  )
}

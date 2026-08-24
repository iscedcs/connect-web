'use client'

import { Building, MapPin } from 'lucide-react'
import type { FullCompanyProfile } from './types'
import { CompanyLogoUploader } from './CompanyLogoUploader'

interface Props {
  profile: FullCompanyProfile
  setProfile: React.Dispatch<React.SetStateAction<FullCompanyProfile>>
}

export function GeneralProfileSection({ profile, setProfile }: Props) {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold text-white border-b border-[#222222] pb-3 flex items-center gap-2">
        <Building size={16} className="text-[#10B981]" />
        <span>General Business Identity</span>
      </h3>

      {/* Logo Uploader Box */}
      <CompanyLogoUploader
        logoUrl={profile.logo}
        onChangeUrl={(url) => setProfile((p) => ({ ...p, logo: url }))}
        folderPrefix="connect-plus-company-logos"
      />

      <div>
        <label className="block text-xs font-semibold text-neutral-300 mb-1">
          Business Name *
        </label>
        <input
          type="text"
          required
          placeholder="e.g. Acme Corporation"
          value={profile.name}
          onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#1F1F1F] border border-[#2B2B2B] text-white outline-none focus:border-neutral-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">
            Contact Email *
          </label>
          <input
            type="email"
            required
            placeholder="billing@company.com"
            value={profile.contactEmail}
            onChange={(e) => setProfile((p) => ({ ...p, contactEmail: e.target.value }))}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#1F1F1F] border border-[#2B2B2B] text-white outline-none focus:border-neutral-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">
            Contact Phone Number
          </label>
          <input
            type="text"
            placeholder="+234 800 000 0000"
            value={profile.contactPhone}
            onChange={(e) => setProfile((p) => ({ ...p, contactPhone: e.target.value }))}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#1F1F1F] border border-[#2B2B2B] text-white outline-none focus:border-neutral-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-neutral-300 mb-1">
          Company Description / About Text
        </label>
        <textarea
          rows={3}
          placeholder="Brief description of your business..."
          value={profile.description}
          onChange={(e) => setProfile((p) => ({ ...p, description: e.target.value }))}
          className="w-full p-3.5 text-xs rounded-xl bg-[#1F1F1F] border border-[#2B2B2B] text-white outline-none focus:border-neutral-500"
        />
      </div>

      <h3 className="text-sm font-bold text-white border-b border-[#222222] pb-3 pt-4 flex items-center gap-2">
        <MapPin size={16} className="text-[#10B981]" />
        <span>Physical & Registered Address</span>
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">
            Street Address
          </label>
          <input
            type="text"
            placeholder="12 Marina Road"
            value={profile.address.street}
            onChange={(e) =>
              setProfile((p) => ({ ...p, address: { ...p.address, street: e.target.value } }))
            }
            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#1F1F1F] border border-[#2B2B2B] text-white outline-none focus:border-neutral-500"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">City</label>
            <input
              type="text"
              placeholder="Victoria Island"
              value={profile.address.city}
              onChange={(e) =>
                setProfile((p) => ({ ...p, address: { ...p.address, city: e.target.value } }))
              }
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#1F1F1F] border border-[#2B2B2B] text-white outline-none focus:border-neutral-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">State / Province</label>
            <input
              type="text"
              placeholder="Lagos"
              value={profile.address.state}
              onChange={(e) =>
                setProfile((p) => ({ ...p, address: { ...p.address, state: e.target.value } }))
              }
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#1F1F1F] border border-[#2B2B2B] text-white outline-none focus:border-neutral-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">ZIP / Postal Code</label>
            <input
              type="text"
              placeholder="101241"
              value={profile.address.zip}
              onChange={(e) =>
                setProfile((p) => ({ ...p, address: { ...p.address, zip: e.target.value } }))
              }
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#1F1F1F] border border-[#2B2B2B] text-white outline-none focus:border-neutral-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Country</label>
            <input
              type="text"
              placeholder="Nigeria"
              value={profile.address.country}
              onChange={(e) =>
                setProfile((p) => ({ ...p, address: { ...p.address, country: e.target.value } }))
              }
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#1F1F1F] border border-[#2B2B2B] text-white outline-none focus:border-neutral-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

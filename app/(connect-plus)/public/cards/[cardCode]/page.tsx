'use client'

import { useParams } from 'next/navigation'
import { Nfc, User, Bookmark, Calendar, DollarSign, Smartphone } from 'lucide-react'

export default function NfcTapLandingPage() {
  const params = useParams()
  const cardCode = params?.cardCode as string

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#141414] border border-[#222] rounded-3xl p-6 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center mx-auto animate-pulse">
          <Nfc size={32} />
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#10B981] font-bold">
            NFC Tap Connected • {cardCode}
          </span>
          <h2 className="text-xl font-bold text-white mt-1">ISCE Connect Card</h2>
          <p className="text-xs text-[#888] mt-1">
            Official smart card verified on ISCE Connect Ecosystem.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={() => alert('Contact vCard downloaded!')}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#10B981] text-white font-bold text-xs hover:bg-[#10B981]/90 shadow-md"
          >
            <Bookmark size={16} />
            <span>Save Contact Card</span>
          </button>

          <button
            onClick={() => alert('Opening appointment scheduler...')}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1A1A1A] text-[#AAA] font-semibold text-xs border border-[#333] hover:bg-[#252525]"
          >
            <Calendar size={16} />
            <span>Book Consultation</span>
          </button>
        </div>
      </div>
    </div>
  )
}

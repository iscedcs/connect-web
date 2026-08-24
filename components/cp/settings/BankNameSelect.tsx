'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, Building2, Check } from 'lucide-react'

const NIGERIAN_BANKS = [
  'Access Bank',
  'Guaranty Trust Bank (GTBank)',
  'Zenith Bank',
  'First Bank of Nigeria',
  'United Bank for Africa (UBA)',
  'Kuda Bank',
  'Moniepoint Microfinance Bank',
  'OPay Digital Services',
  'PalmPay',
  'Fidelity Bank',
  'First City Monument Bank (FCMB)',
  'Stanbic IBTC Bank',
  'Sterling Bank',
  'Wema Bank',
  'Union Bank of Nigeria',
  'Providus Bank',
  'Taj Bank',
  'Jaiz Bank',
  'Keystone Bank',
  'Polaris Bank',
  'Ecobank Nigeria',
  'Heritage Bank',
  'Globus Bank',
  'Lotus Bank',
  'Titan Trust Bank',
  'Parallex Bank',
  'Standard Chartered Bank',
  'Citibank Nigeria',
]

interface Props {
  value: string
  onChange: (bankName: string) => void
}

export function BankNameSelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredBanks = NIGERIAN_BANKS.filter((b) =>
    b.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-[11px] text-neutral-400 mb-1">
        Bank Name
      </label>

      {/* Input Field with Dropdown Arrow */}
      <div
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2 text-xs rounded-lg bg-[#141414] border border-[#333] text-white flex items-center justify-between cursor-pointer hover:border-neutral-500 transition-colors"
      >
        <span className={value ? 'text-white font-medium' : 'text-neutral-500'}>
          {value || 'Select bank...'}
        </span>
        <ChevronDown size={14} className="text-neutral-400 shrink-0" />
      </div>

      {/* Searchable Dropdown List */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl bg-[#191919] border border-[#2B2B2B] shadow-2xl overflow-hidden max-h-60 flex flex-col">
          {/* Search Box */}
          <div className="p-2 border-b border-[#2B2B2B] relative">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search bank..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-[#141414] text-white border border-[#333] outline-none focus:border-neutral-500"
            />
          </div>

          {/* List Items */}
          <div className="overflow-y-auto flex-1 divide-y divide-[#262626]">
            {filteredBanks.length === 0 ? (
              <div className="p-3 text-center text-xs text-neutral-500">No bank found</div>
            ) : (
              filteredBanks.map((bank) => {
                const isSelected = value === bank
                return (
                  <button
                    key={bank}
                    type="button"
                    onClick={() => {
                      onChange(bank)
                      setOpen(false)
                      setSearch('')
                    }}
                    className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#10B981]/15 text-[#10B981] font-bold'
                        : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 size={14} className={isSelected ? 'text-[#10B981]' : 'text-neutral-500'} />
                      <span>{bank}</span>
                    </div>
                    {isSelected && <Check size={14} className="text-[#10B981]" />}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

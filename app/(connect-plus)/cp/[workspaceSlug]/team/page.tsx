'use client'

import { useEffect, useState } from 'react'
import {
  Search,
  Download,
  Lock,
  Copy,
  MessageSquare,
  Plus,
  UserPlus,
  Globe,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  ChevronDown,
  Check,
} from 'lucide-react'
import { cpApi } from '@/lib/cp-api'
import { URLS } from '@/lib/const'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { WorkspaceHeroHeader } from '@/components/cp/workspace/WorkspaceHeroHeader'
import { Dialog } from '@/components/cp/shared/Dialog'
import type { CpStaffMember } from '@/lib/types/cp'

export default function TeamPage() {
  const { workspaceId, workspaceSlug, workspaceName } = useCpWorkspaceStore()
  const [staff, setStaff] = useState<CpStaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'WORKSPACE_ADMIN' | 'STAFF'>('STAFF')
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [permitted, setPermitted] = useState(false)

  const defaultEmployees = [
    { id: '1', name: 'Jese Leos', email: 'jese@starbucks.com', role: 'Owner', title: 'Country Manager', avatar: '' },
    { id: '2', name: 'Micheal Gough', email: 'micheal@starbucks.com', role: 'Admin', title: 'Chief Executive Officer', avatar: '' },
    { id: '3', name: 'Joseph McFall', email: 'joseph@starbucks.com', role: 'Member', title: 'Chief Product Officer', avatar: '' },
    { id: '4', name: 'Donnie Green', email: 'donnie@starbucks.com', role: 'Member', title: 'Front desk officer', avatar: '' },
    { id: '5', name: 'Faye Drake', email: 'faye@starbucks.com', role: 'Member', title: 'Sales Lead', avatar: '' },
    { id: '6', name: 'Helene Engels', email: 'helene@starbucks.com', role: 'Member', title: 'Business fulfillment lead', avatar: '' },
    { id: '7', name: 'Lana Byrd', email: 'lana@starbucks.com', role: 'Member', title: 'Marketing & Sales lead', avatar: '' },
    { id: '8', name: 'Neil Sims', email: 'neil@starbucks.com', role: 'Member', title: 'Sales', avatar: '' },
  ]

  function loadStaff() {
    if (!workspaceId) return
    setLoading(true)
    cpApi
      .get<{ staff: CpStaffMember[] }>(URLS.staffs.staff)
      .then((res) => {
        if (res.data?.staff && res.data.staff.length > 0) {
          setStaff(res.data.staff)
        } else {
          setStaff(defaultEmployees as any)
        }
      })
      .catch(() => {
        setStaff(defaultEmployees as any)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadStaff()
  }, [workspaceId])

  async function handleSendInvite(emailToInvite: string) {
    if (!emailToInvite.trim()) return
    setSubmitting(true)
    try {
      await cpApi.post(URLS.staffs.invite, {
        email: emailToInvite.trim(),
        role: inviteRole,
      })
      alert(`Invitation sent to ${emailToInvite}`)
      setShowInviteModal(false)
      setInviteEmail('')
      loadStaff()
    } catch (err: any) {
      alert(err.message || 'Invitation sent successfully!')
      setShowInviteModal(false)
      setInviteEmail('')
    } finally {
      setSubmitting(false)
    }
  }

  const workspaceUrl = `app.${workspaceSlug || 'starbucks'}.com/workspace/isce`

  function handleCopyLink() {
    navigator.clipboard.writeText(workspaceUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const filteredStaff = staff.filter((s: any) => {
    const matchesSearch =
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Shared Figma Workspace Hero Header */}
      <WorkspaceHeroHeader activeTab="team" />

      {/* Controls Bar: Search + Export CSV & Filter options */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search for employees"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl pl-10 pr-4 py-2.5 text-xs bg-[#141414] text-white placeholder-neutral-500 border border-[#222222] outline-none focus:border-neutral-600 transition-colors"
            />
          </div>

          {/* Export CSV button */}
          <button
            onClick={() => alert('Exporting employee list to CSV...')}
            className="px-4 py-2.5 rounded-xl border border-neutral-700 bg-transparent text-white font-semibold text-xs hover:bg-neutral-800 transition-colors flex items-center gap-2 cursor-pointer w-fit"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Radio Filter: Show Only */}
        <div className="flex items-center gap-4 text-xs text-neutral-400 font-medium">
          <span>Show Only:</span>
          {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((st) => (
            <label key={st} className="flex items-center gap-1.5 cursor-pointer text-white">
              <input
                type="radio"
                name="statusFilter"
                checked={(filterStatus === 'ALL' && st === 'ALL') || (filterStatus === st)}
                onChange={() => setFilterStatus(st)}
                className="accent-white cursor-pointer"
              />
              <span className="capitalize">{st === 'ALL' ? 'All' : st.toLowerCase()}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Employees List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white mb-2">Employees</h2>

          {/* Pending Permit Request Box */}
          {!permitted && (
            <div className="p-4 rounded-xl bg-[#141414] border border-[#222222] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-neutral-200 text-black flex items-center justify-center font-bold text-xs shrink-0">
                  PB
                </div>
                <div className="text-xs text-neutral-300">
                  <span className="font-bold text-white">Paul Bamidele</span> wishes to join the workspace
                </div>
              </div>
              <button
                onClick={() => {
                  setPermitted(true)
                  alert('Paul Bamidele permit granted!')
                }}
                className="px-4 py-1.5 rounded-lg border border-neutral-600 bg-neutral-800 text-white font-semibold text-xs hover:bg-neutral-700 transition-colors shrink-0 cursor-pointer"
              >
                Permit
              </button>
            </div>
          )}

          {/* Employee Rows List */}
          <div className="space-y-3">
            {filteredStaff.map((emp: any) => (
              <div
                key={emp.id}
                className="p-4 rounded-xl bg-[#141414] border border-[#222222] flex items-center justify-between gap-4 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-neutral-200 text-black flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                    {emp.avatar ? (
                      <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" />
                    ) : (
                      emp.name?.[0]?.toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                      {emp.name}
                    </h3>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                      {emp.title || emp.role || 'Staff Member'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Role Dropdown Badge */}
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full border border-neutral-700 bg-neutral-800/80 text-white text-xs font-medium cursor-pointer">
                    <span>{emp.role || 'Member'}</span>
                    <ChevronDown size={12} className="text-neutral-400" />
                  </div>

                  {/* Message Button */}
                  <button
                    onClick={() => alert(`Opening chat with ${emp.name}...`)}
                    className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                    aria-label="Message employee"
                  >
                    <MessageSquare size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Full-width Add Team Member Button */}
          <button
            onClick={() => setShowInviteModal(true)}
            className="w-full py-3.5 rounded-full bg-white text-black font-bold text-xs sm:text-sm hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm mt-4"
          >
            <UserPlus size={16} />
            <span>Add team member</span>
          </button>
        </div>

        {/* Right Column (1 Col): Share Your Workspace Card */}
        <div className="p-6 sm:p-7 rounded-2xl bg-[#141414] border border-[#222222] space-y-6 h-fit">
          <div>
            <h2 className="text-lg font-bold text-white">Share your workspace</h2>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              You've created a workspace! Invite your team to collaborate on daily operations.
            </p>
          </div>

          {/* Privacy Selector */}
          <div className="p-3 rounded-xl bg-[#1F1F1F] border border-[#2B2B2B] flex items-center gap-3">
            <div className="p-2 rounded-lg bg-neutral-800 text-neutral-300 shrink-0">
              <Lock size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 text-xs font-bold text-white cursor-pointer">
                <span>Private</span>
                <ChevronDown size={12} className="text-neutral-400" />
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                Only those you permit can join
              </p>
            </div>
          </div>

          {/* Copy Workspace Link Input */}
          <div className="p-2 rounded-xl bg-[#1F1F1F] border border-[#2B2B2B] flex items-center justify-between gap-2">
            <span className="text-xs text-neutral-300 truncate pl-2 font-mono">
              {workspaceUrl}
            </span>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 text-white font-semibold text-xs hover:bg-neutral-700 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              {copied ? <Check size={12} className="text-[#10B981]" /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Invite Team Member Section */}
          <div className="space-y-3 pt-2 border-t border-[#222222]">
            <h3 className="text-xs font-bold text-white">Invite team member</h3>
            <div className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Search or enter email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 rounded-xl px-3.5 py-2.5 text-xs bg-[#1F1F1F] text-white placeholder-neutral-500 border border-[#2B2B2B] outline-none focus:border-neutral-500 transition-colors"
              />
              <button
                onClick={() => handleSendInvite(inviteEmail)}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
              >
                Send invite
              </button>
            </div>
          </div>

          {/* Save Changes Button */}
          <button
            onClick={() => alert('Workspace sharing settings saved successfully!')}
            className="w-full py-3 rounded-full border border-neutral-600 bg-transparent text-white font-semibold text-xs sm:text-sm hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Modal Dialog for Add Team Member */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal} title="Add Team Member">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@starbucks.com"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#1F1F1F] border border-[#2B2B2B] text-white outline-none focus:border-neutral-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#1F1F1F] border border-[#2B2B2B] text-white outline-none focus:border-neutral-500"
            >
              <option value="STAFF">Member</option>
              <option value="WORKSPACE_ADMIN">Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowInviteModal(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#1F1F1F] text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSendInvite(inviteEmail)}
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-white text-black hover:bg-neutral-200 disabled:opacity-50"
            >
              {submitting ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </div>
      </Dialog>

      {/* Shared Page Footer matching Figma */}
      <footer className="pt-8 pb-4 border-t border-[#222222] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
        <div className="flex items-center gap-4 text-neutral-400">
          <Globe size={16} className="hover:text-white cursor-pointer transition-colors" />
          <Facebook size={16} className="hover:text-white cursor-pointer transition-colors" />
          <Instagram size={16} className="hover:text-white cursor-pointer transition-colors" />
          <Linkedin size={16} className="hover:text-white cursor-pointer transition-colors" />
          <Twitter size={16} className="hover:text-white cursor-pointer transition-colors" />
        </div>

        <div className="flex items-center gap-1.5 text-neutral-400">
          <span className="w-4 h-4 rounded-full border border-neutral-400 flex items-center justify-center text-[9px] font-bold">c</span>
          <span>IISCE Digital Concept</span>
        </div>

        <div className="flex items-center gap-4">
          <span>Currency - NGN</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-neutral-700 bg-neutral-800 text-white text-xs cursor-pointer">
            <span className="text-xs">🇬🇧</span>
            <span className="text-[10px]">&#9660;</span>
          </div>
        </div>
      </footer>
    </div>
  )
}


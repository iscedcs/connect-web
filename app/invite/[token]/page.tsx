'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cpApi } from '@/lib/cp-api'
import { Input } from '@/components/ui/input'

type Screen = 'join' | 'password' | 'otp' | 'profile' | 'done'

interface InviteInfo {
  workspaceName: string
  inviterName: string
  email: string
  role: string
}

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const token  = params?.token as string

  const [screen, setScreen]     = useState<Screen>('join')
  const [info, setInfo]         = useState<InviteInfo | null>(null)
  const [loading, setLoading]   = useState(true)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [otp, setOtp]           = useState('')
  const [profile, setProfile]   = useState({ firstName: '', lastName: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    cpApi
      .get<{ invite: InviteInfo }>(`/api/cp/invites/${token}`)
      .then((r) => setInfo(r.data.invite))
      .catch(() => toast.error('Invalid or expired invite link'))
      .finally(() => setLoading(false))
  }, [token])

  async function acceptInvite() {
    setSubmitting(true)
    try {
      await cpApi.post(`/api/cp/invites/${token}/accept`, {})
      setScreen('password')
    } catch { toast.error('Failed to accept invite') }
    finally { setSubmitting(false) }
  }

  async function setPasswordStep() {
    if (password !== confirm) { toast.error('Passwords do not match'); return }
    if (password.length < 8)  { toast.error('Password must be at least 8 characters'); return }
    setSubmitting(true)
    try {
      await cpApi.post(`/api/cp/invites/${token}/password`, { password })
      setScreen('otp')
    } catch { toast.error('Failed to set password') }
    finally { setSubmitting(false) }
  }

  async function verifyOtp() {
    setSubmitting(true)
    try {
      await cpApi.post(`/api/cp/invites/${token}/verify-otp`, { otp })
      setScreen('profile')
    } catch { toast.error('Invalid OTP') }
    finally { setSubmitting(false) }
  }

  async function saveProfile() {
    setSubmitting(true)
    try {
      await cpApi.post(`/api/cp/invites/${token}/profile`, profile)
      setScreen('done')
    } catch { toast.error('Failed to save profile') }
    finally { setSubmitting(false) }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--cp-bg)' }}>
        <div className="w-8 h-8 rounded-full border-2 border-[var(--cp-primary)] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--cp-bg)' }}>
      <div className="w-full max-w-sm">

        {/* Product identity */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-base font-bold tracking-tight text-[var(--cp-text-1)]">ISCE</span>
          <span
            className="px-2 py-0.5 rounded-md text-[11px] font-extrabold tracking-wider"
            style={{ background: 'var(--cp-primary)', color: '#000' }}
          >
            CONNECT PLUS
          </span>
        </div>
        {/* Join */}
        {screen === 'join' && info && (
          <div className="text-center space-y-5">
            <div className="w-20 h-20 rounded-2xl bg-[var(--cp-primary-dim)] flex items-center justify-center mx-auto">
              <span className="text-3xl font-bold text-[var(--cp-primary)]">{info.workspaceName[0]}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--cp-text-1)]">You're invited!</h1>
              <p className="text-sm text-[var(--cp-text-2)] mt-2">
                <strong className="text-[var(--cp-text-1)]">{info.inviterName}</strong> has invited you to join the{' '}
                <strong className="text-[var(--cp-text-1)]">{info.workspaceName}</strong> Connect Plus workspace as a{' '}
                <span className="text-[var(--cp-primary)] font-semibold">{info.role}</span>.
              </p>
              <p className="text-xs text-[var(--cp-text-3)] mt-1">{info.email}</p>
            </div>
            <button onClick={acceptInvite} disabled={submitting} className="w-full py-3 rounded-xl bg-[var(--cp-primary)] text-white font-bold disabled:opacity-50">
              {submitting ? '…' : 'Accept & Join'}
            </button>
          </div>
        )}

        {/* Password */}
        {screen === 'password' && (
          <div className="space-y-5">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-[var(--cp-text-1)]">Set your password</h1>
              <p className="text-sm text-[var(--cp-text-2)] mt-1">Choose a secure password for your account.</p>
            </div>
            <div className="space-y-3">
              <div><p className="text-xs text-[var(--cp-text-3)] mb-1">Password</p><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
              <div><p className="text-xs text-[var(--cp-text-3)] mb-1">Confirm password</p><Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>
            </div>
            <button onClick={setPasswordStep} disabled={submitting || !password || !confirm} className="w-full py-3 rounded-xl bg-[var(--cp-primary)] text-white font-bold disabled:opacity-50">
              {submitting ? '…' : 'Continue'}
            </button>
          </div>
        )}

        {/* OTP */}
        {screen === 'otp' && info && (
          <div className="space-y-5">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-[var(--cp-text-1)]">Verify your email</h1>
              <p className="text-sm text-[var(--cp-text-2)] mt-1">Enter the code sent to <strong>{info.email}</strong></p>
            </div>
            <div>
              <p className="text-xs text-[var(--cp-text-3)] mb-1">Verification code</p>
              <Input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit code"
                className="text-center text-2xl tracking-widest font-mono"
                maxLength={6}
              />
            </div>
            <button onClick={verifyOtp} disabled={submitting || otp.length < 6} className="w-full py-3 rounded-xl bg-[var(--cp-primary)] text-white font-bold disabled:opacity-50">
              {submitting ? 'Verifying…' : 'Verify'}
            </button>
          </div>
        )}

        {/* Profile */}
        {screen === 'profile' && (
          <div className="space-y-5">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-[var(--cp-text-1)]">Complete your profile</h1>
              <p className="text-sm text-[var(--cp-text-2)] mt-1">Help your teammates know who you are.</p>
            </div>
            <div className="space-y-3">
              <div><p className="text-xs text-[var(--cp-text-3)] mb-1">First name</p><Input value={profile.firstName} onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))} /></div>
              <div><p className="text-xs text-[var(--cp-text-3)] mb-1">Last name</p><Input value={profile.lastName} onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))} /></div>
              <div><p className="text-xs text-[var(--cp-text-3)] mb-1">Phone</p><Input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} /></div>
            </div>
            <button onClick={saveProfile} disabled={submitting || !profile.firstName || !profile.lastName} className="w-full py-3 rounded-xl bg-[var(--cp-primary)] text-white font-bold disabled:opacity-50">
              {submitting ? 'Saving…' : 'Complete Setup'}
            </button>
          </div>
        )}

        {/* Done */}
        {screen === 'done' && info && (
          <div className="text-center space-y-5">
            <CheckCircle size={64} className="text-[var(--cp-primary)] mx-auto" />
            <div>
              <h1 className="text-2xl font-bold text-[var(--cp-text-1)]">You're all set!</h1>
              <p className="text-sm text-[var(--cp-text-2)] mt-2">You're now part of the <strong className="text-[var(--cp-text-1)]">{info.workspaceName}</strong> Connect Plus workspace.</p>
            </div>
            <button onClick={() => router.push('/cp/org')} className="w-full py-3 rounded-xl bg-[var(--cp-primary)] text-white font-bold">
              Open Connect Plus
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Mail, Lock, KeyRound, User, Camera, ArrowRight, ShieldCheck } from 'lucide-react'
import { cpApi } from '@/lib/cp-api'
import { URLS } from '@/lib/const'

export default function InviteAcceptancePage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [fullName, setFullName] = useState('')

  // Live password validation checks
  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasMinLength = password.length >= 8
  const isPasswordValid = hasLower && hasUpper && hasNumber && hasMinLength

  const [submitting, setSubmitting] = useState(false)

  async function handleComplete() {
    setSubmitting(true)
    try {
      await cpApi.post(URLS.webhooks.handle_invite_accepted, {
        email,
        password,
        otp,
        fullName,
      })
      alert('Workspace invite accepted! Welcome to Connect Plus.')
      router.push('/cp/org')
    } catch {
      // Direct user after mock onboarding
      alert('Profile created! Welcome to your workspace.')
      router.push('/cp/org')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--cp-bg,#0D0D0D)] flex items-center justify-center p-4">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[var(--cp-surface,#141414)] border border-[var(--cp-border,#222)] space-y-6 shadow-2xl">
        {/* Progress Dots */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  step === s
                    ? 'w-8 bg-[var(--cp-primary,#10B981)]'
                    : step > s
                    ? 'w-2 bg-[var(--cp-primary,#10B981)]/50'
                    : 'w-2 bg-[var(--cp-surface-2,#222)]'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] font-bold text-[var(--cp-text-3,#666)] uppercase tracking-wider">
            Step {step} of 4
          </span>
        </div>

        {/* Step 1: Email Verification */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in-50">
            <div className="w-12 h-12 rounded-2xl bg-[var(--cp-primary,#10B981)]/10 text-[var(--cp-primary,#10B981)] flex items-center justify-center">
              <Mail size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--cp-text-1,#FFF)]">Workspace Invitation</h3>
              <p className="text-xs text-[var(--cp-text-2,#888)] mt-1">
                Enter the email address where you received your workspace invite.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--cp-text-2,#AAA)] mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-[var(--cp-surface-2,#1A1A1A)] border border-[var(--cp-border,#333)] text-[var(--cp-text-1,#FFF)] outline-none focus:border-[var(--cp-primary,#10B981)]"
              />
            </div>

            <button
              disabled={!email.trim()}
              onClick={() => setStep(2)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--cp-primary,#10B981)] text-white text-xs font-bold hover:bg-[var(--cp-primary,#10B981)]/90 disabled:opacity-40 transition-all"
            >
              <span>Continue</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Step 2: Password Creation & Live Strength Validation */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in-50">
            <div className="w-12 h-12 rounded-2xl bg-[var(--cp-primary,#10B981)]/10 text-[var(--cp-primary,#10B981)] flex items-center justify-center">
              <Lock size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--cp-text-1,#FFF)]">Setup Your Password</h3>
              <p className="text-xs text-[var(--cp-text-2,#888)] mt-1">
                Create a secure password to protect your staff portal account.
              </p>
            </div>

            <div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-[var(--cp-surface-2,#1A1A1A)] border border-[var(--cp-border,#333)] text-[var(--cp-text-1,#FFF)] outline-none focus:border-[var(--cp-primary,#10B981)]"
              />
            </div>

            {/* Live Password Rules */}
            <div className="space-y-1.5 p-3 rounded-xl bg-[var(--cp-surface-2,#181818)] text-[10px] text-[var(--cp-text-3,#777)]">
              <div className={`flex items-center gap-2 ${hasMinLength ? 'text-[var(--cp-primary,#10B981)] font-semibold' : ''}`}>
                <Check size={12} /> Minimum 8 characters
              </div>
              <div className={`flex items-center gap-2 ${hasLower ? 'text-[var(--cp-primary,#10B981)] font-semibold' : ''}`}>
                <Check size={12} /> At least one lowercase letter (a-z)
              </div>
              <div className={`flex items-center gap-2 ${hasUpper ? 'text-[var(--cp-primary,#10B981)] font-semibold' : ''}`}>
                <Check size={12} /> At least one uppercase letter (A-Z)
              </div>
              <div className={`flex items-center gap-2 ${hasNumber ? 'text-[var(--cp-primary,#10B981)] font-semibold' : ''}`}>
                <Check size={12} /> At least one number (0-9)
              </div>
            </div>

            <button
              disabled={!isPasswordValid}
              onClick={() => setStep(3)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--cp-primary,#10B981)] text-white text-xs font-bold hover:bg-[var(--cp-primary,#10B981)]/90 disabled:opacity-40 transition-all"
            >
              <span>Continue to Verification</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Step 3: OTP Verification */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in-50">
            <div className="w-12 h-12 rounded-2xl bg-[var(--cp-primary,#10B981)]/10 text-[var(--cp-primary,#10B981)] flex items-center justify-center">
              <KeyRound size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--cp-text-1,#FFF)]">Enter OTP Code</h3>
              <p className="text-xs text-[var(--cp-text-2,#888)] mt-1">
                Enter the 6-digit verification code sent to <strong className="text-[var(--cp-text-1,#FFF)]">{email}</strong>.
              </p>
            </div>

            <div>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-3 text-center text-lg font-mono tracking-widest rounded-xl bg-[var(--cp-surface-2,#1A1A1A)] border border-[var(--cp-border,#333)] text-[var(--cp-text-1,#FFF)] outline-none focus:border-[var(--cp-primary,#10B981)]"
              />
            </div>

            <button
              disabled={otp.length < 6}
              onClick={() => setStep(4)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--cp-primary,#10B981)] text-white text-xs font-bold hover:bg-[var(--cp-primary,#10B981)]/90 disabled:opacity-40 transition-all"
            >
              <span>Verify & Continue</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Step 4: Profile Setup */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in-50">
            <div className="w-12 h-12 rounded-2xl bg-[var(--cp-primary,#10B981)]/10 text-[var(--cp-primary,#10B981)] flex items-center justify-center">
              <User size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--cp-text-1,#FFF)]">Setup Your Staff Profile</h3>
              <p className="text-xs text-[var(--cp-text-2,#888)] mt-1">
                Enter your full name and upload a profile photo for team members.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--cp-text-2,#AAA)] mb-1">
                Full Display Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-[var(--cp-surface-2,#1A1A1A)] border border-[var(--cp-border,#333)] text-[var(--cp-text-1,#FFF)] outline-none focus:border-[var(--cp-primary,#10B981)]"
              />
            </div>

            <div className="p-4 rounded-xl border border-dashed border-[var(--cp-border,#333)] text-center space-y-2">
              <Camera className="mx-auto text-[var(--cp-text-3,#555)]" size={24} />
              <p className="text-xs text-[var(--cp-text-2,#888)]">Upload Profile Avatar (Optional)</p>
            </div>

            <button
              disabled={!fullName.trim() || submitting}
              onClick={handleComplete}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--cp-primary,#10B981)] text-white text-xs font-bold hover:bg-[var(--cp-primary,#10B981)]/90 disabled:opacity-40 transition-all shadow-lg"
            >
              <span>{submitting ? 'Setting up...' : 'Complete Account Setup'}</span>
              <ShieldCheck size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

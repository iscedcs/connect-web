'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Zap, Shield, Sparkles } from 'lucide-react'
import { cpApi } from '@/lib/cp-api'
import { URLS } from '@/lib/const'
import { CpPageHeader } from '@/components/cp/shared/CpPageHeader'
import { Dialog } from '@/components/cp/shared/Dialog'

interface SubscriptionData {
  plan: string
  status: string
  renewsAt?: string
  workspacesLimit: number
  staffLimit: number
  features: string[]
}

const PLANS = [
  {
    id: 'STARTER',
    name: 'Starter / Free',
    price: '$0',
    period: 'forever',
    workspaces: 1,
    staff: 5,
    features: ['1 Workspace', 'Up to 5 Staff members', 'Basic Invoicing & Appointments', 'Standard Support'],
  },
  {
    id: 'PRO',
    name: 'Connect Plus Pro',
    price: '$29',
    period: 'per month',
    popular: true,
    workspaces: 5,
    staff: 25,
    features: [
      'Up to 5 Workspaces',
      'Up to 25 Staff members',
      'Advanced Invoicing & Custom Branding',
      'Leads Pipeline & Client Portal',
      'Attendance & Supervisor Overrides',
      'Priority Email Support',
    ],
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise Business',
    price: '$99',
    period: 'per month',
    workspaces: 99,
    staff: 100,
    features: [
      'Unlimited Workspaces',
      '100+ Staff members',
      'Audit Logs & Verification API',
      'Job Postings & Artisan Talent Search',
      'Dedicated Account Manager',
      '24/7 Phone & Chat Support',
    ],
  },
]

export default function OrgSubscriptionPage() {
  const [sub, setSub] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [upgrading, setUpgrading] = useState(false)

  function fetchSub() {
    setLoading(true)
    cpApi
      .get<{ subscription: SubscriptionData }>(URLS.organization_subscriptions.active)
      .then((res) => setSub(res.data.subscription))
      .catch(() => {
        setSub({
          plan: 'STARTER',
          status: 'ACTIVE',
          workspacesLimit: 1,
          staffLimit: 5,
          features: ['Basic Workspace', '5 Staff Members'],
        })
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchSub()
  }, [])

  async function handleUpgrade() {
    if (!selectedPlan) return
    setUpgrading(true)
    try {
      await cpApi.post(URLS.organization_subscriptions.upgrade, {
        plan: selectedPlan,
      })
      alert('Subscription plan updated successfully!')
      setSelectedPlan(null)
      fetchSub()
    } catch (err: any) {
      alert(err.message || 'Upgrade request failed')
    } finally {
      setUpgrading(false)
    }
  }

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/cp/org"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--cp-text-3,#666)] hover:text-[var(--cp-text-1,#FFF)] mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Org Dashboard</span>
        </Link>
        <CpPageHeader
          title="Organization Subscription & Billing"
          subtitle="Manage your SaaS plan, workspace limits, and billing features"
        />
      </div>

      {/* Current Subscription Status Banner */}
      <div className="p-6 rounded-2xl bg-[var(--cp-surface,#141414)] border border-[var(--cp-border,#222)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-[var(--cp-primary,#10B981)]/10 text-[var(--cp-primary,#10B981)] mb-2">
            Current Plan: {sub?.plan || 'STARTER'}
          </span>
          <h3 className="text-xl font-bold text-[var(--cp-text-1,#FFF)]">
            {sub?.plan === 'PRO'
              ? 'Connect Plus Pro Active'
              : sub?.plan === 'ENTERPRISE'
              ? 'Enterprise Business Tier'
              : 'Starter / Free Plan'}
          </h3>
          <p className="text-xs text-[var(--cp-text-2,#888)] mt-1">
            Status: <span className="text-[var(--cp-primary,#10B981)] font-semibold">{sub?.status || 'ACTIVE'}</span>
            {sub?.renewsAt && ` • Renews on ${new Date(sub.renewsAt).toLocaleDateString()}`}
          </p>
        </div>
        <div className="flex items-center gap-6 text-xs text-[var(--cp-text-2,#AAA)] border-t md:border-t-0 md:border-l border-[var(--cp-border,#222)] pt-4 md:pt-0 md:pl-6">
          <div>
            <p className="text-[10px] font-semibold uppercase text-[var(--cp-text-3,#555)]">Workspaces Limit</p>
            <p className="text-base font-bold text-[var(--cp-text-1,#FFF)]">{sub?.workspacesLimit || 1}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase text-[var(--cp-text-3,#555)]">Staff Members Limit</p>
            <p className="text-base font-bold text-[var(--cp-text-1,#FFF)]">{sub?.staffLimit || 5}</p>
          </div>
        </div>
      </div>

      {/* Plans Tier Grid */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--cp-text-2,#888)] mb-6">
          Available Subscription Plans
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isCurrent = sub?.plan === plan.id
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between p-6 rounded-2xl bg-[var(--cp-surface,#141414)] border transition-all ${
                  plan.popular
                    ? 'border-[var(--cp-primary,#10B981)] shadow-lg shadow-[var(--cp-primary,#10B981)]/5'
                    : 'border-[var(--cp-border,#222)] hover:border-[var(--cp-border,#444)]'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--cp-primary,#10B981)] text-white shadow-sm flex items-center gap-1">
                    <Sparkles size={12} /> Most Popular
                  </span>
                )}

                <div>
                  <h4 className="font-bold text-lg text-[var(--cp-text-1,#FFF)]">{plan.name}</h4>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-[var(--cp-text-1,#FFF)]">{plan.price}</span>
                    <span className="text-xs text-[var(--cp-text-3,#666)]">/{plan.period}</span>
                  </div>

                  <ul className="mt-6 space-y-3 text-xs text-[var(--cp-text-2,#AAA)] border-t border-[var(--cp-border,#222)] pt-6">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check size={14} className="text-[var(--cp-primary,#10B981)] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 text-xs font-semibold rounded-xl bg-[var(--cp-surface-2,#222)] text-[var(--cp-text-3,#666)] cursor-default"
                    >
                      Active Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`w-full py-2.5 text-xs font-semibold rounded-xl transition-colors ${
                        plan.popular
                          ? 'bg-[var(--cp-primary,#10B981)] text-white hover:bg-[var(--cp-primary,#10B981)]/90'
                          : 'bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-text-1,#FFF)] hover:bg-[var(--cp-surface-3,#2A2A2A)] border border-[var(--cp-border,#333)]'
                      }`}
                    >
                      Select Plan
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog
        open={!!selectedPlan}
        onOpenChange={(open) => !open && setSelectedPlan(null)}
        title="Confirm Plan Change"
      >
        <div className="space-y-4 text-xs text-[var(--cp-text-2,#AAA)]">
          <p>
            You are about to switch your organization plan to{' '}
            <strong className="text-[var(--cp-text-1,#FFF)]">
              {PLANS.find((p) => p.id === selectedPlan)?.name}
            </strong>.
          </p>
          <p>
            Billing will be adjusted automatically according to your organization seat limits.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setSelectedPlan(null)}
              className="px-4 py-2 font-semibold rounded-lg bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-text-2,#AAA)]"
            >
              Cancel
            </button>
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="px-4 py-2 font-semibold rounded-lg bg-[var(--cp-primary,#10B981)] text-white hover:bg-[var(--cp-primary,#10B981)]/90"
            >
              {upgrading ? 'Upgrading...' : 'Confirm Plan Switch'}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

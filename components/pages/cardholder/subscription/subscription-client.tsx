"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  Minus,
  Crown,
  Sparkles,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";
import { csrfFetch } from "@/lib/csrf-client";
import {
  formatLimit,
  formatPrice,
  formatStorage,
  isUnlimited,
  planRank,
  type MySubscription,
  type Plan,
  type PlanKey,
  type PlanLimits,
  type SubscriptionStatus,
} from "@/lib/types/subscription";

interface Props {
  subscription: MySubscription | null;
  plans: Plan[];
  /** Effective limits right now — may be FREE even on a paid plan if lapsed. */
  limits: PlanLimits | null;
}

const STATUS_STYLES: Record<SubscriptionStatus, string> = {
  TRIALING: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  ACTIVE: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  PAST_DUE: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  CANCELLED: "bg-white/10 text-white/60 border-white/15",
  EXPIRED: "bg-red-500/15 text-red-400 border-red-500/30",
};

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  TRIALING: "Trial",
  ACTIVE: "Active",
  PAST_DUE: "Payment due",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** The handful of limits worth showing on a plan card, in display order. */
function headlineFeatures(
  limits: PlanLimits,
): { label: string; on: boolean }[] {
  return [
    {
      label: `${formatLimit(limits.profiles)} profile${limits.profiles === 1 ? "" : "s"}`,
      on: true,
    },
    {
      label: `${formatLimit(limits.socialLinks)} social links`,
      on: limits.socialLinks !== 0,
    },
    { label: `${formatLimit(limits.videos)} videos`, on: limits.videos !== 0 },
    {
      label: `${formatLimit(limits.files)} files · ${formatStorage(limits.storageBytes)}`,
      on: limits.files !== 0,
    },
    {
      label: `${formatLimit(limits.customForms)} custom forms`,
      on: limits.customForms !== 0,
    },
    {
      label: isUnlimited(limits.analyticsHistoryDays)
        ? "Full analytics history"
        : `${limits.analyticsHistoryDays}-day analytics history`,
      on: true,
    },
    { label: "Export contacts", on: limits.contactExport },
    { label: "Remove ISCE branding", on: limits.removeIsceBranding },
    { label: "Reorder profile modules", on: limits.moduleReordering },
    {
      label: "Listed in artisan directory",
      on: limits.artisanDirectoryEligible,
    },
    { label: "Verified badge", on: limits.verifiedBadge },
    { label: "Priority support", on: limits.prioritySupport },
  ];
}

export default function SubscriptionClient({
  subscription,
  plans,
  limits,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyPlan, setBusyPlan] = useState<PlanKey | null>(null);
  const [notice, setNotice] = useState<{
    kind: "ok" | "err" | "info";
    text: string;
  } | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const searchParams = useSearchParams();

  // Coming back from the gateway. Paystack appends ?reference=&trxref=;
  // the webhook is what actually activates the plan, so this only
  // acknowledges the return and re-reads the subscription rather than
  // claiming success the backend has not confirmed.
  useEffect(() => {
    const reference =
      searchParams.get("reference") || searchParams.get("trxref");
    if (!reference) return;

    setNotice({
      kind: "info",
      text: "Payment received. Your plan updates as soon as the payment is confirmed this can take a few moments.",
    });
    startTransition(() => router.refresh());

    // Drop the gateway's params so a later refresh does not replay this.
    const url = new URL(window.location.href);
    url.searchParams.delete("reference");
    url.searchParams.delete("trxref");
    window.history.replaceState({}, "", url.toString());
    // Runs once for the reference the page loaded with.
  }, [searchParams, router]);

  const currentKey = subscription?.plan.key ?? null;
  const currentRank = currentKey ? planRank(currentKey) : -1;
  const hasSubscription = Boolean(subscription);
  const isLapsed =
    subscription != null &&
    ["EXPIRED", "CANCELLED", "PAST_DUE"].includes(subscription.status);

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function post(path: string, body?: unknown) {
    const res = await csrfFetch(path, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    return (await res.json().catch(() => ({
      success: false,
      message: "Unexpected response",
    }))) as {
      success: boolean;
      message: string;
      checkoutUrl?: string;
      reference?: string;
    };
  }

  async function handleChoose(plan: Plan) {
    setNotice(null);
    setBusyPlan(plan.key);
    try {
      // Moving to Free from a paid plan is a cancellation, not a
      // purchase — the gateway rejects a zero-amount checkout outright.
      if (hasSubscription && plan.priceMonthly === 0) {
        setNotice({
          kind: "info",
          text: "To move to Free, cancel your current plan above. You keep your paid features until the end of the period.",
        });
        return;
      }

      // No subscription yet → select-plan (paid plans open a 3-month
      // trial). Already subscribed → the change has to go through
      // checkout, since select-plan rejects a second subscription.
      const result = hasSubscription
        ? await post("/api/subscriptions/initiate-payment", {
            planKey: plan.key,
          })
        : await post("/api/subscriptions/select-plan", { planKey: plan.key });

      if (result.checkoutUrl) {
        // Leaving the app for the gateway; its callback lands back
        // here with a reference on the query string.
        window.location.href = result.checkoutUrl;
        return;
      }

      setNotice({
        kind: result.success ? "ok" : "info",
        text: result.message,
      });
      if (result.success) refresh();
    } catch {
      setNotice({
        kind: "err",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setBusyPlan(null);
    }
  }

  async function handleCancel() {
    setNotice(null);
    setBusyPlan(currentKey);
    try {
      const result = await post("/api/subscriptions/cancel");
      setNotice({ kind: result.success ? "ok" : "err", text: result.message });
      if (result.success) {
        setConfirmCancel(false);
        refresh();
      }
    } catch {
      setNotice({ kind: "err", text: "Could not cancel. Please try again." });
    } finally {
      setBusyPlan(null);
    }
  }

  const canCancel =
    subscription != null &&
    subscription.plan.key !== "FREE" &&
    ["ACTIVE", "TRIALING", "PAST_DUE"].includes(subscription.status);

  return (
    <div className="max-w-md lg:max-w-4xl mx-auto p-4 space-y-6">
      {/* ── Current plan ───────────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2 px-1">
          Your plan
        </h2>

        {subscription ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {subscription.plan.key === "PRO_PLUS" ? (
                    <Crown className="h-4 w-4 text-amber-400 shrink-0" />
                  ) : subscription.plan.key === "PRO_LITE" ? (
                    <Sparkles className="h-4 w-4 text-sky-400 shrink-0" />
                  ) : null}
                  <p className="text-base font-semibold truncate">
                    {subscription.plan.name}
                  </p>
                </div>
                <p className="text-xs text-white/40 mt-0.5">
                  {subscription.plan.priceMonthly === 0
                    ? "No charge"
                    : `${formatPrice(subscription.plan.priceMonthly)} / month`}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                  STATUS_STYLES[subscription.status]
                }`}>
                {STATUS_LABELS[subscription.status]}
              </span>
            </div>

            {subscription.isInTrial && subscription.daysRemaining !== null && (
              <div className="rounded-lg bg-sky-500/10 border border-sky-500/20 px-3 py-2">
                <p className="text-xs text-sky-300">
                  {subscription.daysRemaining === 0
                    ? "Your trial ends today."
                    : `${subscription.daysRemaining} day${
                        subscription.daysRemaining === 1 ? "" : "s"
                      } left in your trial.`}
                  {formatDate(subscription.trialEndDate) && (
                    <span className="text-sky-300/60">
                      {" "}
                      Ends {formatDate(subscription.trialEndDate)}.
                    </span>
                  )}
                </p>
              </div>
            )}

            {!subscription.isInTrial && subscription.currentPeriodEnd && (
              <p className="text-xs text-white/40">
                {subscription.status === "CANCELLED"
                  ? `Access ends ${formatDate(subscription.currentPeriodEnd)}`
                  : `Renews ${formatDate(subscription.currentPeriodEnd)}`}
              </p>
            )}

            {isLapsed && (
              <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2">
                <AlertCircle className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-300">
                  You&apos;re currently on Free limits. Pick a plan below to
                  restore your full features.
                </p>
              </div>
            )}

            {canCancel &&
              (confirmCancel ? (
                <div className="rounded-lg border border-red-500/20 bg-red-500/[0.07] p-3 space-y-2.5">
                  <p className="text-xs text-white/70">
                    Cancel your subscription? You keep access until the end of
                    the current period, then drop to Free limits.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      disabled={busyPlan !== null}
                      className="flex-1 rounded-lg bg-red-500/90 hover:bg-red-500 disabled:opacity-50 px-3 py-2 text-xs font-semibold transition">
                      {busyPlan !== null ? "Cancelling…" : "Yes, cancel"}
                    </button>
                    <button
                      onClick={() => setConfirmCancel(false)}
                      disabled={busyPlan !== null}
                      className="flex-1 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50 px-3 py-2 text-xs font-medium transition">
                      Keep my plan
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmCancel(true)}
                  className="text-xs text-white/40 hover:text-red-400 transition underline underline-offset-2">
                  Cancel subscription
                </button>
              ))}
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-sm font-medium">No plan selected yet</p>
            <p className="text-xs text-white/40 mt-1">
              Choose a plan below to get started. Paid plans open with a 3-month
              trial — no charge today.
            </p>
          </div>
        )}
      </section>

      {/* ── Notice ─────────────────────────────────────────────── */}
      {notice && (
        <div
          role="status"
          className={`flex items-start gap-2 rounded-xl border px-3.5 py-3 ${
            notice.kind === "ok"
              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
              : notice.kind === "err"
                ? "border-red-500/25 bg-red-500/10 text-red-300"
                : "border-white/10 bg-white/[0.04] text-white/70"
          }`}>
          {notice.kind === "ok" ? (
            <Check className="h-4 w-4 mt-0.5 shrink-0" />
          ) : notice.kind === "err" ? (
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          ) : (
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
          )}
          <p className="text-xs leading-relaxed">{notice.text}</p>
        </div>
      )}

      {/* ── Plans ──────────────────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2 px-1">
          {hasSubscription ? "Change plan" : "Choose a plan"}
        </h2>

        {plans.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-sm text-white/60">
              Plans are unavailable right now. Please try again shortly.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = plan.key === currentKey;
              const rank = planRank(plan.key);
              const isDowngrade = currentRank > -1 && rank < currentRank;
              const busy = busyPlan === plan.key;
              const features = headlineFeatures(plan.limits);

              return (
                <div
                  key={plan.id}
                  className={`rounded-xl border p-4 flex flex-col gap-3 transition ${
                    isCurrent
                      ? "border-emerald-500/40 bg-emerald-500/[0.06]"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20"
                  }`}>
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{plan.name}</p>
                      {isCurrent && (
                        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          CURRENT
                        </span>
                      )}
                    </div>
                    <p className="mt-1">
                      <span className="text-2xl font-bold tracking-tight">
                        {formatPrice(plan.priceMonthly)}
                      </span>
                      {plan.priceMonthly > 0 && (
                        <span className="text-xs text-white/40"> /month</span>
                      )}
                    </p>
                  </div>

                  <ul className="space-y-1.5 flex-1">
                    {features.map((f) => (
                      <li
                        key={f.label}
                        className={`flex items-start gap-2 text-xs ${
                          f.on ? "text-white/70" : "text-white/25"
                        }`}>
                        {f.on ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400/80 mt-0.5 shrink-0" />
                        ) : (
                          <Minus className="h-3.5 w-3.5 text-white/20 mt-0.5 shrink-0" />
                        )}
                        <span>{f.label}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleChoose(plan)}
                    disabled={isCurrent || busy || pending}
                    className={`w-full rounded-lg px-3 py-2.5 text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                      isCurrent
                        ? "bg-white/5 text-white/30 cursor-default"
                        : "bg-white text-black hover:bg-white/90 disabled:opacity-50"
                    }`}>
                    {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {isCurrent
                      ? "Your current plan"
                      : busy
                        ? "Working…"
                        : !hasSubscription
                          ? plan.priceMonthly === 0
                            ? "Start on Free"
                            : "Start 3-month trial"
                          : isDowngrade
                            ? `Switch to ${plan.name}`
                            : `Upgrade to ${plan.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Effective limits note ──────────────────────────────── */}
      {limits && currentKey && (
        <p className="text-[11px] text-white/30 px-1 leading-relaxed">
          Limits shown on each card are what that plan grants. Your account is
          currently enforcing{" "}
          <span className="text-white/50">
            {formatLimit(limits.profiles)} profile
            {limits.profiles === 1 ? "" : "s"}
          </span>{" "}
          and{" "}
          <span className="text-white/50">
            {formatLimit(limits.socialLinks)} social links
          </span>
          .
        </p>
      )}
    </div>
  );
}

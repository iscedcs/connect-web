"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  Minus,
  Crown,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";
import { csrfFetch } from "@/lib/csrf-client";
import {
  accessEndsAt,
  formatLimit,
  formatPrice,
  formatStorage,
  hasPlanAccess,
  isNone,
  isUnlimited,
  planRank,
  type CheckoutQuote,
  type MySubscription,
  type Plan,
  type PlanKey,
  type PlanLimits,
  type SubscriptionStatus,
} from "@/lib/types/subscription";
import { BellIcon } from "@/lib/icons";

/**
 * What the page waits to see after sending the user to Paystack. Kept in
 * sessionStorage because the browser leaves the app for the checkout and
 * comes back to a fresh page load.
 */
interface PendingCheckout {
  plan: PlanKey;
  /** The plan before paying: an upgrade has landed once the plan changes. */
  previousPlan: PlanKey;
  /**
   * currentPeriodEnd before paying. A renewal keeps the same plan, so the
   * period end moving is the only sign that its payment has landed. (A
   * prorated upgrade is the opposite: the plan changes, the date doesn't.)
   */
  previousPeriodEnd: string | null;
  startedAt: number;
}

const PENDING_KEY = "connect.subscription.pendingCheckout";
const PENDING_MAX_AGE_MS = 2 * 60 * 60 * 1000;
/**
 * The plan switches on when Paystack's webhook reaches connect-nest through
 * wallet-nest, typically 5–15 s after paying; 60 s leaves room for a slow one.
 */
const CONFIRM_POLL_MS = 3000;
const CONFIRM_TIMEOUT_MS = 60_000;

function readPending(): PendingCheckout | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const pending = JSON.parse(raw) as PendingCheckout;
    if (
      !pending?.plan ||
      !pending.previousPlan ||
      Date.now() - pending.startedAt > PENDING_MAX_AGE_MS
    ) {
      return null;
    }
    return pending;
  } catch {
    return null;
  }
}

function writePending(pending: PendingCheckout): void {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  } catch {
    // Storage blocked: the return leg falls back to a plain refresh.
  }
}

function clearPending(): void {
  try {
    sessionStorage.removeItem(PENDING_KEY);
  } catch {
    // no-op
  }
}

function isConfirmed(
  sub: MySubscription | null,
  pending: PendingCheckout,
): sub is MySubscription {
  return (
    !!sub &&
    sub.plan.key === pending.plan &&
    sub.status === "ACTIVE" &&
    (pending.previousPlan !== pending.plan ||
      sub.currentPeriodEnd !== pending.previousPeriodEnd)
  );
}

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
      on: !isNone(limits.socialLinks),
    },
    {
      label: `${formatLimit(limits.videos)} videos`,
      on: !isNone(limits.videos),
    },
    {
      label: `${formatLimit(limits.files)} files · ${formatStorage(limits.storageBytes)}`,
      on: !isNone(limits.files),
    },
    {
      label: `${formatLimit(limits.customForms)} custom forms`,
      on: !isNone(limits.customForms),
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
  const [confirming, setConfirming] = useState(false);
  /** The price shown for confirmation before leaving for Paystack. */
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const searchParams = useSearchParams();

  // Read once, on the first render: removing the params below updates
  // useSearchParams, and an effect keyed on it would cancel its own polling.
  const returnReference = useRef(
    searchParams.get("reference") || searchParams.get("trxref"),
  );

  // Coming back from Paystack (it appends ?reference=&trxref=). The plan only
  // switches on when Paystack's webhook reaches connect-nest, seconds later,
  // so poll until it has — and keep the plan buttons disabled meanwhile, or a
  // page still showing the old plan invites a second payment.
  useEffect(() => {
    if (!returnReference.current) return;

    // Drop the gateway's params so a later refresh does not replay this.
    const url = new URL(window.location.href);
    url.searchParams.delete("reference");
    url.searchParams.delete("trxref");
    window.history.replaceState(window.history.state, "", url.toString());

    const pending = readPending();
    if (!pending) {
      // Paid in another tab, or storage is blocked: nothing to compare
      // against, so just re-read once the webhook has had time to land.
      setNotice({
        kind: "info",
        text: "Your plan updates once Paystack confirms the payment. Refresh this page in a moment to check.",
      });
      const timer = setTimeout(
        () => startTransition(() => router.refresh()),
        8000,
      );
      return () => clearTimeout(timer);
    }

    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const started = Date.now();
    setConfirming(true);
    setNotice({
      kind: "info",
      text: "Confirming your payment with Paystack. This usually takes a few seconds.",
    });

    const check = async () => {
      let sub: MySubscription | null = null;
      try {
        // csrfFetch for its 401 refresh-and-retry: the session can expire
        // while the user is away on the Paystack page.
        const res = await csrfFetch("/api/subscriptions/me", {
          cache: "no-store",
        });
        if (res.ok) sub = (await res.json())?.data ?? null;
      } catch {
        // A failed check is retried on the next tick.
      }
      if (stopped) return;

      if (isConfirmed(sub, pending)) {
        clearPending();
        setConfirming(false);
        const until = formatDate(sub.currentPeriodEnd);
        setNotice({
          kind: "ok",
          text: `Payment confirmed. You're on ${sub.plan.name}${
            until ? ` until ${until}` : ""
          }.`,
        });
        startTransition(() => router.refresh());
        return;
      }

      if (Date.now() - started >= CONFIRM_TIMEOUT_MS) {
        clearPending();
        setConfirming(false);
        setNotice({
          kind: "info",
          text: "We haven't had Paystack's confirmation yet. If you completed the payment, your plan will update within a few minutes; refresh this page to check. If you left the payment page without paying, you were not charged.",
        });
        startTransition(() => router.refresh());
        return;
      }

      timer = setTimeout(check, CONFIRM_POLL_MS);
    };
    void check();

    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, [router]);

  const currentKey = subscription?.plan.key ?? null;
  const access = subscription ? hasPlanAccess(subscription) : false;
  const endsAt = subscription ? accessEndsAt(subscription) : null;
  // The plan whose features the user has right now: Free once a paid plan
  // has lapsed, even before the nightly job moves the record to Free.
  const effectiveKey: PlanKey | null = subscription
    ? access
      ? subscription.plan.key
      : "FREE"
    : null;
  const effectiveRank = effectiveKey ? planRank(effectiveKey) : -1;
  const isPaidPlan = (subscription?.plan.priceMonthly ?? 0) > 0;
  const isLapsed = subscription != null && isPaidPlan && !access;
  // Older backends don't send canRenew; they also don't refuse a duplicate
  // payment, so only offer renewal where it can't be one.
  const canRenew =
    subscription?.canRenew ??
    (subscription != null &&
      ["CANCELLED", "PAST_DUE", "EXPIRED"].includes(subscription.status));

  /** What the button on a plan card does, given the user's subscription. */
  function planAction(plan: Plan): {
    label: string;
    enabled: boolean;
    hint?: string;
  } {
    if (!subscription) return { label: "Unavailable", enabled: false };

    if (plan.key === subscription.plan.key) {
      if (plan.priceMonthly === 0) {
        return { label: "Your current plan", enabled: false };
      }
      switch (subscription.status) {
        case "CANCELLED":
          return { label: "Resubscribe", enabled: canRenew };
        case "PAST_DUE":
          return { label: "Renew now", enabled: canRenew };
        case "EXPIRED":
          return { label: `Subscribe to ${plan.name}`, enabled: canRenew };
        case "ACTIVE":
          if (canRenew) {
            return { label: "Renew for another month", enabled: true };
          }
          return {
            label: "Your current plan",
            enabled: false,
            hint: subscription.renewalOpensAt
              ? `You can renew from ${formatDate(subscription.renewalOpensAt)}`
              : undefined,
          };
        default:
          // TRIALING: paying now would end the trial early.
          return { label: "Your current plan", enabled: false };
      }
    }

    if (plan.priceMonthly === 0) {
      if (effectiveKey === "FREE") {
        return { label: "Your current plan", enabled: false };
      }
      // Already cancelled: the move to Free is scheduled, nothing to do.
      if (subscription.status === "CANCELLED") {
        return {
          label: "Yours when your plan ends",
          enabled: false,
          hint: endsAt ? `From ${formatDate(endsAt)}` : undefined,
        };
      }
      return { label: "Move to Free", enabled: true };
    }

    if (planRank(plan.key) > effectiveRank) {
      return { label: `Upgrade to ${plan.name}`, enabled: true };
    }

    // Moving down to a cheaper paid plan would restart the month and drop
    // the rest of what was paid for; not offered until that is decided.
    return { label: "Downgrade not available", enabled: false };
  }

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function post(path: string, body?: unknown) {
    const res = await csrfFetch(path, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = (await res.json().catch(() => ({
      success: false,
      message: "Unexpected response",
    }))) as {
      success: boolean;
      message: string | string[];
      checkoutUrl?: string;
      reference?: string;
    };
    // Nest validation errors arrive as a list of messages.
    const message = Array.isArray(json.message)
      ? json.message.join(". ")
      : json.message;
    return { ...json, message, status: res.status };
  }

  /**
   * First step of paying for a plan: ask connect-nest what it will charge
   * now (a mid-cycle upgrade is prorated) and show that before the user
   * leaves for Paystack. The checkout itself starts from the confirmation.
   */
  async function handleChoose(plan: Plan) {
    if (!subscription) return;
    setNotice(null);
    setQuote(null);

    // Moving to Free from a paid plan is a cancellation, not a purchase —
    // the gateway rejects a zero-amount checkout outright.
    if (plan.priceMonthly === 0) {
      setNotice({
        kind: "info",
        text: "To move to Free, cancel your current plan above. You keep your paid features until the end of the period.",
      });
      return;
    }

    setBusyPlan(plan.key);
    let leaving = false;
    try {
      const res = await csrfFetch(
        `/api/subscriptions/quote?planKey=${encodeURIComponent(plan.key)}`,
        { cache: "no-store" },
      );
      const json = await res.json().catch(() => ({}));
      if (res.ok && json?.data) {
        setQuote(json.data as CheckoutQuote);
        return;
      }
      const message = Array.isArray(json?.message)
        ? json.message.join(". ")
        : json?.message;
      // An older backend without the quote route: go straight to checkout
      // at its full price, as before.
      if (res.status === 404 && String(message ?? "").startsWith("Cannot GET")) {
        leaving = await startCheckout(plan.key);
        return;
      }
      setNotice({
        // 409 is connect-nest explaining why (too early to renew, or a
        // cheaper plan while paid time is left).
        kind: res.status === 409 ? "info" : "err",
        text: message || "Could not price this plan. Please try again.",
      });
    } catch {
      setNotice({
        kind: "err",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      if (!leaving) setBusyPlan(null);
    }
  }

  /**
   * Second step: start the Paystack checkout and leave the app for it.
   * Resolves true once the browser is navigating to Paystack.
   */
  async function startCheckout(planKey: PlanKey): Promise<boolean> {
    if (!subscription) return false;
    setBusyPlan(planKey);
    let leaving = false;
    try {
      const result = await post("/api/subscriptions/initiate-payment", {
        planKey,
      });

      if (result.checkoutUrl) {
        // Leaving the app for Paystack; it returns here with ?reference=,
        // and the effect above waits for the payment to be confirmed.
        writePending({
          plan: planKey,
          previousPlan: subscription.plan.key,
          previousPeriodEnd: subscription.currentPeriodEnd,
          startedAt: Date.now(),
        });
        // Stay busy while the browser navigates away, so a second click
        // can't open a second checkout.
        leaving = true;
        window.location.href = result.checkoutUrl;
        return true;
      }

      setQuote(null);
      setNotice({
        kind: result.status === 409 ? "info" : "err",
        text: result.message || "Could not start the payment. Please try again.",
      });
    } catch {
      setNotice({
        kind: "err",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      if (!leaving) setBusyPlan(null);
    }
    return false;
  }

  /** What the confirmation says the payment buys. */
  function quoteSummary(q: CheckoutQuote, planName: string): string {
    const until = formatDate(q.renewsAt);
    if (q.kind === "prorated_upgrade") {
      return (
        `You'll pay ${formatPrice(q.amountKobo)} now to move to ${planName} ` +
        `for the rest of your current period, until ${until}. You keep that ` +
        `date; renewing after it costs ${formatPrice(q.fullPriceKobo)} a month.`
      );
    }
    return `You'll pay ${formatPrice(q.amountKobo)} now for ${planName} until ${until}.`;
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

  // Not PAST_DUE: its paid period is already over, so cancelling would end
  // access at once — contrary to what the confirmation below promises.
  const canCancel =
    subscription != null &&
    subscription.plan.key !== "FREE" &&
    ["ACTIVE", "TRIALING"].includes(subscription.status);

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
                    <BellIcon className="h-4 w-4 text-sky-400 shrink-0" />
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

            {/* Nothing renews on its own yet: every month is paid for
                separately, so say when it runs out, never "Renews". */}
            {!subscription.isInTrial && isPaidPlan && access && endsAt && (
              <p className="text-xs text-white/40">
                {subscription.status === "CANCELLED"
                  ? `Cancelled. Your features stay on until ${formatDate(endsAt)}.`
                  : subscription.status === "PAST_DUE"
                    ? `Your month ended on ${formatDate(
                        subscription.currentPeriodEnd,
                      )}. Renew by ${formatDate(endsAt)} to keep your features.`
                    : `Paid until ${formatDate(endsAt)}.`}
              </p>
            )}

            {isLapsed && (
              <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2">
                <AlertCircle className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-300">
                  Your {subscription.plan.name} plan has ended, so you&apos;re on
                  Free limits. Renew below to get your features back.
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
          <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4">
            <p className="text-sm font-medium">We couldn&apos;t load your plan</p>
            <p className="text-xs text-white/40 mt-1">
              Refresh the page to try again. Plan changes are unavailable until
              your plan loads.
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
          Plans
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
              // "Current" is the plan whose features the user has now, so a
              // lapsed paid plan no longer shows as current.
              const isCurrent = plan.key === effectiveKey;
              const busy = busyPlan === plan.key;
              const features = headlineFeatures(plan.limits);
              const action = planAction(plan);
              const enabled =
                action.enabled && !busy && !pending && !confirming && busyPlan === null;

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

                  {quote?.planKey === plan.key ? (
                    <div className="space-y-2.5 rounded-lg border border-white/10 bg-white/[0.04] p-3">
                      <p className="text-xs leading-relaxed text-white/70">
                        {quoteSummary(quote, plan.name)}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startCheckout(plan.key)}
                          disabled={busyPlan !== null || pending || confirming}
                          className="flex-1 rounded-lg bg-white px-3 py-2.5 text-xs font-semibold text-black transition hover:bg-white/90 disabled:opacity-50 flex items-center justify-center gap-1.5">
                          {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                          {busy ? "Working…" : `Pay ${formatPrice(quote.amountKobo)}`}
                        </button>
                        <button
                          onClick={() => setQuote(null)}
                          disabled={busyPlan !== null}
                          className="rounded-lg border border-white/10 px-3 py-2.5 text-xs font-medium transition hover:bg-white/5 disabled:opacity-50">
                          Back
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <button
                        onClick={() => handleChoose(plan)}
                        disabled={!enabled}
                        className={`w-full rounded-lg px-3 py-2.5 text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                          action.enabled
                            ? "bg-white text-black hover:bg-white/90 disabled:opacity-50"
                            : "bg-white/5 text-white/30 cursor-default"
                        }`}>
                        {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        {busy ? "Working…" : action.label}
                      </button>
                      {action.hint && (
                        <p className="text-center text-[11px] text-white/35">
                          {action.hint}
                        </p>
                      )}
                    </div>
                  )}
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

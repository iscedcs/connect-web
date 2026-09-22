import Link from "next/link";
import { ChevronRight, Crown } from "lucide-react";
import {
  hasPlanAccess,
  planSummary,
  type MySubscription,
} from "@/lib/types/subscription";

/**
 * The user's plan on the dashboard, so it's visible without going to
 * Settings: "Pro Plus · renews 22 Oct". Links to the plan page. Renders
 * nothing when the subscription couldn't be loaded.
 */
export default function PlanBadge({
  subscription,
}: {
  subscription: MySubscription | null;
}) {
  if (!subscription) return null;

  const paid = subscription.plan.priceMonthly > 0 && hasPlanAccess(subscription);
  const needsAttention =
    subscription.status === "PAST_DUE" ||
    (subscription.plan.priceMonthly > 0 && !hasPlanAccess(subscription));
  const action = needsAttention
    ? "Renew"
    : subscription.trialEligible && !paid
      ? "Try free"
      : paid
        ? "Manage"
        : "Upgrade";

  return (
    <Link
      href="/settings/subscription"
      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition hover:bg-white/5 ${
        needsAttention
          ? "border-amber-500/30 bg-amber-500/10"
          : "border-white/10 bg-white/3"
      }`}>
      <div className="flex min-w-0 items-center gap-3">
        <Crown
          className={`h-4 w-4 shrink-0 ${paid ? "text-amber-400" : "text-white/40"}`}
        />
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-white/40">
            Your plan
          </p>
          <p className="truncate text-sm font-medium">
            {planSummary(subscription)}
          </p>
        </div>
      </div>
      <span className="flex shrink-0 items-center gap-0.5 text-xs text-white/50">
        {action}
        <ChevronRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

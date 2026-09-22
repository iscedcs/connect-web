/**
 * Types mirroring connect-nest's consumer subscription module
 * (`src/subscriptions/*`). Shapes verified against the deployed
 * `GET /api/subscriptions/plans` response, not just the source branch.
 */

export type PlanKey = 'FREE' | 'PRO_LITE' | 'PRO_PLUS';

export type SubscriptionStatus =
	| 'TRIALING'
	| 'ACTIVE'
	| 'PAST_DUE'
	| 'CANCELLED'
	| 'EXPIRED';

export type ThemeCustomization = 'none' | 'basic' | 'full';

/**
 * Numeric limits are never compared directly — see `isUnlimited` for the
 * three shapes "unlimited" arrives in. Comparing raw values treats -1 as a
 * smaller cap than 0, and null throws.
 */
export interface PlanLimits {
	profiles: LimitValue;
	tapsPerDay: LimitValue;
	socialLinks: LimitValue;
	videos: LimitValue;
	files: LimitValue;
	storageBytes: LimitValue;
	meetingLinks: LimitValue;
	customForms: LimitValue;
	analyticsHistoryDays: LimitValue;
	spotifyItems: LimitValue;
	cryptoWallets: LimitValue;
	serviceCategories: LimitValue;
	contactExport: boolean;
	removeIsceBranding: boolean;
	moduleReordering: boolean;
	artisanDirectoryEligible: boolean;
	publiclySearchable: boolean;
	verifiedBadge: boolean;
	prioritySupport: boolean;
	priorityRanking: boolean;
	themeCustomization: ThemeCustomization;
}

export interface Plan {
	id: string;
	key: PlanKey;
	name: string;
	/** In kobo. ₦1,000/mo is stored as 100000. */
	priceMonthly: number;
	isActive: boolean;
	limits: PlanLimits;
	createdAt?: string;
	updatedAt?: string;
}

/** Response shape of `GET /api/subscriptions/me`. */
export interface MySubscription {
	plan: Pick<Plan, 'key' | 'name' | 'priceMonthly'>;
	status: SubscriptionStatus;
	isInTrial: boolean;
	trialEndDate: string | null;
	daysRemaining: number | null;
	currentPeriodEnd: string | null;
	// The fields below come from connect-nest's subscription-lifecycle change.
	// They are optional so the page still works against an older backend;
	// see `hasPlanAccess()` and friends for the fallbacks.
	/** Whether the plan's features are unlocked right now. */
	hasPlanAccess?: boolean;
	/** When the features stop unless paid for; null if nothing ends them. */
	accessEndsAt?: string | null;
	/** Whether paying for this same plan now is accepted (renew/resubscribe). */
	canRenew?: boolean;
	/** For an active paid plan: when renewing the same plan opens. */
	renewalOpensAt?: string | null;
}

/** `hasPlanAccess`, falling back to the status for an older backend. */
export function hasPlanAccess(sub: MySubscription): boolean {
	return sub.hasPlanAccess ?? (sub.status === 'ACTIVE' || sub.status === 'TRIALING');
}

/** When the plan's features end, falling back to the period or trial end. */
export function accessEndsAt(sub: MySubscription): string | null {
	if (sub.accessEndsAt !== undefined) return sub.accessEndsAt;
	return sub.isInTrial ? sub.trialEndDate : sub.currentPeriodEnd;
}

export const UNLIMITED = -1;

/**
 * "Unlimited" reaches us in three different shapes, so every read of a
 * numeric limit has to go through here:
 *
 * - `-1` from `GET /subscriptions/plans`, which returns the stored value.
 * - `null` from `GET /subscriptions/limits`, which resolves limits through
 *   the backend's `resolvePlanLimits` and ends up holding `Infinity` —
 *   and `JSON.stringify(Infinity)` is `null`.
 * - `Infinity` itself, if a caller ever hands us an unserialized value.
 *
 * A missing key counts as unlimited rather than zero: treating an absent
 * limit as "none" would wrongly tell a paying user they have no quota.
 */
export function isUnlimited(value: LimitValue): boolean {
	return (
		value === UNLIMITED ||
		value === null ||
		value === undefined ||
		!Number.isFinite(value)
	);
}

/** A numeric limit as it can actually arrive over the wire. */
export type LimitValue = number | null | undefined;

/** True when the limit is a real number and that number is zero. */
export function isNone(value: LimitValue): boolean {
	return !isUnlimited(value) && value === 0;
}

/** Format a numeric plan limit for display. */
export function formatLimit(value: LimitValue): string {
	if (isUnlimited(value)) return 'Unlimited';
	return (value as number).toLocaleString();
}

/** Kobo → a display string like "₦1,000". */
export function formatPrice(kobo: number | null | undefined): string {
	if (!kobo) return 'Free';
	return new Intl.NumberFormat('en-NG', {
		style: 'currency',
		currency: 'NGN',
		maximumFractionDigits: 0,
	}).format(kobo / 100);
}

/** Bytes → "25MB" / "100MB" / "Unlimited", with 0 meaning none. */
export function formatStorage(bytes: LimitValue): string {
	if (isUnlimited(bytes)) return 'Unlimited';
	if (bytes === 0) return 'None';
	const mb = (bytes as number) / (1024 * 1024);
	return mb >= 1024 ? `${(mb / 1024).toFixed(1)}GB` : `${Math.round(mb)}MB`;
}

/** Plans are ordered cheapest-first by the API; this is the display rank. */
export const PLAN_ORDER: PlanKey[] = ['FREE', 'PRO_LITE', 'PRO_PLUS'];

export function planRank(key: PlanKey): number {
	const idx = PLAN_ORDER.indexOf(key);
	return idx === -1 ? 0 : idx;
}

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
 * Numeric limits use -1 for "unlimited" — the API serializes Infinity that
 * way. Always run counts through `isUnlimited`/`formatLimit` rather than
 * comparing directly, or -1 reads as a smaller cap than 0.
 */
export interface PlanLimits {
	profiles: number;
	tapsPerDay: number;
	socialLinks: number;
	videos: number;
	files: number;
	storageBytes: number;
	meetingLinks: number;
	customForms: number;
	analyticsHistoryDays: number;
	spotifyItems: number;
	cryptoWallets: number;
	serviceCategories: number;
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
}

export const UNLIMITED = -1;

export function isUnlimited(value: number): boolean {
	return value === UNLIMITED;
}

/** Format a numeric plan limit for display, honouring the -1 sentinel. */
export function formatLimit(value: number): string {
	return isUnlimited(value) ? 'Unlimited' : value.toLocaleString();
}

/** Kobo → a display string like "₦1,000". */
export function formatPrice(kobo: number): string {
	if (kobo === 0) return 'Free';
	return new Intl.NumberFormat('en-NG', {
		style: 'currency',
		currency: 'NGN',
		maximumFractionDigits: 0,
	}).format(kobo / 100);
}

/** Bytes → "25MB" / "100MB" / "Unlimited", with 0 meaning none. */
export function formatStorage(bytes: number): string {
	if (isUnlimited(bytes)) return 'Unlimited';
	if (bytes === 0) return 'None';
	const mb = bytes / (1024 * 1024);
	return mb >= 1024 ? `${(mb / 1024).toFixed(1)}GB` : `${Math.round(mb)}MB`;
}

/** Plans are ordered cheapest-first by the API; this is the display rank. */
export const PLAN_ORDER: PlanKey[] = ['FREE', 'PRO_LITE', 'PRO_PLUS'];

export function planRank(key: PlanKey): number {
	const idx = PLAN_ORDER.indexOf(key);
	return idx === -1 ? 0 : idx;
}

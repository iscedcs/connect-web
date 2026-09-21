/**
 * Subscription service — calls connect-nest's consumer `/subscriptions/*`
 * module. Mirrors the shape of the other services in this folder: every
 * function takes the access token and returns parsed data or a
 * `{ success, message }` result, never throwing.
 */

import { BASE_URLS, URLS } from '@/lib/const';
import type { MySubscription, Plan, PlanKey, PlanLimits } from '@/lib/types/subscription';

const CONNECT_API_URL = BASE_URLS.CONNECT_API || '';

interface ApiEnvelope<T> {
	success: boolean;
	message?: string;
	data?: T;
}

async function readEnvelope<T>(res: Response): Promise<ApiEnvelope<T>> {
	return (await res.json().catch(() => ({ success: false }))) as ApiEnvelope<T>;
}

/**
 * A thrown fetch means we never reached connect-nest — DNS, TLS, a refused
 * connection or an aborted socket. An HTTP error (400/401/409) does NOT land
 * here; those come back as a normal Response. Log the real cause: swallowing
 * it makes an unreachable upstream indistinguishable from a rejected request.
 */
function transportFailure(op: string, err: unknown): MutationResult {
	const cause = err instanceof Error ? (err.cause ?? err.message) : err;
	console.error(
		`[subscription] ${op} could not reach ${CONNECT_API_URL || '(no API URL configured)'}:`,
		err instanceof Error ? err.message : err,
		cause && cause !== (err as Error)?.message ? `| cause: ${String(cause)}` : '',
	);
	return {
		success: false,
		message: `Could not reach the subscription service. ${
			err instanceof Error ? err.message : 'Unknown transport error'
		}`,
	};
}

/**
 * The authenticated user's subscription, or null when they have none.
 * The API 404s rather than returning an empty body for users who have
 * never selected a plan, so that case is normalised to null here.
 */
export async function getMySubscription(
	accessToken: string,
): Promise<MySubscription | null> {
	if (!CONNECT_API_URL || !accessToken) return null;
	try {
		const res = await fetch(`${CONNECT_API_URL}${URLS.subscription.my_plan}`, {
			headers: { Authorization: `Bearer ${accessToken}` },
			cache: 'no-store',
		});
		if (!res.ok) {
			// 404 is the normal "hasn't picked a plan yet" case; anything else
			// is a real fault that would otherwise vanish into a null.
			if (res.status !== 404) {
				console.error(
					`[subscription] GET me -> HTTP ${res.status}`,
					(await res.text().catch(() => '')).slice(0, 300),
				);
			}
			return null;
		}
		const json = await readEnvelope<MySubscription>(res);
		return json?.data ?? null;
	} catch (err) {
		console.error('[subscription] me failed:', err);
		return null;
	}
}

/**
 * All active plans, cheapest first. This endpoint is public on the backend,
 * so it works without a token — useful for rendering the plan grid even if
 * the session has gone stale.
 */
export async function getPlans(accessToken?: string): Promise<Plan[]> {
	if (!CONNECT_API_URL) return [];
	try {
		const res = await fetch(`${CONNECT_API_URL}${URLS.subscription.plans}`, {
			headers: accessToken
				? { Authorization: `Bearer ${accessToken}` }
				: undefined,
			cache: 'no-store',
		});
		if (!res.ok) {
			console.error(
				`[subscription] GET plans -> HTTP ${res.status}`,
				(await res.text().catch(() => '')).slice(0, 300),
			);
			return [];
		}
		const json = await readEnvelope<{ plans: Plan[] }>(res);
		return json?.data?.plans ?? [];
	} catch (err) {
		console.error('[subscription] plans failed:', err);
		return [];
	}
}

/**
 * Effective limits for the user right now. Distinct from the limits on their
 * plan: the backend drops expired/cancelled/past-due users back to FREE
 * limits while still reporting the plan they signed up for.
 */
export async function getMyLimits(
	accessToken: string,
): Promise<PlanLimits | null> {
	if (!CONNECT_API_URL || !accessToken) return null;
	try {
		const res = await fetch(`${CONNECT_API_URL}${URLS.subscription.plan_limit}`, {
			headers: { Authorization: `Bearer ${accessToken}` },
			cache: 'no-store',
		});
		if (!res.ok) {
			console.error(
				`[subscription] GET limits -> HTTP ${res.status}`,
				(await res.text().catch(() => '')).slice(0, 300),
			);
			return null;
		}
		const json = await readEnvelope<{ limits: PlanLimits }>(res);
		return json?.data?.limits ?? null;
	} catch (err) {
		console.error('[subscription] limits failed:', err);
		return null;
	}
}

export interface MutationResult {
	success: boolean;
	message: string;
	data?: unknown;
}

/**
 * Select a plan for the first time. Paid plans start a 3-month trial rather
 * than charging immediately. The backend 409s if a subscription already
 * exists — changing plans afterwards goes through `initiatePayment`.
 */
export async function selectPlan(
	accessToken: string,
	planKey: PlanKey,
): Promise<MutationResult> {
	if (!CONNECT_API_URL || !accessToken) {
		return { success: false, message: 'Service unavailable' };
	}
	try {
		const res = await fetch(`${CONNECT_API_URL}${URLS.subscription.choose_plan}`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ planKey }),
			cache: 'no-store',
		});
		const json = await readEnvelope<unknown>(res);
		if (!res.ok) {
			console.error(
				`[subscription] POST select-plan -> HTTP ${res.status}`,
				JSON.stringify(json).slice(0, 300),
			);
		}
		return {
			success: res.ok && json.success !== false,
			message:
				json.message ||
				(res.ok ? 'Plan selected' : 'Could not select that plan'),
			data: json.data,
		};
	} catch (err) {
		return transportFailure('select-plan', err);
	}
}

/** Cancel the current paid subscription; access runs to the period end. */
export async function cancelSubscription(
	accessToken: string,
): Promise<MutationResult> {
	if (!CONNECT_API_URL || !accessToken) {
		return { success: false, message: 'Service unavailable' };
	}
	try {
		const res = await fetch(`${CONNECT_API_URL}${URLS.subscription.cancel_plan}`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${accessToken}` },
			cache: 'no-store',
		});
		const json = await readEnvelope<unknown>(res);
		return {
			success: res.ok && json.success !== false,
			message: json.message || (res.ok ? 'Subscription cancelled' : 'Cancel failed'),
			data: json.data,
		};
	} catch (err) {
		return transportFailure('cancel', err);
	}
}

/**
 * Start a checkout session for a paid plan.
 *
 * NOTE: as of this writing the backend returns `{ success: false, message:
 * 'Payment gateway integration pending' }` — the gateway work is a later
 * phase. The caller is expected to surface `message` verbatim rather than
 * assume a redirect URL comes back, so this starts working on its own once
 * the backend ships.
 */
export async function initiatePayment(
	accessToken: string,
	planKey: PlanKey,
): Promise<MutationResult & { authorizationUrl?: string }> {
	if (!CONNECT_API_URL || !accessToken) {
		return { success: false, message: 'Service unavailable' };
	}
	try {
		const res = await fetch(
			`${CONNECT_API_URL}${URLS.subscription.initiate_payment}`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ planKey }),
				cache: 'no-store',
			},
		);
		const json = await readEnvelope<Record<string, unknown>>(res);
		const data = (json.data ?? {}) as Record<string, unknown>;
		const authorizationUrl =
			(data.authorizationUrl as string) ||
			(data.authorization_url as string) ||
			undefined;

		return {
			success: res.ok && json.success !== false,
			message: json.message || (res.ok ? 'Payment session created' : 'Could not start payment'),
			authorizationUrl,
			data: json.data,
		};
	} catch (err) {
		return transportFailure('initiate-payment', err);
	}
}

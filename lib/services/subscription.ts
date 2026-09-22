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
		status: 502,
		message: 'Could not reach the subscription service. Please try again.',
	};
}

/**
 * The authenticated user's subscription, or null if it could not be loaded.
 * connect-nest gives every user a Free subscription the first time this is
 * called, so null always means a failure, never "no plan yet": callers must
 * show an error, not offer a first-time plan choice.
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
			console.error(
				`[subscription] GET me -> HTTP ${res.status}`,
				(await res.text().catch(() => '')).slice(0, 300),
			);
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
	/**
	 * The HTTP status to answer the browser with: connect-nest's own status
	 * when it answered, 502 when it could not be reached, 503 when this app
	 * is not configured. Passing it through (rather than flattening to 200)
	 * lets the client tell a 401 — which csrfFetch recovers from by
	 * refreshing the session — from a real refusal.
	 */
	status: number;
	message: string;
	data?: unknown;
}

/** Cancel the current paid subscription; access runs to the period end. */
export async function cancelSubscription(
	accessToken: string,
): Promise<MutationResult> {
	if (!CONNECT_API_URL || !accessToken) {
		return { success: false, status: 503, message: 'Service unavailable' };
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
			status: res.status,
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
 * The gateway returns `data.checkoutUrl` (the provider maps Paystack's
 * `authorization_url` onto that name before it reaches us) plus a
 * `reference` we keep so the return leg can be matched to this attempt.
 * The older `authorizationUrl` spellings are still accepted in case a
 * different provider surfaces the raw field.
 *
 * `callbackUrl` is where the gateway sends the user once they are done;
 * without it they finish paying and land wherever the gateway defaults to.
 */
export async function initiatePayment(
	accessToken: string,
	planKey: PlanKey,
	callbackUrl?: string,
): Promise<MutationResult & { checkoutUrl?: string; reference?: string }> {
	if (!CONNECT_API_URL || !accessToken) {
		return { success: false, status: 503, message: 'Service unavailable' };
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
				body: JSON.stringify(
					callbackUrl ? { planKey, callbackUrl } : { planKey },
				),
				cache: 'no-store',
			},
		);
		const json = await readEnvelope<Record<string, unknown>>(res);
		const data = (json.data ?? {}) as Record<string, unknown>;
		const checkoutUrl =
			(data.checkoutUrl as string) ||
			(data.authorizationUrl as string) ||
			(data.authorization_url as string) ||
			undefined;

		if (!res.ok || json.success === false) {
			console.error(
				`[subscription] POST initiate-payment -> HTTP ${res.status}`,
				JSON.stringify(json).slice(0, 300),
			);
		} else if (!checkoutUrl) {
			// Succeeded but gave us nowhere to send the user — without this
			// the UI silently does nothing, which is hard to diagnose.
			console.error(
				'[subscription] initiate-payment returned no checkout URL:',
				JSON.stringify(json.data).slice(0, 300),
			);
		}

		return {
			success: res.ok && json.success !== false,
			status: res.status,
			message: json.message || (res.ok ? 'Payment session created' : 'Could not start payment'),
			checkoutUrl,
			reference: (data.reference as string) || undefined,
			data: json.data,
		};
	} catch (err) {
		return transportFailure('initiate-payment', err);
	}
}

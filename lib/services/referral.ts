/**
 * Referral service — calls connect-nest's referral proxy routes.
 * connect-web never talks to ISCE Auth Service directly for referrals.
 */

const CONNECT_API_URL =
	process.env.CONNECT_API_URL || process.env.NEXT_PUBLIC_CONNECT_API_URL || '';

export interface ReferralSummary {
	code: string | null;
	earnings: { pending: number; available: number; cashedOut: number };
	referralCount: number;
}

// The auth callback awaits attachReferral before redirecting, so this must not
// hold sign-in hostage when connect-nest is slow. Bounded, and non-fatal.
const ATTACH_TIMEOUT_MS = 3000;

/**
 * Bind the freshly-authenticated user to the referrer whose code they arrived
 * with. connect-nest resolves the user id from the bearer token and injects the
 * INTERNAL_API_KEY itself, so the key never reaches the browser.
 *
 * Safe to call on every sign-in: isce-auth no-ops when the referrer is already
 * set, the code is unknown, or it's a self-referral. A leading '@' and any
 * casing are normalised server-side by getUserByTag.
 */
export async function attachReferral(
	accessToken: string,
	referralUsername: string,
): Promise<{ success: boolean; message: string }> {
	const code = referralUsername.trim();
	if (!CONNECT_API_URL || !accessToken || !code)
		return { success: false, message: 'Service unavailable' };
	try {
		const res = await fetch(`${CONNECT_API_URL}/referral/attach`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ referralUsername: code }),
			cache: 'no-store',
			signal: AbortSignal.timeout(ATTACH_TIMEOUT_MS),
		});
		const json = await res.json().catch(() => null);
		return {
			success: res.ok && json?.success !== false,
			message:
				json?.message ??
				(res.ok ? 'Referrer attached' : `Attach failed (${res.status})`),
		};
	} catch (err) {
		return {
			success: false,
			message:
				err instanceof Error && err.name === 'TimeoutError'
					? `Attach timed out after ${ATTACH_TIMEOUT_MS}ms`
					: 'Network error',
		};
	}
}

/** Fetch the authenticated user's referral code, earnings breakdown, and referral count. */
export async function getReferralSummary(
	accessToken: string,
): Promise<ReferralSummary | null> {
	if (!CONNECT_API_URL || !accessToken) return null;
	try {
		const res = await fetch(`${CONNECT_API_URL}/referral/me`, {
			headers: { Authorization: `Bearer ${accessToken}` },
			cache: 'no-store',
		});
		if (!res.ok) return null;
		const json = await res.json();
		return json?.data ?? null;
	} catch {
		return null;
	}
}

/** Apply for Business Referrer status (negotiated reward rate, admin-approved). */
export async function applyForBusinessReferrer(
	accessToken: string,
): Promise<{ success: boolean; message: string }> {
	if (!CONNECT_API_URL || !accessToken)
		return { success: false, message: 'Service unavailable' };
	try {
		const res = await fetch(`${CONNECT_API_URL}/referral/business/apply`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
			cache: 'no-store',
		});
		const json = await res.json();
		return {
			success: res.ok && json?.success,
			message:
				json?.message ??
				(res.ok ? 'Application submitted' : 'Failed to submit application'),
		};
	} catch {
		return { success: false, message: 'Network error. Please try again.' };
	}
}

/** Cash out available referral earnings to the user's wallet. */
export async function requestReferralCashOut(
	accessToken: string,
): Promise<{ success: boolean; message: string; data?: { amount: number } }> {
	if (!CONNECT_API_URL || !accessToken)
		return { success: false, message: 'Service unavailable' };
	try {
		const res = await fetch(`${CONNECT_API_URL}/referral/cash-out`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
			cache: 'no-store',
		});
		const json = await res.json();
		return {
			success: res.ok && json?.success,
			message:
				json?.message ?? (res.ok ? 'Cash out successful' : 'Cash out failed'),
			data: json?.data,
		};
	} catch {
		return { success: false, message: 'Network error. Please try again.' };
	}
}

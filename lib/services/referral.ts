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

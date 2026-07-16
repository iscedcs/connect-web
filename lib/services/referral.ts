import { getAuthInfo } from '@/actions/auth';
import { BASE_URLS, URLS } from '../const';

export interface ReferralEarnings {
	pending: number;
	available: number;
	cashedOut: number;
}

export interface ReferralData {
	code: string | null;
	earnings: ReferralEarnings;
	referralCount: number;
}

export interface ReferralResponse {
	success: boolean;
	statusCode: number;
	data?: ReferralData;
	message?: string;
}

async function safeJson(res: Response): Promise<any | null> {
	const contentType = res.headers.get('content-type') || '';
	if (!contentType.toLowerCase().includes('application/json')) {
		return null;
	}
	try {
		return await res.json();
	} catch {
		return null;
	}
}

export async function getReferralMe(
	accessToken?: string,
): Promise<ReferralData | null> {
	let token = accessToken;
	if (!token) {
		const auth = await getAuthInfo();
		if ('error' in auth || auth.isExpired) return null;
		token = auth.accessToken;
	}

	const base = BASE_URLS.CONNECT_API || '';
	if (!base || !token) return null;

	try {
		const res = await fetch(`${base}${URLS.referral.me}`, {
			headers: { Authorization: `Bearer ${token}` },
			cache: 'no-store',
		});
		if (!res.ok) return null;
		const json = await safeJson(res);
		if (json?.data) {
			return json.data as ReferralData;
		}
		return null;
	} catch (error) {
		if (process.env.NODE_ENV !== 'production') {
			console.error('[getReferralMe] failed to fetch referral data', error);
		}
		return null;
	}
}

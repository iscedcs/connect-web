import { http } from '@/lib/services/http';
import { URLS } from '@/lib/const';

const BASE =
	process.env.CONNECT_API_URL || process.env.NEXT_PUBLIC_CONNECT_API_URL;

export interface ProfileStats {
	socialsCount: number;
	contactsCount: number;
	unreadNotificationsCount: number;
	supportRequestsCount: number;
	cardInteractionsCount: number;
}

export async function fetchProfileStats(
	accessToken: string,
): Promise<ProfileStats | null> {
	try {
		const res = await http.get(`${BASE}${URLS.profile.stats}`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		return res.data?.data?.stats ?? null;
	} catch {
		return null;
	}
}

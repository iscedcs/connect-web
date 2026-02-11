import { http } from '@/lib/services/http';
import { URLS } from '@/lib/const';

const BASE = process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL;

export async function fetchReceivedContacts({
	profileId,
	accessToken,
	page = 1,
	limit = 10,
}: {
	profileId: string;
	accessToken: string;
	page?: number;
	limit?: number;
}) {
	try {
		const res = await http.get(
			`${BASE}${URLS.profile_contact.recieved.replace(
				'{profileId}',
				profileId,
			)}`,
			{
				params: { page, limit },
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			},
		);

		return res.data?.data;
	} catch (err: any) {
		throw err;
	}
}

export async function searchReceivedContacts({
	profileId,
	accessToken,
	query,
}: {
	profileId: string;
	accessToken: string;
	query: string;
}) {
	const res = await http.get(
		`${BASE}${URLS.profile_contact.search_recieved.replace(
			'{profileId}',
			profileId,
		)}`,
		{
			params: { q: query },
			headers: { Authorization: `Bearer ${accessToken}` },
		},
	);

	return res.data.data;
}

export async function fetchRecentReceivedContacts({
	profileId,
	accessToken,
}: {
	profileId: string;
	accessToken: string;
}) {
	const res = await http.get(
		`${BASE}${URLS.profile_contact.recent_recieved.replace(
			'{profileId}',
			profileId,
		)}`,
		{
			headers: { Authorization: `Bearer ${accessToken}` },
		},
	);

	return res.data.data.contacts;
}

/**  📊
 * STATS
 *  */
export async function fetchReceivedContactStats({
	profileId,
	accessToken,
}: {
	profileId: string;
	accessToken: string;
}) {
	const res = await http.get(
		`${BASE}${URLS.profile_contact.stats_recieved.replace(
			'{profileId}',
			profileId,
		)}`,
		{
			headers: { Authorization: `Bearer ${accessToken}` },
		},
	);

	return res.data.data.stats;
}

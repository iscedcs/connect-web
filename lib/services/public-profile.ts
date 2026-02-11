import { URLS } from '@/lib/const';
import { http } from './http';

const CONNECT_API = process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL;

/** ---------------------------------------
 * FETCH A DEVICE HOLDER PUBLIC PROFILE
 -----------------------------------------*/
export async function fetchPublicProfile(deviceId: string) {
	try {
		const url = `${CONNECT_API}${URLS.profile.public.replace(
			'{deviceId}',
			deviceId,
		)}`;

		const res = await http.get(url);
		return res.data?.data ?? null;
	} catch (err) {
		console.error('Public profile fetch failed →', err);
		return null;
	}
}

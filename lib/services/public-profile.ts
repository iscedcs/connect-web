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
		console.log({ data: res.data.data });
		console.log('Public profile social fetched →', res.data.data.socials);
		return res.data?.data ?? null;
	} catch (err) {
		console.error('Public profile fetch failed →', err);
		return null;
	}
}

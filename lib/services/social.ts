import { http } from '@/lib/services/http';
import { URLS } from '@/lib/const';

const BASE =
	process.env.CONNECT_API_URL || process.env.NEXT_PUBLIC_CONNECT_API_URL;

export interface SocialPlatformStat {
	platform: string;
	count: number;
}

export interface SocialStats {
	totalSocials: number;
	platforms: SocialPlatformStat[];
}

export async function fetchSocialStats({
	accessToken,
}: {
	accessToken: string;
}): Promise<SocialStats> {
	const res = await http.get(`${BASE}${URLS.social.stats}`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	return res.data?.data?.stats;
}

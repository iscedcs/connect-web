import { cookies } from 'next/headers';
import { generateMetadata } from '@/lib/metadata';
import IsceTagSettings from '@/components/settings/account/isce-tag-settings';

export const metadata = generateMetadata({
	title: 'ISCE Tag',
	description: 'Set or change your public @handle on the ISCE platform.',
	keywords: ['ISCE Tag', 'handle', 'username', 'profile'],
	noIndex: true,
});

const AUTH_API_URL = process.env.AUTH_API_URL ?? '';

async function fetchTagData(accessToken: string) {
	const [meRes, historyRes] = await Promise.all([
		fetch(`${AUTH_API_URL}/user/me`, {
			headers: { Authorization: `Bearer ${accessToken}` },
			cache: 'no-store',
		}).catch(() => null),
		fetch(`${AUTH_API_URL}/user/tag-history`, {
			headers: { Authorization: `Bearer ${accessToken}` },
			cache: 'no-store',
		}).catch(() => null),
	]);

	const me = meRes?.ok ? await meRes.json().catch(() => null) : null;
	const history = historyRes?.ok ? await historyRes.json().catch(() => null) : null;

	const username: string | null = me?.data?.username ?? null;
	const tagHistory: { previousTag: string; changedAt: string }[] = history?.data ?? [];

	return { username, tagHistory };
}

export default async function IsceTagPage() {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get('accessToken')?.value ?? '';

	const { username, tagHistory } = accessToken
		? await fetchTagData(accessToken)
		: { username: null, tagHistory: [] };

	const currentTag = username ? `@${username}` : null;

	return <IsceTagSettings currentTag={currentTag} tagHistory={tagHistory} />;
}

import { getAuthInfo } from '@/actions/auth';
import AnalyticsClient from '@/components/pages/cardholder/analytics/analytics-client';
import { generateMetadata } from '@/lib/metadata';
import { http } from '@/lib/services/http';
import { URLS } from '@/lib/const';
import SubpageHeader from '@/components/shared/subpage-header';

export const metadata = generateMetadata({
	title: 'Analytics',
	description:
		'View your profile analytics — card interactions, contacts, notifications, social links and more.',
	keywords: [
		'analytics',
		'card',
		'taps',
		'scans',
		'interactions',
		'contacts',
	],
});

async function getDefaultProfileId(
	accessToken: string,
): Promise<string | undefined> {
	try {
		const base =
			process.env.CONNECT_API_URL ||
			process.env.NEXT_PUBLIC_CONNECT_API_URL;
		const res = await http.get(`${base}${URLS.multi_profile.get_default}`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		return res.data?.data?.id ?? undefined;
	} catch {
		return undefined;
	}
}

export default async function AnalyticsPage() {
	const authInfo = await getAuthInfo();

	if ('error' in authInfo || authInfo.isExpired) {
		return <div className='text-white p-6'>Redirecting to login...</div>;
	}

	const defaultProfileId = await getDefaultProfileId(authInfo.accessToken);

	return (
		<main className='min-h-screen bg-black text-white'>
			<SubpageHeader
				title='Card Analytics'
				backHref='/dashboard'
			/>
			<div className='p-6 space-y-4'>
				<AnalyticsClient
					accessToken={authInfo.accessToken}
					defaultProfileId={defaultProfileId}
				/>
			</div>
		</main>
	);
}

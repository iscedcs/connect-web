import { getAuthInfo } from '@/actions/auth';
import AnalyticsClient from '@/components/pages/cardholder/analytics/analytics-client';
import { generateMetadata } from '@/lib/metadata';

export const metadata = generateMetadata({
	title: 'Card Analytics',
	description:
		'View your NFC tap and QR scan analytics — see how people interact with your card.',
	keywords: ['analytics', 'card', 'taps', 'scans', 'interactions'],
});

export default async function AnalyticsPage() {
	const authInfo = await getAuthInfo();

	if ('error' in authInfo || authInfo.isExpired) {
		return <div className='text-white p-6'>Redirecting to login...</div>;
	}

	return (
		<main className='p-6 space-y-4'>
			<h1 className='text-2xl text-white font-bold'>Card Analytics</h1>
			<AnalyticsClient accessToken={authInfo.accessToken} />
		</main>
	);
}

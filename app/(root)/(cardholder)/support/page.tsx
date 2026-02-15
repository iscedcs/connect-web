import { getAuthInfo } from '@/actions/auth';
import SupportClient from '@/components/pages/cardholder/support/support-client';
import { generateMetadata } from '@/lib/metadata';

export const metadata = generateMetadata({
	title: 'Support',
	description: 'Get help with your Connect account, profile, or devices.',
	keywords: ['support', 'help', 'contact'],
});

export default async function SupportPage() {
	const authInfo = await getAuthInfo();

	if ('error' in authInfo || authInfo.isExpired) {
		return (
			<div className='text-white p-6'>Redirecting to login...</div>
		);
	}

	return (
		<main className='p-6 space-y-4'>
			<h1 className='text-2xl text-white font-bold'>Support</h1>
			<SupportClient accessToken={authInfo.accessToken} />
		</main>
	);
}

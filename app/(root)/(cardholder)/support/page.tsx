import { getAuthInfo } from '@/actions/auth';
import SupportClient from '@/components/pages/cardholder/support/support-client';
import { generateMetadata } from '@/lib/metadata';
import SubpageHeader from '@/components/shared/subpage-header';

export const metadata = generateMetadata({
	title: 'Support',
	description: 'Get help with your Connect account, profile, or devices.',
	keywords: ['support', 'help', 'contact'],
});

export default async function SupportPage() {
	const authInfo = await getAuthInfo();

	if ('error' in authInfo || authInfo.isExpired) {
		return <div className='text-white p-6'>Redirecting to login...</div>;
	}

	return (
		<main className='min-h-screen bg-black text-white'>
			<SubpageHeader
				title='Support'
				backHref='/settings'
			/>
			<div className='p-6 space-y-4'>
				<SupportClient accessToken={authInfo.accessToken} />
			</div>
		</main>
	);
}

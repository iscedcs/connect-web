import { getAuthInfo } from '@/actions/auth';
import NotificationsClient from '@/components/pages/cardholder/notification/notifications-client';
import { generateMetadata } from '@/lib/metadata';
import SubpageHeader from '@/components/shared/subpage-header';

export const metadata = generateMetadata({
	title: 'Notifications',
	description:
		'View your Connect notifications — card interactions, shared contacts, and more.',
	keywords: ['notifications', 'alerts', 'activity'],
});

export default async function NotificationsPage() {
	const authInfo = await getAuthInfo();

	if ('error' in authInfo || authInfo.isExpired) {
		return <div className='text-white p-6'>Redirecting to login...</div>;
	}

	return (
		<main className='min-h-screen bg-black text-white'>
			<SubpageHeader
				title='Notifications'
				backHref='/dashboard'
			/>
			<div className='p-6 space-y-4'>
				<NotificationsClient accessToken={authInfo.accessToken} />
			</div>
		</main>
	);
}

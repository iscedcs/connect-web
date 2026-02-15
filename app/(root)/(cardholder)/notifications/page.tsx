import { getAuthInfo } from '@/actions/auth';
import NotificationsClient from '@/components/pages/cardholder/notification/notifications-client';
import { generateMetadata } from '@/lib/metadata';

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
		<main className='p-6 space-y-4'>
			<h1 className='text-2xl text-white font-bold'>Notifications</h1>
			<NotificationsClient accessToken={authInfo.accessToken} />
		</main>
	);
}

import { getAuthInfo } from '@/actions/auth';
import { getConnectProfile } from '@/lib/services/profile';
import { redirect } from 'next/navigation';
import {
	getMyArtisanProfile,
	getMyThreads,
	getArtisanThreads,
} from '@/lib/services/artisan';
import ThreadListClient from '@/components/cardholder/artisan/threads/thread-list-client';

export default async function ThreadsPage() {
	const auth = await getAuthInfo();
	if ('error' in auth || auth.isExpired) redirect('/');

	const connectProfile = await getConnectProfile();
	if (!connectProfile?.id) redirect('/dashboard');

	const artisan = await getMyArtisanProfile(connectProfile.id);

	// Fetch both client-side and artisan-side threads
	const [clientThreads, artisanThreads] = await Promise.all([
		getMyThreads(1, 50),
		artisan ? getArtisanThreads(connectProfile.id, 1, 50) : null,
	]);

	return (
		<div className='px-4 py-6'>
			<ThreadListClient
				clientThreads={clientThreads}
				artisanThreads={artisanThreads}
				isArtisan={!!artisan}
				accessToken={auth.accessToken}
				profileId={connectProfile.id}
			/>
		</div>
	);
}

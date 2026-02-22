import { getAuthInfo } from '@/actions/auth';
import {
	getMyArtisanProfile,
	getArtisanBookings,
	getArtisanEarnings,
} from '@/lib/services/artisan';
import { getConnectProfile } from '@/lib/services/profile';
import { redirect } from 'next/navigation';
import { generateMetadata } from '@/lib/metadata';
import ArtisanDashboardClient from '@/components/cardholder/artisan/artisan-dashboard-client';

export const metadata = generateMetadata({
	title: 'Artisan Dashboard',
	description: 'Manage your artisan profile, bookings, and services.',
	keywords: ['artisan', 'dashboard', 'bookings', 'services'],
});

export default async function ArtisanDashboardPage() {
	const [authInfo, connectProfile] = await Promise.all([
		getAuthInfo(),
		getConnectProfile(),
	]);

	const isAuthed = !('error' in authInfo) && !authInfo.isExpired;
	if (!isAuthed || !connectProfile?.id) {
		redirect('/dashboard');
	}

	const artisan = await getMyArtisanProfile(connectProfile.id);
	if (!artisan) {
		redirect('/connect/artisan/setup');
	}

	const [bookings, earnings] = await Promise.all([
		getArtisanBookings(connectProfile.id, { limit: 5 }),
		getArtisanEarnings(connectProfile.id),
	]);

	return (
		<main className='relative bg-black text-white min-h-screen'>
			<div className='p-4 pt-6'>
				<ArtisanDashboardClient
					artisan={artisan}
					recentBookings={bookings}
					earnings={earnings}
					accessToken={authInfo.accessToken}
					profileId={connectProfile.id}
				/>
			</div>
		</main>
	);
}

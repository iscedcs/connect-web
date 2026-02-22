import { getAuthInfo } from '@/actions/auth';
import { getConnectProfile } from '@/lib/services/profile';
import { redirect } from 'next/navigation';
import {
	getMyArtisanProfile,
	getArtisanBookings,
} from '@/lib/services/artisan';
import ArtisanBookingsClient from '@/components/cardholder/artisan/bookings/artisan-bookings-client';

export const metadata = {
	title: 'Bookings — Artisan',
	description: 'Manage your artisan bookings',
};

export default async function ArtisanBookingsPage() {
	const auth = await getAuthInfo();
	if ('error' in auth || auth.isExpired) redirect('/');

	const connectProfile = await getConnectProfile();
	if (!connectProfile?.id) redirect('/dashboard');

	const artisan = await getMyArtisanProfile(connectProfile.id);
	if (!artisan) redirect('/connect/artisan/setup');

	const bookingsData = await getArtisanBookings(connectProfile.id, {
		limit: 20,
	});

	return (
		<div className='px-4 py-6'>
			<ArtisanBookingsClient
				bookingsData={bookingsData}
				accessToken={auth.accessToken}
				profileId={connectProfile.id}
			/>
		</div>
	);
}

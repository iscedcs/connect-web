import { getAuthInfo } from '@/actions/auth';
import { getConnectProfile } from '@/lib/services/profile';
import { redirect } from 'next/navigation';
import { getMyArtisanProfile, getBookingById } from '@/lib/services/artisan';
import BookingDetailClient from '@/components/cardholder/artisan/bookings/booking-detail-client';

export const metadata = {
	title: 'Booking Details — Artisan',
	description: 'View booking details',
};

export default async function BookingDetailPage({
	params,
}: {
	params: Promise<{ bookingId: string }>;
}) {
	const { bookingId } = await params;

	const auth = await getAuthInfo();
	if ('error' in auth || auth.isExpired) redirect('/');

	const connectProfile = await getConnectProfile();
	if (!connectProfile?.id) redirect('/dashboard');

	const artisan = await getMyArtisanProfile(connectProfile.id);

	const { booking } = await getBookingById(bookingId);
	if (!booking) redirect('/connect/artisan/bookings');

	return (
		<div className='px-4 py-6'>
			<BookingDetailClient
				booking={booking}
				accessToken={auth.accessToken}
				profileId={connectProfile.id}
				isArtisan={!!artisan}
				viewerRole={booking.viewerRole}
			/>
		</div>
	);
}

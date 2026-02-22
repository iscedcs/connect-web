import { getAuthInfo } from '@/actions/auth';
import { getConnectProfile } from '@/lib/services/profile';
import { redirect } from 'next/navigation';
import {
	getMyArtisanProfile,
	getArtisanEarnings,
} from '@/lib/services/artisan';
import ArtisanEarningsClient from '@/components/cardholder/artisan/earnings/artisan-earnings-client';

export const metadata = {
	title: 'Earnings — Artisan',
	description: 'View your artisan earnings',
};

export default async function ArtisanEarningsPage() {
	const auth = await getAuthInfo();
	if ('error' in auth || auth.isExpired) redirect('/');

	const connectProfile = await getConnectProfile();
	if (!connectProfile?.id) redirect('/dashboard');

	const artisan = await getMyArtisanProfile(connectProfile.id);
	if (!artisan) redirect('/connect/artisan/setup');

	const earnings = await getArtisanEarnings(connectProfile.id);

	return (
		<div className='px-4 py-6'>
			<ArtisanEarningsClient
				earnings={earnings}
				artisan={artisan}
			/>
		</div>
	);
}

import { redirect } from 'next/navigation';
import { getAuthInfo } from '@/actions/auth';
import { getMyArtisanProfile, getMyPromotions } from '@/lib/services/artisan';
import ArtisanPromotionsClient from '@/components/cardholder/artisan/promotions/artisan-promotions-client';
import { getConnectProfile } from '@/lib/services/profile';

export const metadata = { title: 'Promotions — ISCE Connect' };

export default async function ArtisanPromotionsPage() {
	const auth = await getAuthInfo();
	if ('error' in auth || auth.isExpired) redirect('/');

	const connectProfile = await getConnectProfile();
	if (!connectProfile?.id) redirect('/');

	const artisan = await getMyArtisanProfile(connectProfile.id);
	if (!artisan) redirect('/connect/artisan/setup');

	const promotions = await getMyPromotions(connectProfile.id);

	return (
		<ArtisanPromotionsClient
			promotions={promotions}
			artisan={artisan}
			profileId={connectProfile.id}
			accessToken={auth.accessToken}
		/>
	);
}

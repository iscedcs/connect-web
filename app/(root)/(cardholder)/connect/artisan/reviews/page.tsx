import { redirect } from 'next/navigation';
import { getAuthInfo } from '@/actions/auth';
import { getConnectProfile } from '@/lib/services/profile';
import {
	getMyArtisanProfile,
	getArtisanPublicReviews,
} from '@/lib/services/artisan';
import ArtisanReviewsClient from '@/components/cardholder/artisan/reviews/artisan-reviews-client';

export const metadata = { title: 'My Reviews — ISCE Connect' };

export default async function ArtisanReviewsPage() {
	const auth = await getAuthInfo();
	if ('error' in auth || auth.isExpired) redirect('/');

	const connectProfile = await getConnectProfile();
	if (!connectProfile?.id) redirect('/');

	const artisan = await getMyArtisanProfile(connectProfile.id);
	if (!artisan) redirect('/connect/artisan/setup');

	const reviewsData = await getArtisanPublicReviews(artisan.id, 1, 50);

	return (
		<ArtisanReviewsClient
			reviewsData={reviewsData}
			artisan={artisan}
		/>
	);
}

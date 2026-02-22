import { getAuthInfo } from '@/actions/auth';
import { getConnectProfile } from '@/lib/services/profile';
import { redirect } from 'next/navigation';
import {
	getMyArtisanProfile,
	getArtisanPortfolio,
} from '@/lib/services/artisan';
import ArtisanPortfolioClient from '@/components/cardholder/artisan/portfolio/artisan-portfolio-client';

export const metadata = {
	title: 'Portfolio — Artisan',
	description: 'Manage your artisan portfolio',
};

export default async function ArtisanPortfolioPage() {
	const auth = await getAuthInfo();
	if ('error' in auth || auth.isExpired) redirect('/');

	const connectProfile = await getConnectProfile();
	if (!connectProfile?.id) redirect('/dashboard');

	const artisan = await getMyArtisanProfile(connectProfile.id);
	if (!artisan) redirect('/connect/artisan/setup');

	const portfolio = await getArtisanPortfolio(connectProfile.id);

	return (
		<div className='px-4 py-6'>
			<ArtisanPortfolioClient
				portfolio={portfolio}
				accessToken={auth.accessToken}
				profileId={connectProfile.id}
			/>
		</div>
	);
}

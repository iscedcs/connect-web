import { getAuthInfo } from '@/actions/auth';
import {
	getMyArtisanProfile,
	getArtisanServices,
} from '@/lib/services/artisan';
import { getConnectProfile } from '@/lib/services/profile';
import { redirect } from 'next/navigation';
import ArtisanServicesClient from '@/components/cardholder/artisan/services/artisan-services-client';
import { generateMetadata } from '@/lib/metadata';

export const metadata = generateMetadata({
	title: 'Manage Services',
	description: 'Add, edit and manage your artisan services.',
	keywords: ['artisan', 'services', 'manage'],
});

export default async function ArtisanServicesPage() {
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

	const services = await getArtisanServices(connectProfile.id);

	return (
		<main className='relative bg-black text-white min-h-screen'>
			<div className='p-4 pt-6'>
				<ArtisanServicesClient
					services={services}
					accessToken={authInfo.accessToken}
					profileId={connectProfile.id}
				/>
			</div>
		</main>
	);
}

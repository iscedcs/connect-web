import { redirect } from 'next/navigation';
import { getAuthInfo } from '@/actions/auth';
import {
	getMyArtisanProfile,
	getDirectoryCategories,
} from '@/lib/services/artisan';
import ArtisanSettingsClient from '@/components/cardholder/artisan/settings/artisan-settings-client';
import { getConnectProfile } from '@/lib/services/profile';

export const metadata = { title: 'Artisan Settings — ISCE Connect' };

export default async function ArtisanSettingsPage() {
	const auth = await getAuthInfo();
	if ('error' in auth || auth.isExpired) redirect('/');

	const connectProfile = await getConnectProfile();
	if (!connectProfile?.id) redirect('/');

	const [artisan, allCategories] = await Promise.all([
		getMyArtisanProfile(connectProfile.id),
		getDirectoryCategories(),
	]);

	if (!artisan) redirect('/connect/artisan/setup');

	return (
		<ArtisanSettingsClient
			artisan={artisan}
			allCategories={allCategories}
			profileId={connectProfile.id}
			accessToken={auth.accessToken}
		/>
	);
}

import { getAuthInfo } from '@/actions/auth';
import {
	getArtisanRequirements,
	getMyArtisanProfile,
} from '@/lib/services/artisan';
import { getConnectProfile } from '@/lib/services/profile';
import { redirect } from 'next/navigation';
import ArtisanSetupWizard from '@/components/cardholder/artisan/setup/artisan-setup-wizard';
import { generateMetadata } from '@/lib/metadata';

export const metadata = generateMetadata({
	title: 'Become an Artisan',
	description:
		'Set up your artisan profile on ISCE Connect and start offering your services.',
	keywords: ['artisan', 'setup', 'register', 'services'],
});

export default async function ArtisanSetupPage() {
	const [authInfo, connectProfile] = await Promise.all([
		getAuthInfo(),
		getConnectProfile(),
	]);

	const isAuthed = !('error' in authInfo) && !authInfo.isExpired;
	if (!isAuthed || !connectProfile?.id) {
		redirect('/dashboard');
	}

	// If already an artisan, redirect to artisan dashboard
	const existingArtisan = await getMyArtisanProfile(connectProfile.id);
	if (existingArtisan) {
		redirect('/connect/artisan');
	}

	const requirements = await getArtisanRequirements();

	return (
		<main className='relative bg-black text-white min-h-screen'>
			<div className='p-4 pt-6'>
				<ArtisanSetupWizard
					profileId={connectProfile.id}
					accessToken={authInfo.accessToken}
					categories={requirements?.categories ?? []}
					requirements={requirements}
				/>
			</div>
		</main>
	);
}

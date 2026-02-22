import { getAuthInfo } from '@/actions/auth';
import ProfileList from '@/components/settings/account/profile-list';
import { BASE_URLS, URLS } from '@/lib/const';
import { generateMetadata } from '@/lib/metadata';
import { redirect } from 'next/navigation';
import SubpageHeader from '@/components/shared/subpage-header';

export const metadata = generateMetadata({
	title: 'Profiles',
	description:
		'Manage your public contact card profiles. Create, edit, and organize multiple profiles for different purposes.',
	keywords: ['profiles', 'manage', 'contact cards', 'digital business card'],
});

export default async function ProfilesPage() {
	const auth = await getAuthInfo();

	if ('error' in auth || auth.isExpired) {
		redirect('/');
	}

	const accessToken = auth.accessToken;

	const res = await fetch(
		`${BASE_URLS.CONNECT_API}${URLS.multi_profile.all}`,
		{
			headers: { Authorization: `Bearer ${accessToken}` },
			cache: 'no-store',
		},
	);

	const json = await res.json();
	const profiles = json?.data?.profiles ?? [];

	return (
		<main className='min-h-screen bg-black text-white'>
			<SubpageHeader
				title='Your Profiles'
				backHref='/settings'
			/>
			<div className='p-4 space-y-6'>
				<p className='text-white/50 text-sm'>
					Manage your public contact card profiles.
				</p>
				<ProfileList
					profiles={profiles}
					accessToken={accessToken}
				/>
			</div>
		</main>
	);
}

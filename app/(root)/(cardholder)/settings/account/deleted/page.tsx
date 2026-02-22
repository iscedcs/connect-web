import { getAuthInfo } from '@/actions/auth';
import DeletedProfileList from '@/components/settings/account/deleted-profile-list';
import { BASE_URLS, URLS } from '@/lib/const';

export default async function DeletedProfilesPage() {
	const auth = await getAuthInfo();
	const accessToken = auth?.accessToken;

	const res = await fetch(
		`${BASE_URLS.CONNECT_API}${URLS.multi_profile.all}?include_deleted=true`,
		{
			headers: { Authorization: `Bearer ${accessToken}` },
			cache: 'no-store',
		},
	);

	const json = await res.json();
	const deletedProfiles = (json?.data?.profiles || []).filter(
		(p: any) => p.deletedAt,
	);

	return (
		<main className='min-h-screen bg-black text-white p-4 pt-24'>
			<h1 className='text-2xl font-bold'>Deleted profiles</h1>
			<p className='text-white/50 text-sm mt-1 mb-6'>
				Restore previously deleted profiles.
			</p>

			<DeletedProfileList
				profiles={deletedProfiles}
				accessToken={accessToken!}
			/>
		</main>
	);
}

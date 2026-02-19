import { getAuthInfo } from '@/actions/auth';
import CloneProfileButton from '@/components/settings/account/clone-profile-button';
import { NEXT_PUBLIC_CONNECT_API_ORIGIN, URLS } from '@/lib/const';

export default async function CloneProfilePage({
	params,
}: {
	params: Promise<{ profileId: string }>;
}) {
	const auth = await getAuthInfo();
	const accessToken = auth?.accessToken;

	// Fetch the profile we want to clone
	const res = await fetch(
		`${NEXT_PUBLIC_CONNECT_API_ORIGIN}${URLS.multi_profile.one.replace(
			'{profileId}',
			(await params).profileId,
		)}`,
		{
			headers: { Authorization: `Bearer ${accessToken}` },
			cache: 'no-store',
		},
	);

	const json = await res.json();
	const profile = json?.data?.profile;

	return (
		<main className='min-h-screen bg-black text-white p-4 pt-24'>
			<h1 className='text-2xl font-bold'>Clone profile</h1>
			<p className='text-white/50 text-sm mt-1 mb-6'>
				Create a new profile using an existing one as a template.
			</p>

			{!profile ?
				<p className='text-white/40'>Profile not found.</p>
			:	<>
					<div className='p-4 bg-neutral-900 rounded-xl border border-white/10'>
						<p className='font-semibold'>{profile.name}</p>
						<p className='text-white/40 text-sm'>
							{profile.position}
						</p>
						{profile.profilePhoto && (
							<img
								title='profile photo'
								src={profile.profilePhoto}
								className='w-24 h-24 rounded-lg mt-3 object-cover'
							/>
						)}
					</div>

					<CloneProfileButton
						profileId={(await params).profileId}
						accessToken={accessToken!}
					/>
				</>
			}
		</main>
	);
}

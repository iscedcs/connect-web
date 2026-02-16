import SpotifyMotionGrid from '@/components/customer/spotify/spotify-motion-grid';
import { LeftIcon } from '@/lib/icons';
import { fetchPublicProfileBySlug } from '@/lib/services/public-profile';
import Link from 'next/link';

export default async function SlugPublicSpotifyPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const profileLookup = await fetchPublicProfileBySlug(slug);

	if (!profileLookup.data) {
		return (
			<div className='min-h-screen bg-black text-white p-6'>
				Profile not found
			</div>
		);
	}

	const profileData = profileLookup.data;
	const spotifyItems =
		profileData.spotify?.length ?
			profileData.spotify
		:	(profileData.links ?? []).filter((l: any) =>
				l.url?.includes('open.spotify.com'),
			);

	return (
		<main className='min-h-screen bg-black text-white px-4 pt-6 pb-20'>
			<div className='mb-6'>
				<Link
					href={`/p/${slug}`}
					className='text-white/50 text-sm'
				>
					<LeftIcon />
				</Link>

				<h1 className='text-3xl font-extrabold mt-2'>Spotify</h1>
				<p className='text-white/60 text-sm mt-1'>
					Music & playlists shared by {profileData.profile?.name}
				</p>
			</div>

			<SpotifyMotionGrid items={spotifyItems} />
		</main>
	);
}

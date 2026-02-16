import { fetchPublicProfileBySlug } from '@/lib/services/public-profile';
import SocialsMotion from '@/components/customer/socials/socials-motion';
import { LeftIcon } from '@/lib/icons';
import Link from 'next/link';

export default async function SlugPublicSocialsPage({
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

	const socials = profileLookup.data.socials ?? [];

	return (
		<main className='min-h-screen bg-black text-white px-4 pt-6 pb-20'>
			<div className='mb-6'>
				<Link
					href={`/p/${slug}`}
					className='text-white/50 text-sm'
				>
					<LeftIcon />
				</Link>

				<h1 className='text-3xl font-extrabold mt-2'>Socials</h1>
				<p className='text-white/60 text-sm mt-1'>
					Connect with {profileLookup.data.profile?.name}
				</p>
			</div>

			<SocialsMotion socials={socials} />
		</main>
	);
}

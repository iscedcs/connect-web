import FilesMotionGrid from '@/components/customer/files/files-motion-grid';
import { LeftIcon } from '@/lib/icons';
import { fetchPublicProfileBySlug } from '@/lib/services/public-profile';
import Link from 'next/link';

export default async function SlugPublicFilesPage({
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

	const files = profileLookup.data.files ?? [];

	return (
		<main className='min-h-screen bg-black text-white px-4 pt-6 pb-20'>
			<div className='mb-6'>
				<Link
					href={`/p/${slug}`}
					className='text-white/50 text-sm'
				>
					<LeftIcon />
				</Link>

				<h1 className='text-3xl font-extrabold mt-2'>Files</h1>
				<p className='text-white/60 text-sm mt-1'>
					Shared documents & resources
				</p>
			</div>

			<FilesMotionGrid files={files} />
		</main>
	);
}

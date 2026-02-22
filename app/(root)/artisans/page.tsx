import {
	getDirectoryArtisans,
	getFeaturedArtisans,
	getDirectoryCategories,
} from '@/lib/services/artisan';
import ArtisanDirectoryClient from '@/components/customer/artisan-directory-client';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
	title: 'Artisan Directory — ISCE Connect',
	description:
		'Find skilled artisans and service providers near you on ISCE Connect.',
};

export default async function ArtisanDirectoryPage() {
	const [directoryData, featured, categories] = await Promise.all([
		getDirectoryArtisans({ page: 1, limit: 20 }),
		getFeaturedArtisans(6),
		getDirectoryCategories(),
	]);

	return (
		<ArtisanDirectoryClient
			initialData={directoryData}
			featured={featured}
			categories={categories}
		/>
	);
}

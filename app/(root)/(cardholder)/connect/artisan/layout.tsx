import { generateMetadata } from '@/lib/metadata';

export const metadata = generateMetadata({
	title: 'Artisan',
	description:
		'Manage your artisan profile, services, portfolio, bookings and earnings on LYNCON.',
	keywords: ['artisan', 'services', 'bookings', 'portfolio'],
});

export default function ArtisanLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}

import { generateMetadata } from '@/lib/metadata';

export const metadata = generateMetadata({
	title: 'Threads',
	description:
		'Manage your booking conversations and proposals on ISCE Connect.',
	keywords: ['threads', 'artisan', 'bookings', 'conversations'],
});

export default function ThreadsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}

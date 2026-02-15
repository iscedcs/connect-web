import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { MarqueeBanner } from '@/components/landing/marquee-banner';
import { Features } from '@/components/landing/features';
import { HowItWorks } from '@/components/landing/how-it-works';
import { ProfilePreview } from '@/components/landing/profile-preview';
import { ModulesShowcase } from '@/components/landing/modules-showcase';
import { Comparison } from '@/components/landing/comparison';
import { UseCases } from '@/components/landing/use-cases';
import { Testimonials } from '@/components/landing/testimonials';
import { CtaSection } from '@/components/landing/cta-section';
import { Footer } from '@/components/landing/footer';
import { Metadata, Viewport } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { headers } from 'next/headers';
import { verifyToken } from '@/lib/verify-jwt';

export const metadata: Metadata = {
	title: 'Connect | The Future of Networking - ISCE Digital Concept',
	description:
		'Connect is a modern digital networking solution. Share your entire professional identity with a single tap. NFC cards, QR codes, and rich digital profiles.',
	keywords: [
		'digital business card',
		'NFC networking',
		'QR code profile',
		'ISCE',
		'Connect',
		'professional networking',
	],
};

export const viewport: Viewport = {
	themeColor: '#000000',
	width: 'device-width',
	initialScale: 1,
};
type SearchParams = Promise<{ id?: string; type?: string; scan?: string }>;

export default async function HomePage({
	searchParams,
}: {
	children: React.ReactNode;
	searchParams: SearchParams;
}) {
	const { id, type, scan } = await searchParams;

	if (id) {
		// Record card interaction before redirecting
		try {
			const headersList = await headers();
			const referrer = headersList.get('referer') || null;
			const connectApi =
				process.env.CONNECT_API_URL ||
				process.env.NEXT_PUBLIC_CONNECT_API_URL;

			if (connectApi) {
				fetch(`${connectApi}/api/card-interactions/record`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						deviceId: id,
						deviceType: type || null,
						referrer: referrer,
						method: scan === '1' ? 'SCAN' : 'TAP',
					}),
				}).catch(() => {});
			}
		} catch {}

		redirect(`/customer/${id}`);
	}

	// Check if user has a valid session
	const cookieStore = await cookies();
	const accessToken = cookieStore.get('accessToken')?.value;
	let isLoggedIn = false;
	if (accessToken) {
		const { valid } = await verifyToken(accessToken);
		if (valid) {
			isLoggedIn = true;
		}
	}

	return (
		<main className='relative overflow-x-hidden'>
			<Navbar isLoggedIn={isLoggedIn} />
			<Hero />
			<MarqueeBanner />
			<Features />
			<HowItWorks />
			<ProfilePreview />
			<ModulesShowcase />
			<Comparison />
			<UseCases />
			<Testimonials />
			<CtaSection />
			<Footer />
		</main>
	);
}

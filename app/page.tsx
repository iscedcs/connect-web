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
type SearchParams = Promise<{ id: string }>;

export default async function HomePage({
	searchParams,
}: {
	children: React.ReactNode;
	searchParams: SearchParams;
}) {
	const { id } = await searchParams;

	if (id) {
		redirect(`/customer/${id}`);
	}

	return (
		<main className='relative'>
			<Navbar />
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

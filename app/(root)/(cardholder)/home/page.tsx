import MaxWidthWrapper from '@/components/maxwidth-wrapper';
import HomeClientSection from '@/components/pages/cardholder/home/homesectionclient';
import { generateMetadata } from '@/lib/metadata';

export const metadata = generateMetadata({
	title: 'Home',
	description:
		'Your Connect home — manage your digital profile and connections.',
	keywords: ['home', 'connect', 'profile'],
});

export default function HomePageTestSection() {
	return (
		<main className='bg-black text-white min-h-screen'>
			<MaxWidthWrapper className='py-6 space-y-6'>
				<HomeClientSection />
			</MaxWidthWrapper>
		</main>
	);
}

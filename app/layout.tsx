import type { Metadata, Viewport } from 'next';
import { Inter_Tight } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import NextTopLoader from 'nextjs-toploader';
import { generateMetadata as generateMetadataUtil } from '@/lib/metadata';

const interTight = Inter_Tight({
	variable: '--inter-tight',
	subsets: ['latin'],
	weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
};

export const metadata: Metadata = generateMetadataUtil({
	title: undefined, // Will use default app name
	description:
		'A dynamic digital lifestyle platform for seamless connectivity and modern lifestyle management.',
	keywords: [
		'ISCE Connect',
		'digital lifestyle',
		'contact management',
		'NFC',
		'QR code',
		'digital wallet',
		'wearables',
	],
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body className={`${interTight} antialiased min-h-svh bg-black`}>
				<NextTopLoader
					color='#ffffff'
					showSpinner={false}
				/>
				{children}

				<Toaster
					position='bottom-right'
					richColors
					expand
					closeButton
					duration={3000}
				/>
			</body>
		</html>
	);
}

// 444444;
// bg-primary: 000000;
// text-primary:6F6F70

// 868686;
// 151515;

import type { Metadata } from 'next';

// Base URL for metadata generation (server-side)
const baseUrl =
	process.env.NEXT_PUBLIC_URL || 'https://connect-web-eight.vercel.app';
const appName = 'Connect by ISCE';
const defaultDescription = 'A dynamic digital lifestyle platform.';

interface GenerateMetadataOptions {
	title?: string;
	description?: string;
	image?: string;
	url?: string;
	type?: 'website' | 'article' | 'profile';
	noIndex?: boolean;
	keywords?: string[];
}

/**
 * Generates dynamic metadata for pages
 * @param options - Metadata options
 * @returns Metadata object for Next.js
 */
export function generateMetadata({
	title,
	description = defaultDescription,
	image,
	url,
	type = 'website',
	noIndex = false,
	keywords = [],
}: GenerateMetadataOptions = {}): Metadata {
	const fullTitle = title ? `${title} | ${appName}` : appName;
	const metadataUrl = url || baseUrl;
	const ogImage = image || `${baseUrl}/cover-image.png`;

	return {
		title: fullTitle,
		description,
		keywords: keywords.length > 0 ? keywords : undefined,
		authors: [{ name: 'ISCE' }],
		creator: 'ISCE',
		publisher: 'ISCE',
		robots:
			noIndex ?
				{
					index: false,
					follow: false,
					googleBot: {
						index: false,
						follow: false,
					},
				}
			:	{
					index: true,
					follow: true,
					googleBot: {
						index: true,
						follow: true,
						'max-video-preview': -1,
						'max-image-preview': 'large',
						'max-snippet': -1,
					},
				},
		openGraph: {
			type,
			title: fullTitle,
			description,
			url: metadataUrl,
			siteName: appName,
			images: [
				{
					url: ogImage,
					width: 1200,
					height: 630,
					alt: fullTitle,
				},
			],
			locale: 'en_US',
		},
		twitter: {
			card: 'summary_large_image',
			title: fullTitle,
			description,
			images: [ogImage],
			creator: '@ISCE',
		},
		alternates: {
			canonical: metadataUrl,
		},
		metadataBase: new URL(baseUrl),
	};
}

/**
 * Generates metadata for dynamic routes with parameters
 * @param params - Route parameters
 * @param options - Metadata options
 * @returns Metadata object or a function that returns metadata
 */
export function generateDynamicMetadata(
	params: Record<string, string | string[] | undefined>,
	options: GenerateMetadataOptions = {},
): Metadata {
	// Extract dynamic segments for title/description
	const segments = Object.values(params).flat().filter(Boolean) as string[];

	if (segments.length > 0 && !options.title) {
		const segmentTitle = segments
			.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
			.join(' ');
		options.title = segmentTitle;
	}

	return generateMetadata(options);
}

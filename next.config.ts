import type { NextConfig } from 'next';

function domain(url?: string) {
	if (!url) return '';
	try {
		return new URL(url).origin;
	} catch {
		return '';
	}
}

const API_DOMAINS = [
	process.env.NEXT_PUBLIC_URL,
	process.env.NEXT_PUBLIC_AUTH_WEB_URL,
	process.env.NEXT_PUBLIC_AUTH_API_URL,
	process.env.NEXT_PUBLIC_CONNECT_API_URL,
	process.env.NEXT_PUBLIC_EVENTS_API_URL,
	process.env.NEXT_PUBLIC_EVENTS_WEB_URL,
]
	.map(domain)
	.filter(Boolean)
	.join(' ');

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'cdn.sanity.io',
			},
			{
				protocol: 'https',
				hostname: 'fra1.digitaloceanspaces.com',
			},
			{
				protocol: 'https',
				hostname: 'isce-image.fra1.digitaloceanspaces.com',
			},
			{
				protocol: 'https',
				hostname: 'isce-image.fra1.cdn.digitaloceanspaces.com',
			},
			{
				protocol: 'https',
				hostname: 'encrypted-tbn0.gstatic.com',
			},
			{
				protocol: 'https',
				hostname: 'isce-image-uploader.s3.us-east-1.amazonaws.com',
			},
			{
				protocol: 'https',
				hostname: 'i.ytimg.com',
			},
			{
				protocol: 'https',
				hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
			},
		],
	},
	async headers() {
		return [
			{
				// Apply security headers to all routes
				source: '/:path*',
				headers: [
					{
						key: 'X-DNS-Prefetch-Control',
						value: 'on',
					},
					// Prevent clickjacking attacks
					{
						key: 'X-Frame-Options',
						value: 'SAMEORIGIN',
					},
					// Prevent MIME type sniffing
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff',
					},
					// Enable XSS protection (legacy browsers)
					{
						key: 'X-XSS-Protection',
						value: '1; mode=block',
					},
					// Referrer policy - control referrer information
					{
						key: 'Referrer-Policy',
						value: 'strict-origin-when-cross-origin',
					},
					// Permissions policy - restrict browser features
					{
						key: 'Permissions-Policy',
						value: 'camera=(self), microphone=(self), geolocation=(self), interest-cohort=()',
					},
					// Content Security Policy - prevent XSS and injection attacks
					{
						key: 'Content-Security-Policy',
						value: [
							"default-src 'self'",
							"script-src 'self' 'unsafe-eval' 'unsafe-inline' 'wasm-unsafe-eval' https://maps.googleapis.com https://*.googleapis.com",
							"worker-src 'self' blob:",
							"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
							"font-src 'self' https://fonts.gstatic.com data:",
							"img-src 'self' data: https://cdn.sanity.io https://*.digitaloceanspaces.com https://*.s3.amazonaws.com https://*.amazonaws.com https://i.ytimg.com https://*.blob.vercel-storage.com https://*.gstatic.com https://www.google.com blob:",
							`connect-src 'self' ${API_DOMAINS} https://*.googleapis.com https://maps.googleapis.com https://open.spotify.com https://*.s3.amazonaws.com https://*.digitaloceanspaces.com  https://cdn.sanity.io https://*.blob.vercel-storage.com blob:`,
							"frame-src 'self' https://*.google.com https://*.googleapis.com https://www.youtube.com https://open.spotify.com https://fra1.digitaloceanspaces.com",
							"object-src 'none'",
							"base-uri 'self'",
							"form-action 'self'",
							"frame-ancestors 'none'",
							'upgrade-insecure-requests',
						].join('; '),
					},
					// Strict Transport Security - force HTTPS
					{
						key: 'Strict-Transport-Security',
						value: 'max-age=31536000; includeSubDomains; preload',
					},
				],
			},
		];
	},
};

export default nextConfig;

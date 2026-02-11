/**
 * Detect social platform from URL or platform name
 */

import { ICONS } from '@/lib/const';

export interface PlatformInfo {
	platform: string;
	icon: string;
	displayName: string;
	actionUrl: string;
}

// Platform detection patterns
const PLATFORM_PATTERNS: Record<string, RegExp> = {
	instagram: /instagram\.com|instagr\.am/i,
	facebook: /facebook\.com|fb\.com|fb\.me/i,
	twitter: /twitter\.com|x\.com/i,
	linkedin: /linkedin\.com/i,
	tiktok: /tiktok\.com/i,
	youtube: /youtube\.com|youtu\.be/i,
	snapchat: /snapchat\.com/i,
	telegram: /t\.me|telegram\.org/i,
	pinterest: /pinterest\.com/i,
	reddit: /reddit\.com/i,
	discord: /discord\.gg|discord\.com/i,
	github: /github\.com/i,
	spotify: /spotify\.com|open\.spotify\.com/i,
	whatsapp: /wa\.me|whatsapp\.com/i,
	threads: /threads\.net/i,
	behance: /behance\.net/i,
	flickr: /flickr\.com/i,
	medium: /medium\.com/i,
	stackoverflow: /stackoverflow\.com/i,
	tumblr: /tumblr\.com/i,
	vk: /vk\.com/i,
	wechat: /wechat\.com|weixin\.qq\.com/i,
	xing: /xing\.com/i,
};

// Platform icons mapping - uses ICONS from const.ts
export const PLATFORM_ICONS: Record<string, string> = {
	instagram: ICONS.instagram,
	facebook: ICONS.facebook,
	twitter: ICONS.facebook, // fallback - add twitter svg later
	linkedin: ICONS.linkedin,
	tiktok: ICONS.tiktok,
	youtube: ICONS.youtube,
	snapchat: ICONS.link, // fallback
	telegram: ICONS.telegram,
	pinterest: ICONS.pinterest,
	reddit: ICONS.reddit,
	discord: ICONS.link, // fallback - add discord svg later
	github: ICONS.github,
	spotify: ICONS.spotify,
	whatsapp: ICONS.whatsapp,
	threads: ICONS.link, // fallback - add threads svg later
	behance: ICONS.behance,
	flickr: ICONS.flickr,
	medium: ICONS.medium,
	stackoverflow: ICONS.stackoverflow,
	tumblr: ICONS.tumblr,
	vk: ICONS.vk,
	wechat: ICONS.wechat,
	xing: ICONS.xing,
	email: ICONS.email,
	text: ICONS.link,
	website: ICONS.link,
	default: ICONS.link,
};

// Display names for platforms
const PLATFORM_DISPLAY_NAMES: Record<string, string> = {
	instagram: 'Instagram',
	facebook: 'Facebook',
	twitter: 'X (Twitter)',
	linkedin: 'LinkedIn',
	tiktok: 'TikTok',
	youtube: 'YouTube',
	snapchat: 'Snapchat',
	telegram: 'Telegram',
	pinterest: 'Pinterest',
	reddit: 'Reddit',
	discord: 'Discord',
	github: 'GitHub',
	spotify: 'Spotify',
	whatsapp: 'WhatsApp',
	threads: 'Threads',
	behance: 'Behance',
	flickr: 'Flickr',
	medium: 'Medium',
	stackoverflow: 'Stack Overflow',
	tumblr: 'Tumblr',
	vk: 'VK',
	wechat: 'WeChat',
	xing: 'Xing',
	email: 'Email',
	text: 'Link',
	website: 'Website',
};

// Social platforms that should appear in the Socials section
export const SOCIAL_PLATFORMS = [
	'instagram',
	'facebook',
	'twitter',
	'linkedin',
	'tiktok',
	'youtube',
	'snapchat',
	'telegram',
	'pinterest',
	'threads',
	'whatsapp',
	'github',
	'reddit',
	'discord',
	'behance',
	'flickr',
	'medium',
	'stackoverflow',
	'tumblr',
	'vk',
	'wechat',
	'xing',
];

/**
 * Detect the platform from a URL
 */
export function detectPlatformFromUrl(url: string): string | null {
	if (!url) return null;

	for (const [platform, pattern] of Object.entries(PLATFORM_PATTERNS)) {
		if (pattern.test(url)) {
			return platform;
		}
	}

	return null;
}

/**
 * Get platform info from social item
 */
export function getPlatformInfo(social: {
	platform?: string;
	url?: string;
	username?: string;
	icon?: string;
}): PlatformInfo {
	const { platform, url, username } = social;

	// First try to detect from URL
	const detectedPlatform = url ? detectPlatformFromUrl(url) : null;

	// Use detected platform, or fall back to the provided platform field
	const finalPlatform =
		detectedPlatform || platform?.toLowerCase() || 'website';

	// Get the icon
	const icon = PLATFORM_ICONS[finalPlatform] || PLATFORM_ICONS.default;

	// Get display name
	const displayName =
		PLATFORM_DISPLAY_NAMES[finalPlatform] || platform || 'Link';

	// Build the action URL
	let actionUrl = url || '';

	// Handle special cases for action URLs
	if (finalPlatform === 'whatsapp' && !url?.startsWith('http')) {
		// Format phone number for WhatsApp
		const phone = (url || username || '').replace(/\D/g, '');
		actionUrl = `https://wa.me/${phone}`;
	} else if (finalPlatform === 'email' && !url?.startsWith('mailto:')) {
		actionUrl = `mailto:${url || username}`;
	} else if (
		!url?.startsWith('http') &&
		!url?.startsWith('mailto:') &&
		!url?.startsWith('tel:')
	) {
		// Try to make it a valid URL if it looks like a domain
		if (url?.includes('.')) {
			actionUrl = `https://${url}`;
		}
	}

	return {
		platform: finalPlatform,
		icon,
		displayName,
		actionUrl,
	};
}

/**
 * Check if a platform is a social platform
 */
export function isSocialPlatform(platform: string): boolean {
	return SOCIAL_PLATFORMS.includes(platform.toLowerCase());
}

/**
 * Process socials array and categorize them
 */
export function processSocials(socials: any[]): {
	socialItems: any[];
	otherItems: any[];
} {
	const socialItems: any[] = [];
	const otherItems: any[] = [];

	socials.forEach((social) => {
		const platformInfo = getPlatformInfo(social);

		const processedItem = {
			...social,
			detectedPlatform: platformInfo.platform,
			displayName: platformInfo.displayName,
			icon: platformInfo.icon,
			actionUrl: platformInfo.actionUrl,
		};

		if (isSocialPlatform(platformInfo.platform)) {
			socialItems.push(processedItem);
		} else {
			otherItems.push(processedItem);
		}
	});

	return { socialItems, otherItems };
}

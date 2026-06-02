/**
 * These routes don't require authentication
 * @type {string[]}
 */
export const publicRoutes = [
	'/',
	'/customer',
	'/p',
	'/terms',
	'/privacy',
	'/support',
	'/card/connect',
	'/artisans',
];

/**
 * Protected routes that require authentication
 * @type {string[]}
 */
export const protectedRoutes = [
	'/dashboard',
	'/bvn',
	'/connect',
	'/devices',
	'/otp',
	'/profile',
	'/profiles',
	'/device',
	'/settings',
	'/wallet',
	'/wearables',
	'/notifications',
	'/analytics',
	'/manage-account',
	'/cp',
];

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
	'/device',
	'/settings',
	'/wallet',
	'/wearables',
	'/notifications',
	'/analytics',
];

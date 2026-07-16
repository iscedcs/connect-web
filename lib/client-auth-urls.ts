/**
 * Client-side auth URL builders for landing page buttons and other "use client" components.
 * Uses only NEXT_PUBLIC_* env vars (safe for client components).
 *
 * After authentication, isce-auth-web redirects the user to /auth/callback
 * with an authorization code. The callback exchanges it for tokens and
 * redirects to `redirectAfterAuth`.
 */

function buildCallbackUrl(redirectAfterAuth: string): string {
	const appBase = process.env.NEXT_PUBLIC_URL || '';
	return `${appBase}/auth/callback?redirect=${encodeURIComponent(redirectAfterAuth)}`;
}

export function getSignInUrl(
	redirectAfterAuth = '/dashboard',
	referralCode?: string,
): string {
	const authBase =
		process.env.NEXT_PUBLIC_AUTH_WEB_URL || 'https://test-auth.isce.app';
	const redirectTarget = referralCode
		? `${redirectAfterAuth}${redirectAfterAuth.includes('?') ? '&' : '?'}referralCode=${encodeURIComponent(referralCode)}`
		: redirectAfterAuth;
	const callback = buildCallbackUrl(redirectTarget);
	if (referralCode) {
		return `${authBase}/sign-in?referralCode=${encodeURIComponent(referralCode)}&redirect_uri=${encodeURIComponent(callback)}&prompt=login`;
	}
	return `${authBase}/sign-in?redirect_uri=${encodeURIComponent(callback)}&prompt=login`;
}

export function getSignUpUrl(
	redirectAfterAuth = '/dashboard',
	referralCode?: string,
): string {
	const authBase =
		process.env.NEXT_PUBLIC_AUTH_WEB_URL || 'https://test-auth.isce.app';
	const redirectTarget = referralCode
		? `${redirectAfterAuth}${redirectAfterAuth.includes('?') ? '&' : '?'}referralCode=${encodeURIComponent(referralCode)}`
		: redirectAfterAuth;
	const callback = buildCallbackUrl(redirectTarget);
	if (referralCode) {
		return `${authBase}/sign-up?referralCode=${encodeURIComponent(referralCode)}&redirect_uri=${encodeURIComponent(callback)}&prompt=login`;
	}
	return `${authBase}/sign-up?redirect_uri=${encodeURIComponent(callback)}&prompt=login`;
}

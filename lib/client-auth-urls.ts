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

export function getSignInUrl(redirectAfterAuth = '/dashboard'): string {
	const authBase = process.env.NEXT_PUBLIC_AUTH_WEB_URL || '';
	const callback = buildCallbackUrl(redirectAfterAuth);
	return `${authBase}/sign-in?redirect_uri=${encodeURIComponent(callback)}&prompt=login`;
}

export function getSignUpUrl(redirectAfterAuth = '/dashboard'): string {
	const authBase = process.env.NEXT_PUBLIC_AUTH_WEB_URL || '';
	const callback = buildCallbackUrl(redirectAfterAuth);
	return `${authBase}/sign-up?redirect_uri=${encodeURIComponent(callback)}&prompt=login`;
}

///lib/auth-urls.ts
export function buildAuthLoginUrl(redirectTo: string) {
	const base = (process.env.AUTH_BASE_URL || '').trim();
	const path = process.env.AUTH_LOGIN_PATH || '/sign-in';

	const envAppBase = process.env.NEXT_PUBLIC_URL || '';
	const appBase = resolveAppBase(envAppBase, redirectTo);

	// Allowlist domain check (prevent open redirect)
	const isSameOrigin =
		redirectTo.startsWith(appBase) || redirectTo.startsWith('/');
	const safeRedirect = isSameOrigin ? redirectTo : '/';

	const callbackBase = appBase || envAppBase;
	const callbackUrl = new URL('/auth/callback', callbackBase);
	callbackUrl.searchParams.set('redirect', safeRedirect);

	const url = new URL(path, base);
	url.searchParams.set('redirect_uri', callbackUrl.toString());
	url.searchParams.set('prompt', 'login');
	return url.toString();
}

function resolveAppBase(envAppBase: string, redirectTo: string) {
	if (redirectTo.startsWith('http://') || redirectTo.startsWith('https://')) {
		try {
			return new URL(redirectTo).origin;
		} catch {
			return envAppBase;
		}
	}
	return envAppBase;
}

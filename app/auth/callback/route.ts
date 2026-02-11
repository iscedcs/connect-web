import { verifyToken } from '@/lib/verify-jwt';
import { NextResponse } from 'next/server';

function buildSignInRedirect(callbackUrl: URL): string {
	const base = (process.env.AUTH_BASE_URL || '').trim();
	const signInUrl = new URL('/sign-in', base);
	signInUrl.searchParams.set('redirect_uri', callbackUrl.toString());
	signInUrl.searchParams.set('prompt', 'login');
	return signInUrl.toString();
}

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const token = searchParams.get('token');
	const redirectTo = searchParams.get('redirect') || '/';

	const requestOrigin = new URL(req.url).origin;
	const appBase = process.env.NEXT_PUBLIC_URL || requestOrigin;

	const safeRedirect =
		redirectTo.startsWith('/') ||
		redirectTo.startsWith(appBase) ||
		redirectTo.startsWith(requestOrigin);
	const safe = safeRedirect ? redirectTo : '/';

	const callbackUrl = new URL('/auth/callback', appBase);
	callbackUrl.searchParams.set('redirect', safe);

	if (!token) {
		console.warn('[auth/callback] No token in URL, redirecting to sign-in');
		return NextResponse.redirect(buildSignInRedirect(callbackUrl));
	}

	const { valid } = await verifyToken(token);

	if (!valid) {
		console.warn(
			'[auth/callback] Token verification failed, redirecting to sign-in',
		);
		return NextResponse.redirect(buildSignInRedirect(callbackUrl));
	}

	let maxAge = 60 * 60 * 24;
	try {
		const payload = JSON.parse(atob(token.split('.')[1]));
		if (payload?.exp) {
			const nowSec = Math.floor(Date.now() / 1000);
			const remaining = Math.max(0, payload.exp - nowSec);
			maxAge = Math.min(remaining, 60 * 60 * 24 * 7);
		}
	} catch {}

	const absoluteRedirect = new URL(safe, appBase).toString();

	const isProduction = process.env.NODE_ENV === 'production';
	const res = NextResponse.redirect(absoluteRedirect, { status: 302 });

	res.cookies.set('accessToken', token, {
		httpOnly: true,
		secure: isProduction,
		sameSite: isProduction ? 'none' : 'lax',
		path: '/',
		maxAge,
	});

	return res;
}

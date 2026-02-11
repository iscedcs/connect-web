// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { protectedRoutes } from './routes';
import { buildAuthLoginUrl } from './lib/auth-urls';
import { verifyToken } from './lib/verify-jwt';

function isProtectedPath(pathname: string) {
	return protectedRoutes.some((route) =>
		route === '/' ?
			pathname === '/'
		:	pathname === route || pathname.startsWith(route + '/'),
	);
}

export async function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;

	// Allow static/assets/callback/etc.
	if (
		pathname.startsWith('/_next/') ||
		pathname.startsWith('/favicon') ||
		pathname.startsWith('/robots.txt') ||
		pathname.startsWith('/sitemap.xml') ||
		pathname.startsWith('/auth/callback') ||
		pathname.startsWith('/auth/logout') ||
		pathname.startsWith('/auth/login') ||
		pathname.startsWith('/api/auth')
	) {
		return NextResponse.next();
	}

	// Only guard protected paths
	if (!isProtectedPath(pathname)) {
		return NextResponse.next();
	}
	if (pathname.startsWith('/api')) return NextResponse.next();

	// Build a clean redirect URL (strip any stale "token" param so it
	// never leaks into the auth redirect chain)
	function getCleanRedirectUrl() {
		const url = new URL(req.nextUrl.toString());
		url.searchParams.delete('token');
		return url.origin + url.pathname + (url.search || '');
	}

	const token = req.cookies.get('accessToken')?.value;
	if (!token) {
		return NextResponse.redirect(buildAuthLoginUrl(getCleanRedirectUrl()));
	}

	const { valid, payload } = await verifyToken(token);

	if (!valid || !payload) {
		return NextResponse.redirect(buildAuthLoginUrl(getCleanRedirectUrl()));
	}
	return NextResponse.next();
}

export const config = {
	matcher: [
		'/((?!_next|[^?]*\\.(?:css|js|png|jpg|jpeg|svg|ico|webp|woff2?|ttf)).*)',
	],
};

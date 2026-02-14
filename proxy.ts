// proxy.ts
import { NextRequest, NextResponse } from 'next/server';
import { protectedRoutes } from './routes';
import { buildAuthLoginUrl } from './lib/auth-urls';
import { verifyToken } from './lib/verify-jwt';
import { setCsrfCookie, validateCsrf } from './lib/csrf';
import { authLogger } from './lib/auth-logger';

function isProtectedPath(pathname: string) {
	return protectedRoutes.some((route) =>
		route === '/' ?
			pathname === '/'
		:	pathname === route || pathname.startsWith(route + '/'),
	);
}

export async function proxy(req: NextRequest) {
	const { pathname } = req.nextUrl;

	// -- CSRF validation for state-changing API requests --
	const csrfError = validateCsrf(req);
	if (csrfError) return csrfError;

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
		const response = NextResponse.next();
		setCsrfCookie(response, req.cookies.get('csrf_token')?.value);
		return response;
	}

	// Only guard protected paths
	if (!isProtectedPath(pathname)) {
		const response = NextResponse.next();
		setCsrfCookie(response, req.cookies.get('csrf_token')?.value);
		return response;
	}
	if (pathname.startsWith('/api')) {
		const response = NextResponse.next();
		setCsrfCookie(response, req.cookies.get('csrf_token')?.value);
		return response;
	}

	// Build a clean redirect URL (strip any stale "token" param so it
	// never leaks into the auth redirect chain)
	function getCleanRedirectUrl() {
		const url = new URL(req.nextUrl.toString());
		url.searchParams.delete('token');
		url.searchParams.delete('code');
		return url.origin + url.pathname + (url.search || '');
	}

	const token = req.cookies.get('accessToken')?.value;
	const refreshToken = req.cookies.get('refreshToken')?.value;

	authLogger.log('PROXY', `Auth check for ${pathname}`, {
		hasAccessToken: !!token,
		hasRefreshToken: !!refreshToken,
	});

	if (!token && !refreshToken) {
		authLogger.warn('PROXY', `No tokens — redirecting to auth login`);
		return NextResponse.redirect(buildAuthLoginUrl(getCleanRedirectUrl()));
	}

	if (token) {
		const { valid, payload } = await verifyToken(token);
		if (valid && payload) {
			authLogger.log(
				'PROXY',
				`Access token valid for user ${(payload as any)?.id || 'unknown'}`,
			);
			const response = NextResponse.next();
			setCsrfCookie(response, req.cookies.get('csrf_token')?.value);
			return response;
		}
		authLogger.warn('PROXY', `Access token invalid/expired`);
	}

	// Access token missing or invalid — try refreshing
	if (refreshToken) {
		authLogger.log('PROXY', `Attempting token refresh`);
		try {
			const authApiBase =
				process.env.AUTH_API_URL ||
				process.env.NEXT_PUBLIC_AUTH_API_URL;
			const refreshRes = await fetch(`${authApiBase}/auth/refresh`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ refreshToken }),
			});

			if (refreshRes.ok) {
				authLogger.log('PROXY', `Token refresh successful`);
				const data = await refreshRes.json();
				const isProduction = process.env.NODE_ENV === 'production';

				let accessMaxAge = 60 * 60;
				try {
					const payload = JSON.parse(
						atob(data.accessToken.split('.')[1]),
					);
					if (payload?.exp) {
						const nowSec = Math.floor(Date.now() / 1000);
						accessMaxAge = Math.max(payload.exp - nowSec, 0);
					}
				} catch {}

				const response = NextResponse.next();
				response.cookies.set('accessToken', data.accessToken, {
					httpOnly: true,
					secure: isProduction,
					sameSite: 'lax',
					path: '/',
					maxAge: accessMaxAge,
				});
				response.cookies.set('refreshToken', data.refreshToken, {
					httpOnly: true,
					secure: isProduction,
					sameSite: 'lax',
					path: '/',
					maxAge: 60 * 60 * 24 * 7,
				});
				setCsrfCookie(response, req.cookies.get('csrf_token')?.value);
				return response;
			} else {
				authLogger.error('PROXY', `Token refresh failed`, {
					status: refreshRes.status,
				});
			}
		} catch (error) {
			authLogger.error(
				'PROXY',
				`Token refresh error: ${error instanceof Error ? error.message : 'unknown'}`,
			);
		}
	}

	authLogger.warn('PROXY', `All auth attempts failed — redirecting to login`);
	return NextResponse.redirect(buildAuthLoginUrl(getCleanRedirectUrl()));
}

export const config = {
	matcher: [
		'/((?!_next|[^?]*\\.(?:css|js|png|jpg|jpeg|svg|ico|webp|woff2?|ttf)).*)',
	],
};

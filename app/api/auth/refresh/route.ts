import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { authLogger } from '@/lib/auth-logger';

/**
 * Refreshes the access token using the stored refresh token.
 * Called by proxy or client when the access token is expired.
 * Returns new access + refresh tokens and updates cookies.
 */
export async function POST() {
	try {
		const cookieStore = await cookies();
		const refreshToken = cookieStore.get('refreshToken')?.value;

		authLogger.log('REFRESH', `Token refresh requested`, {
			hasRefreshToken: !!refreshToken,
		});

		if (!refreshToken) {
			authLogger.warn('REFRESH', 'No refresh token in cookies');
			return NextResponse.json(
				{ error: 'No refresh token' },
				{ status: 401 },
			);
		}

		const authApiBase =
			process.env.AUTH_API_URL || process.env.NEXT_PUBLIC_AUTH_API_URL;

		authLogger.log('REFRESH', `Calling POST ${authApiBase}/auth/refresh`);

		const res = await fetch(`${authApiBase}/auth/refresh`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ refreshToken }),
		});

		if (!res.ok) {
			authLogger.error('REFRESH', `Backend refresh failed`, {
				status: res.status,
			});
			const errRes = NextResponse.json(
				{ error: 'Refresh failed' },
				{ status: 401 },
			);
			errRes.cookies.set('accessToken', '', { maxAge: 0, path: '/' });
			errRes.cookies.set('refreshToken', '', { maxAge: 0, path: '/' });
			return errRes;
		}

		const data = await res.json();
		authLogger.log('REFRESH', `Token refresh successful, updating cookies`);
		const isProduction = process.env.NODE_ENV === 'production';

		let accessMaxAge = 60 * 60; // 1 hour default
		try {
			const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
			if (payload?.exp) {
				const nowSec = Math.floor(Date.now() / 1000);
				accessMaxAge = Math.max(payload.exp - nowSec, 0);
			}
		} catch {}

		const okRes = NextResponse.json({ success: true });

		okRes.cookies.set('accessToken', data.accessToken, {
			httpOnly: true,
			secure: isProduction,
			sameSite: 'lax',
			path: '/',
			maxAge: accessMaxAge,
		});

		okRes.cookies.set('refreshToken', data.refreshToken, {
			httpOnly: true,
			secure: isProduction,
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 60 * 24 * 7, // 7 days
		});

		return okRes;
	} catch (error) {
		authLogger.error(
			'REFRESH',
			`Unexpected error: ${error instanceof Error ? error.message : 'unknown'}`,
		);
		return NextResponse.json({ error: 'Invalid request' }, { status: 500 });
	}
}

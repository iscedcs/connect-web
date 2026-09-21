import {
	isAuthEndpoint,
	isBrowser,
	redirectToSignIn,
	refreshSession,
} from '@/lib/client-session';

/**
 * Reads the CSRF token from the csrf_token cookie.
 */
export function getCsrfToken(): string | undefined {
	if (typeof document === 'undefined') return undefined;
	const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
	return match ? decodeURIComponent(match[1]) : undefined;
}

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

/** Attach the current CSRF token to a state-changing request. */
function withCsrfHeader(init?: RequestInit): RequestInit | undefined {
	const method = (init?.method || 'GET').toUpperCase();
	if (SAFE_METHODS.includes(method)) return init;

	const csrfToken = getCsrfToken();
	if (!csrfToken) return init;

	const headers = new Headers(init?.headers);
	headers.set('X-CSRF-Token', csrfToken);
	return { ...init, headers };
}

/**
 * A fetch wrapper that automatically includes the CSRF token header
 * on state-changing requests (POST, PUT, PATCH, DELETE), and recovers
 * from an expired access token.
 *
 * On a 401 it refreshes the session once and replays the request. The
 * `/api/*` routes these calls target authenticate from the cookie
 * server-side, so the replay picks up the new token without the caller
 * knowing anything happened. The CSRF header is rebuilt for the replay
 * because the refresh response can rotate that cookie too.
 */
export async function csrfFetch(
	input: RequestInfo | URL,
	init?: RequestInit,
): Promise<Response> {
	const res = await fetch(input, withCsrfHeader(init));

	if (
		res.status !== 401 ||
		!isBrowser() ||
		isAuthEndpoint(typeof input === 'string' ? input : String(input))
	) {
		return res;
	}

	if (await refreshSession()) {
		return fetch(input, withCsrfHeader(init));
	}

	redirectToSignIn();
	return res;
}

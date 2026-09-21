/**
 * Client-side session recovery.
 *
 * `proxy.ts` already refreshes an expired access token on protected page
 * navigations, but it deliberately skips `/api/*`, and cross-origin calls to
 * the Connect API never touch it at all. So a token that expires between full
 * page loads takes down every client-side request until the user reloads —
 * which is what surfaces as "it randomly asked me to sign in again".
 *
 * These helpers give the client the same recovery path the edge middleware
 * has. Everything here no-ops on the server: `lib/services/http.ts` is
 * imported by server components too, and there is no browser session to
 * recover there.
 */

import { getSignInUrl } from '@/lib/client-auth-urls';

const REFRESH_ENDPOINT = '/api/auth/refresh';
const TOKEN_ENDPOINT = '/api/auth/token';

/** Endpoints that must never trigger a refresh-and-retry of themselves. */
const AUTH_ENDPOINTS = [REFRESH_ENDPOINT, TOKEN_ENDPOINT, '/auth/callback'];

export function isBrowser(): boolean {
	return typeof window !== 'undefined';
}

export function isAuthEndpoint(url?: string | null): boolean {
	if (!url) return false;
	return AUTH_ENDPOINTS.some((p) => url.includes(p));
}

/**
 * Concurrent 401s are the normal case — a page usually fires several requests
 * at once, and they all fail together. Without this, each one would kick off
 * its own refresh, and the losers would race to write cookies with tokens the
 * auth service has already rotated away. One refresh, shared by all waiters.
 */
let inFlightRefresh: Promise<boolean> | null = null;

/** Once the refresh itself fails there is nothing left to recover; stop trying. */
let sessionIsDead = false;

export async function refreshSession(): Promise<boolean> {
	if (!isBrowser() || sessionIsDead) return false;

	if (inFlightRefresh) return inFlightRefresh;

	inFlightRefresh = (async () => {
		try {
			const res = await fetch(REFRESH_ENDPOINT, {
				method: 'POST',
				credentials: 'same-origin',
				cache: 'no-store',
			});
			if (!res.ok) {
				sessionIsDead = true;
				return false;
			}
			return true;
		} catch {
			// A network blip is not a dead session — let the next 401 retry.
			return false;
		}
	})();

	try {
		return await inFlightRefresh;
	} finally {
		inFlightRefresh = null;
	}
}

/**
 * Read the current access token back out of the (httpOnly) cookie.
 *
 * Needed because some client components receive `accessToken` as a prop from
 * a server component and pass it as an explicit `Authorization` header. After
 * a refresh that prop is stale, so replaying the original request unchanged
 * would just 401 again with the same dead token.
 */
export async function getFreshAccessToken(): Promise<string | null> {
	if (!isBrowser()) return null;
	try {
		const res = await fetch(TOKEN_ENDPOINT, {
			credentials: 'same-origin',
			cache: 'no-store',
		});
		if (!res.ok) return null;
		const json = await res.json();
		return json?.accessToken ?? null;
	} catch {
		return null;
	}
}

let redirecting = false;

/** Send the user to sign-in, preserving where they were. Fires at most once. */
export function redirectToSignIn(): void {
	if (!isBrowser() || redirecting) return;
	redirecting = true;
	const current = window.location.pathname + window.location.search;
	window.location.href = getSignInUrl(current);
}

/** Test seam — resets the module-level guards. */
export function __resetSessionState(): void {
	inFlightRefresh = null;
	sessionIsDead = false;
	redirecting = false;
}

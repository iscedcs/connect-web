import {
	jwtVerify,
	decodeJwt as joseDecodeJwt,
	decodeProtectedHeader,
	importJWK,
	type JWK,
	type JWTPayload,
} from 'jose';
import { authLogger } from './auth-logger';

const KEY_CACHE_TTL_MS = 10 * 60 * 1000;
const JWKS_REFETCH_COOLDOWN_MS = 30 * 1000;
const JWKS_FETCH_TIMEOUT_MS = 5000;

type VerificationKey = CryptoKey | Uint8Array;

let keyCache = new Map<string, VerificationKey>();
let keyCacheExpiresAt = 0;
let lastFetchAt = 0;
let inflightFetch: Promise<void> | null = null;

export function getJwksUri(): string | null {
	if (process.env.JWKS_URI) return process.env.JWKS_URI;
	const base = process.env.AUTH_API_URL || process.env.NEXT_PUBLIC_AUTH_API_URL;
	if (!base) return null;
	return `${base.replace(/\/+$/, '')}/.well-known/jwks.json`;
}

async function fetchJwks(): Promise<void> {
	const uri = getJwksUri();
	if (!uri) {
		authLogger.error(
			'JWT',
			'Cannot fetch JWKS: set JWKS_URI or AUTH_API_URL',
		);
		return;
	}

	try {
		const res = await fetch(uri, {
			cache: 'no-store',
			signal: AbortSignal.timeout(JWKS_FETCH_TIMEOUT_MS),
		});
		if (!res.ok) {
			authLogger.warn('JWT', `JWKS fetch failed: HTTP ${res.status}`);
			return;
		}
		const data = (await res.json()) as { keys?: JWK[] };
		if (!Array.isArray(data.keys)) {
			authLogger.warn('JWT', 'JWKS response has no keys array');
			return;
		}

		const fresh = new Map<string, VerificationKey>();
		for (const jwk of data.keys) {
			if (!jwk.kid || jwk.kty !== 'RSA') continue;
			try {
				fresh.set(jwk.kid, await importJWK(jwk, 'RS256'));
			} catch (err) {
				authLogger.warn('JWT', `Could not import JWK ${jwk.kid}`, {
					error: err instanceof Error ? err.message : 'unknown',
				});
			}
		}

		// Replace wholesale so a rotated-out key stops being trusted.
		keyCache = fresh;
		keyCacheExpiresAt = Date.now() + KEY_CACHE_TTL_MS;
	} catch (err) {
		authLogger.error('JWT', 'JWKS fetch error', {
			error: err instanceof Error ? err.message : 'unknown',
		});
	}
}

async function getJwksKey(kid: string): Promise<VerificationKey | null> {
	const now = Date.now();

	if (now < keyCacheExpiresAt) {
		const cached = keyCache.get(kid);
		if (cached) return cached;
	}

	// Requests that arrive while a fetch is running wait for it rather than
	// being refused by the cooldown (which failed the first burst after a
	// cold start).
	if (inflightFetch) {
		await inflightFetch;
		return keyCache.get(kid) ?? null;
	}

	// An unknown kid may only trigger a refetch once per cooldown, so a
	// stream of forged tokens cannot turn this app into a JWKS flood.
	if (now - lastFetchAt < JWKS_REFETCH_COOLDOWN_MS) return null;

	lastFetchAt = now;
	inflightFetch = fetchJwks().finally(() => {
		inflightFetch = null;
	});
	await inflightFetch;

	return keyCache.get(kid) ?? null;
}

/** Test hook: reset module state. */
export function resetJwksStateForTests(): void {
	keyCache = new Map();
	keyCacheExpiresAt = 0;
	lastFetchAt = 0;
	inflightFetch = null;
}

/**
 * Verifies an access token. HS256 (legacy, shared secret) and RS256
 * (JWKS) are both accepted while the migration is in flight; each branch
 * is pinned to its own algorithm so a token can never be verified with the
 * wrong kind of key. If JWT_ISSUER / JWT_AUDIENCE are set they are enforced.
 */
export async function verifyToken(
	token: string,
): Promise<{ valid: boolean; payload?: JWTPayload }> {
	if (!token || typeof token !== 'string') return { valid: false };

	const claimChecks = {
		...(process.env.JWT_ISSUER ? { issuer: process.env.JWT_ISSUER } : {}),
		...(process.env.JWT_AUDIENCE
			? {
					audience: process.env.JWT_AUDIENCE.split(',')
						.map((a) => a.trim())
						.filter(Boolean),
				}
			: {}),
	};

	try {
		const { alg, kid } = decodeProtectedHeader(token);

		if (alg === 'HS256') {
			const secret = process.env.JWT_SECRET;
			if (!secret) {
				authLogger.warn('JWT', 'HS256 token but JWT_SECRET is not set');
				return { valid: false };
			}
			const { payload } = await jwtVerify(
				token,
				new TextEncoder().encode(secret),
				{ algorithms: ['HS256'], ...claimChecks },
			);
			return { valid: true, payload };
		}

		if (alg === 'RS256') {
			if (!kid) {
				authLogger.warn('JWT', "RS256 token has no 'kid' header");
				return { valid: false };
			}
			const key = await getJwksKey(kid);
			if (!key) {
				authLogger.warn('JWT', `No JWKS key for kid ${kid}`);
				return { valid: false };
			}
			const { payload } = await jwtVerify(token, key, {
				algorithms: ['RS256'],
				...claimChecks,
			});
			return { valid: true, payload };
		}

		authLogger.warn('JWT', `Unsupported JWT algorithm: ${String(alg)}`);
		return { valid: false };
	} catch (err) {
		authLogger.warn('JWT', 'Token verification failed', {
			error: err instanceof Error ? err.message : 'unknown',
		});
		return { valid: false };
	}
}

export function isTokenExpired(token: string | null): boolean {
	if (!token) return true;
	const decoded = decodeJwt(token);
	if (!decoded?.exp) return true;
	const nowSec = Math.floor(Date.now() / 1000);
	return (decoded.exp as number) <= nowSec;
}

export function decodeJwt<T = any>(jwt?: string): T | null {
	if (!jwt) return null;
	try {
		return joseDecodeJwt(jwt) as T;
	} catch {
		return null;
	}
}

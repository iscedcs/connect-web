import { jwtVerify, decodeJwt as joseDecodeJwt } from 'jose';

const getJwtSecret = () => {
	const secret = process.env.JWT_SECRET;
	if (!secret) {
		throw new Error('JWT_SECRET environment variable is not set');
	}
	return new TextEncoder().encode(secret);
};

export async function verifyToken(token: string) {
	try {
		const secret = getJwtSecret();
		const { payload } = await jwtVerify(token, secret);
		return { valid: true, payload };
	} catch {
		return { valid: false };
	}
}

export function isTokenExpired(token: string | null): boolean {
	if (!token) return true;
	const decoded = decodeJwt(token);
	if (!decoded?.exp) return true;
	const nowSec = Math.floor(Date.now() / 1000);
	return decoded.exp <= nowSec;
}

/**
 * Decode a JWT payload without signature verification.
 * Use verifyToken() for authenticated requests.
 */
export function decodeJwt<T = any>(jwt?: string): T | null {
	if (!jwt) return null;
	try {
		return joseDecodeJwt(jwt) as T;
	} catch {
		return null;
	}
}

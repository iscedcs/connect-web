'use server';

import { cookies } from 'next/headers';
import { format } from 'date-fns';
import { verifyToken } from '@/lib/verify-jwt';

/**
 * Server action to get the current access token and user info
 * Reads from the accessToken cookie and verifies the JWT signature
 */
export async function getAuthInfo(): Promise<AuthInfo | AuthError> {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get('accessToken')?.value;

	if (!accessToken) {
		return { error: 'Not authenticated - no access token found' };
	}

	try {
		const { valid, payload } = await verifyToken(accessToken);

		if (!valid || !payload) {
			return { error: 'Invalid or expired token' };
		}

		const userPayload = payload as unknown as UserInfo;
		const willExpireAt =
			userPayload.exp ?
				format(new Date(userPayload.exp * 1000), 'yyyy-MM-dd HH:mm:ss')
			:	null;

		return {
			accessToken,
			user: userPayload,
			expiresAt: userPayload.exp || 0,
			isExpired: false, // verifyToken already checks expiry
			willExpireAt,
		};
	} catch (error) {
		return { error: 'Invalid token format' };
	}
}

/**
 * Server action to check if user is authenticated
 * Returns true if valid access token exists and is not expired
 */
export async function isAuthenticated(): Promise<boolean> {
	const authInfo = await getAuthInfo();

	if ('error' in authInfo) {
		return false;
	}

	return !authInfo.isExpired;
}

/**
 * Server action to get just the user info without the token
 */
export async function getCurrentUser(): Promise<UserInfo | null> {
	const authInfo = await getAuthInfo();

	if ('error' in authInfo || authInfo.isExpired) {
		return null;
	}

	return authInfo.user;
}

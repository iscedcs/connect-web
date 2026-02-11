import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/verify-jwt';

export async function getBearerAndUserId(): Promise<{
	token?: string;
	userId?: string;
	error?: Response;
}> {
	const token = (await cookies()).get('accessToken')?.value;

	if (!token) {
		return {
			error: new Response(JSON.stringify({ message: 'Unauthorized' }), {
				status: 401,
				headers: { 'content-type': 'application/json' },
			}),
		};
	}

	const { valid, payload } = await verifyToken(token);

	if (!valid || !payload) {
		return {
			error: new Response(
				JSON.stringify({ message: 'Invalid or expired token' }),
				{
					status: 401,
					headers: { 'content-type': 'application/json' },
				},
			),
		};
	}

	const userId =
		(payload as any).id || (payload as any).sub || (payload as any).userId;

	if (!userId) {
		return {
			error: new Response(
				JSON.stringify({ message: 'User id missing in token' }),
				{
					status: 401,
					headers: { 'content-type': 'application/json' },
				},
			),
		};
	}

	return { token, userId };
}

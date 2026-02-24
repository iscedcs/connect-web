import { NextResponse } from 'next/server';
import { getBearerAndUserId } from '@/app/api/connect/_lib/auth';

/**
 * POST /api/notifications/unregister
 * Proxies FCM token removal to isce-auth backend (DELETE /device/session/:fcmToken).
 */
export async function POST(req: Request) {
	const { token, error } = await getBearerAndUserId();
	if (error) return error;

	const body = await req.json();
	const fcmToken = body.fcmToken;

	if (!fcmToken) {
		return NextResponse.json(
			{ error: 'fcmToken is required' },
			{ status: 400 },
		);
	}

	const authApiBase =
		process.env.AUTH_API_URL || process.env.NEXT_PUBLIC_AUTH_API_URL;

	if (!authApiBase) {
		return NextResponse.json(
			{ error: 'Auth API URL not configured' },
			{ status: 500 },
		);
	}

	try {
		const res = await fetch(
			`${authApiBase}/device/session/${encodeURIComponent(fcmToken)}`,
			{
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		);

		if (res.status === 204) {
			return NextResponse.json({ success: true });
		}

		const data = await res.json();
		return NextResponse.json(data, { status: res.status });
	} catch {
		return NextResponse.json(
			{ error: 'Failed to unregister device' },
			{ status: 500 },
		);
	}
}

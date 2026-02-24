import { NextResponse } from 'next/server';
import { getBearerAndUserId } from '@/app/api/connect/_lib/auth';

/**
 * POST /api/notifications/register
 * Proxies FCM token registration to isce-auth backend (POST /device/session).
 * connect-nest reads FCM tokens from isce-auth via AuthClientService.getFcmTokens().
 */
export async function POST(req: Request) {
	const { token, error } = await getBearerAndUserId();
	if (error) return error;

	const body = await req.json();

	const authApiBase =
		process.env.AUTH_API_URL || process.env.NEXT_PUBLIC_AUTH_API_URL;

	if (!authApiBase) {
		return NextResponse.json(
			{ error: 'Auth API URL not configured' },
			{ status: 500 },
		);
	}

	try {
		const res = await fetch(`${authApiBase}/device/session`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				fcmToken: body.fcmToken,
				platform: body.platform || 'web',
				deviceName: body.deviceInfo || 'Web Browser',
			}),
		});

		const data = await res.json();
		return NextResponse.json(data, { status: res.status });
	} catch {
		return NextResponse.json(
			{ error: 'Failed to register device' },
			{ status: 500 },
		);
	}
}

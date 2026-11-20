/**
 * GET /api/subscriptions/limits
 * The user's effective limits right now — the backend falls back to FREE
 * limits for expired, cancelled or past-due subscriptions.
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getMyLimits } from '@/lib/services/subscription';

export async function GET() {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get('accessToken')?.value;

	if (!accessToken) {
		return NextResponse.json(
			{ success: false, message: 'Not authenticated' },
			{ status: 401 },
		);
	}

	const limits = await getMyLimits(accessToken);

	return NextResponse.json({ success: true, data: { limits } });
}

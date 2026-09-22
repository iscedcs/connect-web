/**
 * GET /api/subscriptions/me
 * Returns the authenticated user's subscription, or null when they have
 * not selected a plan yet (the upstream 404s in that case).
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getMySubscription } from '@/lib/services/subscription';

export async function GET() {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get('accessToken')?.value;

	if (!accessToken) {
		return NextResponse.json(
			{ success: false, message: 'Not authenticated' },
			{ status: 401 },
		);
	}

	const subscription = await getMySubscription(accessToken);

	return NextResponse.json({ success: true, data: subscription });
}

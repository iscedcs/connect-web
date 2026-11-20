/**
 * POST /api/subscriptions/cancel
 * Cancels the current paid subscription. Access continues until the end of
 * the billing period already paid for.
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { cancelSubscription } from '@/lib/services/subscription';

export async function POST() {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get('accessToken')?.value;

	if (!accessToken) {
		return NextResponse.json(
			{ success: false, message: 'Not authenticated' },
			{ status: 401 },
		);
	}

	const result = await cancelSubscription(accessToken);
	return NextResponse.json(result, { status: result.status });
}

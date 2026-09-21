/**
 * GET /api/subscriptions/plans
 * Lists active plans, cheapest first. Public upstream, so this still
 * returns data when the session has expired.
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getPlans } from '@/lib/services/subscription';

export async function GET() {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get('accessToken')?.value;

	const plans = await getPlans(accessToken);

	return NextResponse.json({ success: true, data: { plans } });
}

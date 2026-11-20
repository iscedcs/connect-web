/**
 * GET /api/subscriptions/quote?planKey=PRO_PLUS
 * What paying for a plan would charge now, shown before the user leaves for
 * Paystack. A mid-cycle upgrade is prorated and keeps the renewal date.
 * Answers with connect-nest's own status (409 carries its reason).
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCheckoutQuote } from '@/lib/services/subscription';
import { PLAN_ORDER, type PlanKey } from '@/lib/types/subscription';

export async function GET(req: NextRequest) {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get('accessToken')?.value;

	if (!accessToken) {
		return NextResponse.json(
			{ success: false, message: 'Not authenticated' },
			{ status: 401 },
		);
	}

	const planKey = req.nextUrl.searchParams.get('planKey');
	if (!planKey || !PLAN_ORDER.includes(planKey as PlanKey) || planKey === 'FREE') {
		return NextResponse.json(
			{ success: false, message: 'A valid paid planKey is required' },
			{ status: 400 },
		);
	}

	const result = await getCheckoutQuote(accessToken, planKey as PlanKey);
	return NextResponse.json(result, { status: result.status });
}

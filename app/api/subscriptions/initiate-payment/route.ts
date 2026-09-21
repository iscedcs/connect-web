/**
 * POST /api/subscriptions/initiate-payment
 * Starts a checkout session for a paid plan. The upstream gateway
 * integration is still pending, so this can legitimately return
 * `success: false` with an explanatory message — pass it through.
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { initiatePayment } from '@/lib/services/subscription';
import { PLAN_ORDER, type PlanKey } from '@/lib/types/subscription';

export async function POST(req: NextRequest) {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get('accessToken')?.value;

	if (!accessToken) {
		return NextResponse.json(
			{ success: false, message: 'Not authenticated' },
			{ status: 401 },
		);
	}

	const body = await req.json().catch(() => ({}));
	const { planKey } = body as { planKey?: string };

	if (!planKey || !PLAN_ORDER.includes(planKey as PlanKey)) {
		return NextResponse.json(
			{ success: false, message: 'A valid planKey is required' },
			{ status: 400 },
		);
	}

	const result = await initiatePayment(accessToken, planKey as PlanKey);

	// 200 even when the gateway is unavailable: the client renders
	// `message` as an informational state, not a failed request.
	return NextResponse.json(result, { status: 200 });
}

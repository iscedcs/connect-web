/**
 * POST /api/subscriptions/select-plan
 * First-time plan selection. Paid plans start a 3-month trial upstream
 * rather than charging; the upstream 409s if a subscription already exists.
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { selectPlan } from '@/lib/services/subscription';
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

	const result = await selectPlan(accessToken, planKey as PlanKey);
	return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

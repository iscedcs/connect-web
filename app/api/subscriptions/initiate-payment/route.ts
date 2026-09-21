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
	const { planKey, callbackUrl } = body as {
		planKey?: string;
		callbackUrl?: string;
	};

	if (!planKey || !PLAN_ORDER.includes(planKey as PlanKey)) {
		return NextResponse.json(
			{ success: false, message: 'A valid planKey is required' },
			{ status: 400 },
		);
	}

	// Build the return URL server-side from this request's own origin rather
	// than trusting the client's: it is handed to a payment gateway, so an
	// attacker-supplied value would be an open redirect off the back of a
	// checkout.
	const origin = req.nextUrl.origin;
	const safeCallback =
		callbackUrl && callbackUrl.startsWith('/')
			? `${origin}${callbackUrl}`
			: `${origin}/settings/subscription`;

	const result = await initiatePayment(
		accessToken,
		planKey as PlanKey,
		safeCallback,
	);

	// 200 even when the gateway is unavailable: the client renders
	// `message` as an informational state, not a failed request.
	return NextResponse.json(result, { status: 200 });
}

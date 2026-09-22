/**
 * POST /api/subscriptions/initiate-payment
 * Starts a Paystack checkout for a paid plan (connect-nest creates it through
 * wallet-nest). Answers with connect-nest's own status: 401 lets csrfFetch
 * refresh the session and retry, and 409 carries connect-nest's reason for
 * refusing (e.g. already on this plan outside the renewal window).
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

	if (!planKey || !PLAN_ORDER.includes(planKey as PlanKey) || planKey === 'FREE') {
		return NextResponse.json(
			{ success: false, message: 'A valid paid planKey is required' },
			{ status: 400 },
		);
	}

	// The return URL is handed to a payment gateway, so it is built here from
	// our own public origin and a same-site path, never taken whole from the
	// client (that would be an open redirect off the back of a checkout).
	// NEXT_PUBLIC_URL first, as in proxy.ts and the auth routes: behind the
	// nginx proxy the request's own origin is not guaranteed to be public.
	const origin = process.env.NEXT_PUBLIC_URL || req.nextUrl.origin;
	const path =
		callbackUrl && callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')
			? callbackUrl
			: '/settings/subscription';

	const result = await initiatePayment(
		accessToken,
		planKey as PlanKey,
		new URL(path, origin).toString(),
	);

	return NextResponse.json(result, { status: result.status });
}

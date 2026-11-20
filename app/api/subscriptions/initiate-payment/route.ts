/**
 * POST /api/subscriptions/initiate-payment
 * Body: { planKey, callbackUrl?, method?: 'CARD' | 'WALLET', autoRenew? }
 *
 * CARD starts a Paystack checkout (connect-nest creates it through
 * wallet-nest). WALLET creates a wallet payment for the user to approve with
 * their PIN (see ../confirm-wallet-payment). Answers with connect-nest's own
 * status: 401 lets csrfFetch refresh the session and retry, and 409 carries
 * connect-nest's reason for refusing (e.g. already on this plan outside the
 * renewal window).
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { initiatePayment } from '@/lib/services/subscription';
import {
	PLAN_ORDER,
	type PaymentMethod,
	type PlanKey,
} from '@/lib/types/subscription';

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
	const { planKey, callbackUrl, method, autoRenew } = body as {
		planKey?: string;
		callbackUrl?: string;
		method?: unknown;
		autoRenew?: unknown;
	};

	if (!planKey || !PLAN_ORDER.includes(planKey as PlanKey) || planKey === 'FREE') {
		return NextResponse.json(
			{ success: false, message: 'A valid paid planKey is required' },
			{ status: 400 },
		);
	}
	if (method !== undefined && method !== 'CARD' && method !== 'WALLET') {
		return NextResponse.json(
			{ success: false, message: 'method must be CARD or WALLET' },
			{ status: 400 },
		);
	}
	if (autoRenew !== undefined && typeof autoRenew !== 'boolean') {
		return NextResponse.json(
			{ success: false, message: 'autoRenew must be true or false' },
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
		{ method: method as PaymentMethod | undefined, autoRenew },
	);

	return NextResponse.json(result, { status: result.status });
}

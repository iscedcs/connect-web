/**
 * POST /api/subscriptions/confirm-wallet-payment
 * Body: { paymentId, pin }
 *
 * Approves a plan payment created with `method: 'WALLET'` by
 * ../initiate-payment. wallet-nest checks the PIN, debits the wallet and
 * hands the payment to connect-nest before answering, so on success the
 * plan has usually changed already (`data.delivered`).
 *
 * Answers with wallet-nest's own status: 403 for a wrong or locked PIN,
 * 409 when the payment expired or connect-nest refused it (the wallet is
 * not charged), 401 for an expired session (csrfFetch refreshes and retries).
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { confirmServicePayment } from '@/lib/services/wallet';

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
	const { paymentId, pin } = body as { paymentId?: unknown; pin?: unknown };

	if (typeof paymentId !== 'string' || !paymentId) {
		return NextResponse.json(
			{ success: false, message: 'paymentId is required' },
			{ status: 400 },
		);
	}
	if (typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
		return NextResponse.json(
			{ success: false, message: 'Enter your 4-digit wallet PIN' },
			{ status: 400 },
		);
	}

	const result = await confirmServicePayment(accessToken, paymentId, pin);
	return NextResponse.json(result, { status: result.status });
}

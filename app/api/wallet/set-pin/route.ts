/**
 * POST /api/wallet/set-pin
 * Proxy: sets the initial wallet PIN via wallet-nest.
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { setWalletPin } from '@/lib/services/wallet';

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
	const { walletId, pin } = body as { walletId?: string; pin?: string };

	if (!walletId || !pin) {
		return NextResponse.json(
			{ success: false, message: 'walletId and pin are required' },
			{ status: 400 },
		);
	}

	if (!/^\d{4,6}$/.test(pin)) {
		return NextResponse.json(
			{ success: false, message: 'PIN must be 4-6 digits' },
			{ status: 400 },
		);
	}

	const result = await setWalletPin(accessToken, walletId, pin);
	return NextResponse.json(result, {
		status: result.success ? 200 : 400,
	});
}

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { requestReferralCashOut } from '@/lib/services/referral';

/**
 * POST /api/referral/cash-out
 *
 * Cashes out the authenticated user's available referral earnings to their wallet.
 */
export async function POST() {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get('accessToken')?.value;
	if (!accessToken) {
		return NextResponse.json(
			{ success: false, message: 'Not authenticated' },
			{ status: 401 },
		);
	}

	const result = await requestReferralCashOut(accessToken);
	return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

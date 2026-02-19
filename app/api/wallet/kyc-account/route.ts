import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getMyKycBankAccount } from '@/lib/services/wallet';

/**
 * GET /api/wallet/kyc-account
 * Returns the KYC-verified bank account linked to the user's wallet.
 */
export async function GET() {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get('accessToken')?.value;
	if (!accessToken) {
		return NextResponse.json(
			{ success: false, message: 'Not authenticated' },
			{ status: 401 },
		);
	}

	const account = await getMyKycBankAccount(accessToken);
	if (!account) {
		return NextResponse.json({
			success: false,
			data: null,
			message: 'No KYC-verified bank account found',
		});
	}

	return NextResponse.json({ success: true, data: account });
}

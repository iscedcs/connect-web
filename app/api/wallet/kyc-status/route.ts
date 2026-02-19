/**
 * GET /api/wallet/kyc-status
 * Polls wallet-nest to recheck KYC verification status from Paystack.
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { recheckKycStatus } from '@/lib/services/wallet';

export async function GET() {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get('accessToken')?.value;

	if (!accessToken) {
		return NextResponse.json(
			{ success: false, message: 'Not authenticated' },
			{ status: 401 },
		);
	}

	const result = await recheckKycStatus(accessToken);
	return NextResponse.json(result);
}

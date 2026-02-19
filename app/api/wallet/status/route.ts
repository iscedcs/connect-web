/**
 * GET /api/wallet/status
 * Returns the authenticated user's NGN wallet status including KYC status
 * and virtual account info.
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getWalletStatus } from '@/lib/services/wallet';

export async function GET() {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get('accessToken')?.value;

	if (!accessToken) {
		return NextResponse.json(
			{ success: false, message: 'Not authenticated' },
			{ status: 401 },
		);
	}

	const status = await getWalletStatus(accessToken);

	return NextResponse.json({
		success: true,
		data: status,
	});
}

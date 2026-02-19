/**
 * GET /api/wallet/resolve-account?account_number=XXX&bank_code=YYY
 * Authenticated proxy: resolves a bank account number to the holder name.
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { resolveAccountNumber } from '@/lib/services/wallet';

export async function GET(req: NextRequest) {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get('accessToken')?.value;

	if (!accessToken) {
		return NextResponse.json(
			{ success: false, message: 'Not authenticated' },
			{ status: 401 },
		);
	}

	const { searchParams } = req.nextUrl;
	const accountNumber = searchParams.get('account_number');
	const bankCode = searchParams.get('bank_code');

	if (!accountNumber || !/^\d{10}$/.test(accountNumber)) {
		return NextResponse.json(
			{
				success: false,
				message: 'A valid 10-digit account number is required',
			},
			{ status: 400 },
		);
	}

	if (!bankCode || bankCode.trim().length === 0) {
		return NextResponse.json(
			{ success: false, message: 'Bank code is required' },
			{ status: 400 },
		);
	}

	const result = await resolveAccountNumber(
		accessToken,
		accountNumber,
		bankCode,
	);

	if (!result) {
		return NextResponse.json(
			{
				success: false,
				message: 'Could not resolve account. Please check details.',
			},
			{ status: 400 },
		);
	}

	return NextResponse.json({
		success: true,
		data: result,
	});
}

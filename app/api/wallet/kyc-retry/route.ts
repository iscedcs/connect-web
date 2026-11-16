/**
 * POST /api/wallet/kyc-retry
 * Server-side proxy: retries BVN verification with new/corrected information.
 * Only allowed when kycStatus is REJECTED or UNVERIFIED.
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/verify-jwt';
import {
	compactPhone,
	getMyWallets,
	NIGERIAN_MOBILE_PATTERN,
	retryBvnKyc,
} from '@/lib/services/wallet';

export async function POST(req: NextRequest) {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get('accessToken')?.value;

	if (!accessToken) {
		return NextResponse.json(
			{ success: false, message: 'Not authenticated' },
			{ status: 401 },
		);
	}

	const { valid, payload } = await verifyToken(accessToken);
	if (!valid || !payload) {
		return NextResponse.json(
			{ success: false, message: 'Invalid token' },
			{ status: 401 },
		);
	}

	const body = await req.json().catch(() => ({}));
	const { bvn, accountNumber, bankCode, phone: bodyPhone } = body as {
		bvn?: string;
		accountNumber?: string;
		bankCode?: string;
		phone?: string;
	};

	if (!bvn || !/^\d{11}$/.test(bvn)) {
		return NextResponse.json(
			{ success: false, message: 'A valid 11-digit BVN is required' },
			{ status: 400 },
		);
	}
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

	const cleanedPhone = bodyPhone ? compactPhone(bodyPhone) : '';
	if (cleanedPhone && !NIGERIAN_MOBILE_PATTERN.test(cleanedPhone)) {
		return NextResponse.json(
			{
				success: false,
				message: 'Enter a Nigerian mobile number, e.g. 08031234567',
			},
			{ status: 400 },
		);
	}

	const user = payload as any;
	const phone = cleanedPhone || user.phone || undefined;

	// Find the user's NGN wallet
	const wallets = await getMyWallets(accessToken);
	const ngnWallet = wallets.find((w: any) => w.currency === 'NGN');

	if (!ngnWallet) {
		return NextResponse.json(
			{ success: false, message: 'No wallet found. Please contact support.' },
			{ status: 404 },
		);
	}

	const result = await retryBvnKyc(accessToken, ngnWallet.id, {
		bvn,
		accountNumber,
		bankCode,
		firstName: user.firstName ?? undefined,
		lastName: user.lastName ?? undefined,
		phone,
	});

	return NextResponse.json(result, { status: result.success ? 200 : 500 });
}

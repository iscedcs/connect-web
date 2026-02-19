/**
 * POST /api/wallet/kyc
 * Server-side proxy: finds or creates the user's NGN wallet, then submits
 * their BVN to wallet-nest for async Paystack identity verification.
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/verify-jwt';
import {
	getMyWallets,
	createDefaultWallet,
	submitBvnKyc,
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

	// Decode JWT to get user profile fields required by Paystack
	const { valid, payload } = await verifyToken(accessToken);
	if (!valid || !payload) {
		return NextResponse.json(
			{ success: false, message: 'Invalid token' },
			{ status: 401 },
		);
	}

	const body = await req.json().catch(() => ({}));
	const { bvn, accountNumber, bankCode, dob } = body as {
		bvn?: string;
		accountNumber?: string;
		bankCode?: string;
		dob?: string;
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

	const user = payload as any;
	const firstName = user.firstName ?? '';
	const lastName = user.lastName ?? '';
	const email = user.email ?? '';
	const phone = user.phone ?? undefined;

	// Find or create the user's NGN wallet
	let wallets = await getMyWallets(accessToken);
	let ngnWallet = wallets.find((w: any) => w.currency === 'NGN');

	if (!ngnWallet) {
		ngnWallet = await createDefaultWallet(accessToken);
		if (!ngnWallet) {
			return NextResponse.json(
				{
					success: false,
					message: 'Failed to create wallet. Please try again.',
				},
				{ status: 500 },
			);
		}
	}

	// If already BVN_VERIFIED, short-circuit with a friendly message
	if (ngnWallet.kycStatus === 'BVN_VERIFIED') {
		return NextResponse.json({
			success: true,
			message:
				'Your wallet is already verified and ready to receive payments.',
			data: { kycStatus: 'BVN_VERIFIED' },
		});
	}

	const result = await submitBvnKyc(accessToken, ngnWallet.id, {
		bvn,
		accountNumber,
		bankCode,
		firstName,
		lastName,
		email,
		phone,
		dob,
	});

	return NextResponse.json(result, { status: result.success ? 200 : 500 });
}

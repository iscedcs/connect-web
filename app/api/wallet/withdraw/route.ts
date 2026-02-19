import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getWalletStatus, withdrawToKycAccount } from '@/lib/services/wallet';

const WITHDRAWAL_FEE = 100;
const MIN_WITHDRAWAL = 500;

/**
 * POST /api/wallet/withdraw
 * Body: { amount, pin, description? }
 *
 * Withdraws from the user's wallet to their KYC-verified bank account.
 * Minimum ₦500, flat ₦100 fee.
 */
export async function POST(req: NextRequest) {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get('accessToken')?.value;
	if (!accessToken) {
		return NextResponse.json(
			{ success: false, message: 'Not authenticated' },
			{ status: 401 },
		);
	}

	let body: { amount: number; pin: string; description?: string };
	try {
		body = await req.json();
	} catch {
		return NextResponse.json(
			{ success: false, message: 'Invalid request body' },
			{ status: 400 },
		);
	}

	const { amount, pin, description } = body;

	if (!amount || !pin) {
		return NextResponse.json(
			{ success: false, message: 'amount and pin are required' },
			{ status: 400 },
		);
	}
	if (amount < MIN_WITHDRAWAL) {
		return NextResponse.json(
			{
				success: false,
				message: `Minimum withdrawal is ₦${MIN_WITHDRAWAL.toLocaleString('en-NG')}`,
			},
			{ status: 400 },
		);
	}

	const walletStatus = await getWalletStatus(accessToken);
	if (!walletStatus?.walletId) {
		return NextResponse.json(
			{
				success: false,
				message: 'No wallet found. Please set up your wallet first.',
			},
			{ status: 400 },
		);
	}

	const totalRequired = amount + WITHDRAWAL_FEE;
	if (walletStatus.balance !== null && walletStatus.balance < totalRequired) {
		return NextResponse.json(
			{
				success: false,
				message: `Insufficient balance. You need ₦${totalRequired.toLocaleString('en-NG')} (₦${amount.toLocaleString('en-NG')} + ₦${WITHDRAWAL_FEE} fee)`,
			},
			{ status: 400 },
		);
	}

	const result = await withdrawToKycAccount(
		accessToken,
		walletStatus.walletId,
		{ amount, pin, description },
	);

	return NextResponse.json(result, {
		status: result.success ? 200 : 400,
	});
}

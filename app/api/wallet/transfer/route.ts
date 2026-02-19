import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { transferToUser, getWalletStatus } from '@/lib/services/wallet';

/**
 * POST /api/wallet/transfer
 * Body: { receiverUserId, amount, pin, description? }
 *
 * Resolves the sender's default wallet, then transfers to the receiver's
 * default wallet via wallet-nest.
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

	let body: {
		receiverUserId: string;
		amount: number;
		pin: string;
		description?: string;
	};
	try {
		body = await req.json();
	} catch {
		return NextResponse.json(
			{ success: false, message: 'Invalid request body' },
			{ status: 400 },
		);
	}

	const { receiverUserId, amount, pin, description } = body;

	if (!receiverUserId || !amount || !pin) {
		return NextResponse.json(
			{
				success: false,
				message: 'receiverUserId, amount, and pin are required',
			},
			{ status: 400 },
		);
	}

	if (amount <= 0) {
		return NextResponse.json(
			{ success: false, message: 'Amount must be greater than zero' },
			{ status: 400 },
		);
	}

	// Get sender's wallet ID
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

	const result = await transferToUser(accessToken, walletStatus.walletId, {
		receiverUserId,
		amount,
		pin,
		description,
	});

	return NextResponse.json(result, {
		status: result.success ? 200 : 400,
	});
}

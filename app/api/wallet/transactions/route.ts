/**
 * GET /api/wallet/transactions
 * Proxy for fetching the authenticated user's wallet transactions.
 * Requires walletId as a query parameter.
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getTransactions } from '@/lib/services/wallet';

export async function GET(request: NextRequest) {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get('accessToken')?.value;

	if (!accessToken) {
		return NextResponse.json(
			{ success: false, message: 'Not authenticated' },
			{ status: 401 },
		);
	}

	const { searchParams } = request.nextUrl;
	const walletId = searchParams.get('walletId');

	if (!walletId) {
		return NextResponse.json(
			{ success: false, message: 'walletId is required' },
			{ status: 400 },
		);
	}

	const page =
		searchParams.get('page') ? Number(searchParams.get('page')) : undefined;
	const perPage =
		searchParams.get('perPage') ?
			Number(searchParams.get('perPage'))
		:	undefined;

	const data = await getTransactions(accessToken, walletId, {
		page,
		perPage,
	});

	if (!data) {
		return NextResponse.json(
			{ success: false, message: 'Failed to fetch transactions' },
			{ status: 502 },
		);
	}

	return NextResponse.json({ success: true, data });
}

/**
 * GET /api/wallet/banks
 * Public proxy: returns the list of Nigerian banks from wallet-nest (Paystack).
 */
import { NextResponse } from 'next/server';
import { listBanks } from '@/lib/services/wallet';

export async function GET() {
	const banks = await listBanks();

	return NextResponse.json({
		success: true,
		data: banks,
	});
}

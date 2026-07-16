import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { applyForBusinessReferrer } from '@/lib/services/referral';

/**
 * POST /api/referral/business/apply
 *
 * Applies the authenticated user for Business Referrer status (negotiated
 * reward rate, subject to admin approval).
 */
export async function POST() {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get('accessToken')?.value;
	if (!accessToken) {
		return NextResponse.json(
			{ success: false, message: 'Not authenticated' },
			{ status: 401 },
		);
	}

	const result = await applyForBusinessReferrer(accessToken);
	return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

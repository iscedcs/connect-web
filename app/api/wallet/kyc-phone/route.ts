/**
 * POST /api/wallet/kyc-phone
 * Server-side proxy: adds a Nigerian mobile number to the customer's KYC
 * record so Paystack can issue their dedicated virtual account.
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
	addKycPhone,
	compactPhone,
	NIGERIAN_MOBILE_PATTERN,
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

	const body = await req.json().catch(() => ({}));
	const rawPhone = typeof body?.phone === 'string' ? body.phone : '';
	const phone = compactPhone(rawPhone);

	if (!NIGERIAN_MOBILE_PATTERN.test(phone)) {
		return NextResponse.json(
			{
				success: false,
				message: 'Enter a Nigerian mobile number, e.g. 08031234567',
			},
			{ status: 400 },
		);
	}

	const result = await addKycPhone(accessToken, phone);
	return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

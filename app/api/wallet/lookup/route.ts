import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { lookupByTag, lookupByDva } from '@/lib/services/wallet';

/**
 * GET /api/wallet/lookup?tag=... or ?dva=...
 * Looks up a transfer recipient by ISCE Tag or DVA account number.
 * No auth required for the downstream calls, but we gate on accessToken
 * so only logged-in users can use this feature.
 */
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
	const tag = searchParams.get('tag');
	const dva = searchParams.get('dva');

	if (!tag && !dva) {
		return NextResponse.json(
			{
				success: false,
				message: 'Provide ?tag= or ?dva= query parameter',
			},
			{ status: 400 },
		);
	}

	try {
		if (tag) {
			const result = await lookupByTag(tag);
			if (!result) {
				return NextResponse.json(
					{
						success: false,
						message: `No user found with ISCE Tag "${tag}"`,
					},
					{ status: 404 },
				);
			}
			return NextResponse.json({ success: true, data: result });
		}

		if (dva) {
			const result = await lookupByDva(dva, accessToken);
			if (!result) {
				return NextResponse.json(
					{
						success: false,
						message:
							'No ISCE wallet found with that account number',
					},
					{ status: 404 },
				);
			}
			return NextResponse.json({ success: true, data: result });
		}
	} catch (error) {
		console.error('[wallet/lookup] Error:', error);
		return NextResponse.json(
			{ success: false, message: 'Lookup failed. Please try again.' },
			{ status: 500 },
		);
	}
}

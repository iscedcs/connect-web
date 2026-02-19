/**
 * POST /api/wallet/set-tag
 * Proxy: sets the user's ISCE tag (username) via isce-auth.
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { setUserTag } from '@/lib/services/wallet';

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
	const { tag } = body as { tag?: string };

	if (!tag || tag.trim().length < 3) {
		return NextResponse.json(
			{
				success: false,
				message: 'Tag must be at least 3 characters',
			},
			{ status: 400 },
		);
	}

	// Normalize: lowercase, trim
	const normalized = tag.trim().toLowerCase();

	// Validate format: 3-30 chars, lowercase letters/numbers/underscores/hyphens
	if (!/^[a-z0-9_-]{3,30}$/.test(normalized)) {
		return NextResponse.json(
			{
				success: false,
				message:
					'Tag can only contain lowercase letters, numbers, underscores, and hyphens (3-30 characters)',
			},
			{ status: 400 },
		);
	}

	const result = await setUserTag(accessToken, normalized);
	return NextResponse.json(result, {
		status: result.success ? 200 : 400,
	});
}

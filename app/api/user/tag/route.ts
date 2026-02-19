/**
 * PATCH /api/user/tag
 * Proxies the ISCE Tag (username) change to isce-auth.
 * GET  /api/user/tag
 * Returns the current user's tag + last 5 tag history entries.
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const AUTH_API_URL = process.env.AUTH_API_URL ?? '';

export async function GET(_req: NextRequest) {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get('accessToken')?.value;
	if (!accessToken) {
		return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
	}

	const [meRes, historyRes] = await Promise.all([
		fetch(`${AUTH_API_URL}/user/me`, {
			headers: { Authorization: `Bearer ${accessToken}` },
			cache: 'no-store',
		}).catch(() => null),
		fetch(`${AUTH_API_URL}/user/tag-history`, {
			headers: { Authorization: `Bearer ${accessToken}` },
			cache: 'no-store',
		}).catch(() => null),
	]);

	const me = meRes?.ok ? await meRes.json().catch(() => null) : null;
	const history = historyRes?.ok ? await historyRes.json().catch(() => null) : null;

	return NextResponse.json({
		success: true,
		data: {
			currentTag: me?.data?.username ? `@${me.data.username}` : null,
			tagHistory: history?.data ?? [],
		},
	});
}

export async function PATCH(req: NextRequest) {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get('accessToken')?.value;
	if (!accessToken) {
		return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
	}

	const body = await req.json().catch(() => ({}));
	const { username } = body as { username?: string };

	if (!username) {
		return NextResponse.json(
			{ success: false, message: 'username is required' },
			{ status: 400 },
		);
	}

	const res = await fetch(`${AUTH_API_URL}/user`, {
		method: 'PATCH',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ username }),
		cache: 'no-store',
	}).catch(() => null);

	if (!res) {
		return NextResponse.json(
			{ success: false, message: 'Auth service unavailable' },
			{ status: 502 },
		);
	}

	const json = await res.json().catch(() => ({}));
	return NextResponse.json(json, { status: res.status });
}

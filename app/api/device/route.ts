import { NextResponse } from 'next/server';
import { BASE_URLS, URLS } from '@/lib/const';

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const userId = searchParams.get('userId');
	const authHeader = req.headers.get('authorization');
	if (!userId || !authHeader)
		return NextResponse.json(
			{ error: 'Missing credentials' },
			{ status: 400 },
		);

	const res = await fetch(
		`${BASE_URLS.AUTH_API}${URLS.device.user.replace('{userId}', userId)}`,
		{
			headers: { Authorization: authHeader, Accept: 'application/json' },
		},
	);
	const data = await res.json();
	return NextResponse.json(data);
}

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const id = searchParams.get('id');
	const deviceType = searchParams.get('type');
	const scan = searchParams.get('scan');

	if (!id) {
		return NextResponse.redirect(new URL('/', request.url));
	}

	// Record card interaction before redirecting (fire-and-forget)
	try {
		const referrer = request.headers.get('referer') || null;
		const connectApi =
			process.env.CONNECT_API_URL ||
			process.env.NEXT_PUBLIC_CONNECT_API_URL;

		if (connectApi) {
			fetch(`${connectApi}/api/card-interactions/record`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					deviceId: id,
					deviceType: deviceType || null,
					referrer: referrer,
					method: scan === '1' ? 'SCAN' : 'TAP',
				}),
			}).catch(() => {});
		}
	} catch {}

	return NextResponse.redirect(new URL(`/customer/${id}`, request.url));
}

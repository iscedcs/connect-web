import { BASE_URLS, URLS } from '@/lib/const';

/**
 * Public proxy for recording card interactions (no auth required).
 * Forwards the body to connect-nest's record endpoint.
 */
export async function POST(req: Request) {
	const base = BASE_URLS.CONNECT_API;
	if (!base) {
		return Response.json({ error: 'API not configured' }, { status: 500 });
	}

	const payload = await req.json().catch(() => ({}));

	const upstream = `${base}${URLS.card.record}`;

	const res = await fetch(upstream, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		body: JSON.stringify(payload),
	});

	const body = await res.text();
	return new Response(body, {
		status: res.status,
		headers: {
			'content-type':
				res.headers.get('content-type') ?? 'application/json',
		},
	});
}

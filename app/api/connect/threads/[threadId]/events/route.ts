import { BASE_URLS, URLS } from '@/lib/const';
import { getBearerAndUserId } from '../../../_lib/auth';

/**
 * SSE proxy: streams real-time thread events from connect-nest → browser.
 *
 * Browser opens EventSource('/api/connect/threads/{threadId}/events')
 * → this route reads the accessToken cookie, opens a server-side SSE
 *   connection to connect-nest with Authorization header, and pipes back.
 */
export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ threadId: string }> },
) {
	const got = await getBearerAndUserId();
	if (got.error) return got.error;

	const { token } = got;
	const { threadId } = await params;
	const base = BASE_URLS.CONNECT_API!;
	const upstream = `${base}${URLS.threads.events.replace('{threadId}', threadId)}`;

	const res = await fetch(upstream, {
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'text/event-stream',
		},
		cache: 'no-store',
	});

	if (!res.ok || !res.body) {
		const body = await res.text();
		return new Response(body, {
			status: res.status,
			headers: {
				'content-type':
					res.headers.get('content-type') ?? 'application/json',
			},
		});
	}

	// Stream the SSE response back to the browser
	return new Response(res.body, {
		status: 200,
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache, no-transform',
			Connection: 'keep-alive',
			'X-Accel-Buffering': 'no', // Disable nginx buffering
		},
	});
}

'use server';

import { NextResponse } from 'next/server';
import { BASE_URLS, URLS } from '@/lib/const';
import { getAuthInfo } from '@/actions/auth';

export async function POST(req: Request) {
	const auth = await getAuthInfo();
	if ('error' in auth || auth.isExpired) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	let body: { productId?: string };
	try {
		body = await req.json();
	} catch {
		return NextResponse.json(
			{ error: 'Invalid JSON body' },
			{ status: 400 },
		);
	}

	if (!body?.productId) {
		return NextResponse.json(
			{ error: 'productId is required' },
			{ status: 400 },
		);
	}

	// Step 1: Check the device exists by productId
	const deviceUrl = `${BASE_URLS.AUTH_API}${URLS.device.product}/${body.productId}`;
	try {
		const deviceRes = await fetch(deviceUrl, {
			method: 'GET',
			headers: { Accept: 'application/json' },
			cache: 'no-store',
		});

		if (!deviceRes.ok) {
			return NextResponse.json(
				{ error: 'No device found with this product ID' },
				{ status: 404 },
			);
		}
	} catch (e) {
		console.error('device lookup error:', e);
		return NextResponse.json(
			{ error: 'Failed to verify device' },
			{ status: 502 },
		);
	}

	// Step 2: Request a verification token (sends OTP email to user)
	const email = auth.user.email;
	const requestTokenUrl = `${BASE_URLS.AUTH_API}${URLS.device.request_token}`;
	try {
		const tokenRes = await fetch(requestTokenUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${auth.accessToken}`,
				Accept: 'application/json',
			},
			body: JSON.stringify({ email }),
			cache: 'no-store',
		});

		const text = await tokenRes.text();
		const contentType =
			tokenRes.headers.get('content-type') ?? 'application/json';

		return new NextResponse(text, {
			status: tokenRes.status,
			headers: { 'content-type': contentType },
		});
	} catch (e) {
		console.error('request-token proxy error:', e);
		return NextResponse.json(
			{ error: 'Failed to send verification token' },
			{ status: 502 },
		);
	}
}

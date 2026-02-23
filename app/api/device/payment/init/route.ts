'use server';

import { NextResponse } from 'next/server';
import { BASE_URLS, URLS } from '@/lib/const';
import { getAuthInfo } from '@/actions/auth';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_INIT_URL = 'https://api.paystack.co/transaction/initialize';
const DEVICE_CODE_AMOUNT_KOBO = 25000 * 100; // ₦25,000 in kobo

export async function POST(req: Request) {
	console.log('[payment/init] === START ===');
	const auth = await getAuthInfo();
	console.log(
		'[payment/init] auth result:',
		'error' in auth ? 'ERROR' : (
			`user=${auth.user?.id}, expired=${auth.isExpired}`
		),
	);
	if ('error' in auth || auth.isExpired) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	console.log('[payment/init] PAYSTACK_SECRET present:', !!PAYSTACK_SECRET);
	if (!PAYSTACK_SECRET) {
		console.error('PAYSTACK_SECRET_KEY not configured');
		return NextResponse.json(
			{ error: 'Payment service unavailable' },
			{ status: 503 },
		);
	}

	let body: { productId?: string; email?: string };
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

	// The email to associate the code with — must be provided by the user
	const email = body.email || auth.user.email;
	if (!email) {
		return NextResponse.json(
			{ error: 'email is required' },
			{ status: 400 },
		);
	}

	// Step 1: Verify the device exists and check ownership
	const deviceUrl = `${BASE_URLS.AUTH_API}${URLS.device.product}/${body.productId}`;
	console.log('[payment/init] Step 1 — device lookup URL:', deviceUrl);
	try {
		const deviceRes = await fetch(deviceUrl, {
			method: 'GET',
			headers: { Accept: 'application/json' },
			cache: 'no-store',
		});

		console.log('[payment/init] device lookup status:', deviceRes.status);
		if (!deviceRes.ok) {
			const errBody = await deviceRes.text().catch(() => '');
			console.error('[payment/init] device lookup failed body:', errBody);
			return NextResponse.json(
				{ error: 'No device found with this product ID' },
				{ status: 404 },
			);
		}

		// Check if device is already assigned to another user
		const deviceData = await deviceRes.json().catch(() => ({}));
		const device = deviceData?.data;
		if (device?.userId && device.userId !== auth.user.id) {
			const ownerName =
				device.user ?
					`${device.user.firstName ?? ''} ${device.user.lastName ?? ''}`.trim()
				:	'another user';
			console.log(
				'[payment/init] device already owned by:',
				device.userId,
				ownerName,
			);
			return NextResponse.json(
				{
					error: `This device is already assigned to ${ownerName}`,
					ownerName,
					ownerEmail: device.user?.email,
				},
				{ status: 403 },
			);
		}
	} catch (e) {
		console.error('[payment/init] device lookup EXCEPTION:', e);
		return NextResponse.json(
			{ error: 'Failed to verify device' },
			{ status: 502 },
		);
	}

	// Step 2: Initialize Paystack transaction
	const reference = `dev-${Date.now()}-${auth.user.id}`;
	const appUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3154';
	const callbackUrl = `${appUrl}/api/device/payment/callback?productId=${encodeURIComponent(body.productId)}`;

	try {
		const paystackRes = await fetch(PAYSTACK_INIT_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${PAYSTACK_SECRET}`,
			},
			body: JSON.stringify({
				email,
				amount: DEVICE_CODE_AMOUNT_KOBO,
				reference,
				callback_url: callbackUrl,
				metadata: {
					productId: body.productId,
					userId: auth.user.id,
					purpose: 'device_code_purchase',
				},
			}),
		});

		const paystackData = await paystackRes.json();
		console.log(
			'[payment/init] Step 2 — Paystack response status:',
			paystackRes.status,
			'body:',
			JSON.stringify(paystackData),
		);

		if (!paystackRes.ok || !paystackData?.status) {
			console.error('[payment/init] Paystack init FAILED:', paystackData);
			return NextResponse.json(
				{ error: 'Failed to initialize payment' },
				{ status: 502 },
			);
		}

		const result = {
			success: true,
			data: {
				authorization_url: paystackData.data.authorization_url,
				reference: paystackData.data.reference,
				access_code: paystackData.data.access_code,
			},
		};
		console.log(
			'[payment/init] === SUCCESS === returning:',
			JSON.stringify(result),
		);
		return NextResponse.json(result);
	} catch (e) {
		console.error('[payment/init] Paystack init EXCEPTION:', e);
		return NextResponse.json(
			{ error: 'Failed to initialize payment' },
			{ status: 502 },
		);
	}
}

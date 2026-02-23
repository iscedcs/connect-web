'use server';

import { NextRequest, NextResponse } from 'next/server';
import { BASE_URLS, URLS } from '@/lib/const';
import { getAuthInfo } from '@/actions/auth';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_VERIFY_URL = 'https://api.paystack.co/transaction/verify';

/**
 * Paystack callback handler.
 * Paystack redirects the user here after checkout with ?reference=XXX
 * We also pass ?productId=XXX via our callback_url.
 *
 * Flow: verify payment with Paystack → call isce-auth request-token → redirect back to OTP page.
 */
export async function GET(req: NextRequest) {
	const reference = req.nextUrl.searchParams.get('reference');
	const trxref = req.nextUrl.searchParams.get('trxref');
	const productId = req.nextUrl.searchParams.get('productId');
	const ref = reference || trxref;

	const appUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3154';
	const otpPage = `${appUrl}/otp/idle`;

	if (!ref || !productId) {
		// Redirect back with error
		return NextResponse.redirect(
			`${otpPage}?cardid=${productId ?? ''}&payment=error&reason=missing_ref`,
		);
	}

	if (!PAYSTACK_SECRET) {
		return NextResponse.redirect(
			`${otpPage}?cardid=${productId}&payment=error&reason=config`,
		);
	}

	// Step 1: Verify payment with Paystack
	let paymentVerified = false;
	let payerEmail = '';
	try {
		const verifyRes = await fetch(`${PAYSTACK_VERIFY_URL}/${ref}`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${PAYSTACK_SECRET}`,
			},
		});

		const verifyData = await verifyRes.json();

		if (
			verifyRes.ok &&
			verifyData?.status &&
			verifyData?.data?.status === 'success'
		) {
			paymentVerified = true;
			payerEmail = verifyData.data.customer?.email || '';
		}
	} catch (e) {
		console.error('Paystack verify error:', e);
	}

	if (!paymentVerified) {
		return NextResponse.redirect(
			`${otpPage}?cardid=${productId}&payment=failed`,
		);
	}

	// Step 2: Get auth info to call isce-auth request-token
	const auth = await getAuthInfo();
	if ('error' in auth || auth.isExpired) {
		// Payment succeeded but user session expired — redirect with info
		return NextResponse.redirect(
			`${otpPage}?cardid=${productId}&payment=success&needs_login=true`,
		);
	}

	// Step 3: Call isce-auth request-token to send OTP email
	// Use the payer's email (the email they paid with)
	const email = payerEmail || auth.user.email;
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

		if (tokenRes.ok) {
			return NextResponse.redirect(
				`${otpPage}?cardid=${productId}&payment=success`,
			);
		} else {
			const errData = await tokenRes.json().catch(() => ({}));
			console.error('request-token failed after payment:', errData);
			return NextResponse.redirect(
				`${otpPage}?cardid=${productId}&payment=success&token_error=true`,
			);
		}
	} catch (e) {
		console.error('request-token error:', e);
		return NextResponse.redirect(
			`${otpPage}?cardid=${productId}&payment=success&token_error=true`,
		);
	}
}

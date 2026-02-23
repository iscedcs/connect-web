'use client';
import OtpScreen from '@/components/cardholder/otp/otp-screen';
import ConnectSuccessScreen from '@/components/cardholder/taporscantoconnect/connected-to-device-screen';
import {
	createDevice,
	initDevicePayment,
	verifyDeviceToken,
} from '@/lib/services/device';
import { linkDeviceToProfile } from '@/lib/services/device-profile';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

interface OtpClientSectionProps {
	cardId?: string;
	deviceType?: string;
	user?: UserInfo;
	productId?: string;
	defaultProfileId?: string;
}

export default function OtpClientSection({
	cardId,
	deviceType,
	user,
	productId,
	defaultProfileId,
}: OtpClientSectionProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const userId = user?.id;
	const effectiveProductId = productId ?? cardId;

	const [created, setCreated] = React.useState(false);
	const [otpState, setOtpState] = React.useState<
		'idle' | 'success' | 'error' | 'resending'
	>('idle');
	const [paymentLoading, setPaymentLoading] = React.useState(false);
	const [paymentError, setPaymentError] = React.useState<string | null>(null);

	const inFlightRef = React.useRef(false);

	// Check if we just came back from a successful payment
	const paymentStatus = searchParams.get('payment');
	const tokenError = searchParams.get('token_error');

	if (created) {
		return (
			<ConnectSuccessScreen
				cardImage='/cards/PuURPLE.png'
				message='Device connected'
				onContinue={() => router.push('/devices')}
			/>
		);
	}

	const handleRequestCode = async () => {
		if (!effectiveProductId) {
			console.warn('[OTP] handleRequestCode — no effectiveProductId');
			return;
		}
		console.log(
			'[OTP] handleRequestCode — productId:',
			effectiveProductId,
			'email:',
			user?.email,
		);
		setPaymentLoading(true);
		setPaymentError(null);
		setOtpState('idle');
		try {
			const res = await initDevicePayment({
				productId: effectiveProductId,
				email: user?.email,
			});
			console.log('[OTP] initDevicePayment response:', {
				ok: res.ok,
				status: res.status,
				data: res.data,
			});
			const url =
				res.data?.data?.authorization_url ||
				res.data?.authorization_url;
			console.log('[OTP] extracted authorization_url:', url);
			if (res.ok && url) {
				// Redirect to Paystack checkout
				console.log('[OTP] redirecting to Paystack:', url);
				window.location.href = url;
			} else {
				const errMsg =
					res.data?.error ||
					'Failed to initialize payment. Please try again.';
				console.error(
					'[OTP] payment init failed:',
					errMsg,
					'full data:',
					res.data,
				);
				setPaymentError(errMsg);
			}
		} catch (e) {
			console.error('[OTP] handleRequestCode EXCEPTION:', e);
			setPaymentError('Something went wrong. Please try again.');
		} finally {
			setPaymentLoading(false);
		}
	};

	return (
		<OtpScreen
			state={otpState}
			paymentStatus={paymentStatus}
			tokenError={tokenError === 'true'}
			paymentLoading={paymentLoading}
			paymentError={paymentError}
			onRequestCode={handleRequestCode}
			onVerify={async (token) => {
				if (!userId) return 'error';
				if (inFlightRef.current) return 'success';

				// verify
				const v = await verifyDeviceToken({
					token,
					userId,
					init: { cache: 'no-store' },
				});
				if (!v.ok) {
					setOtpState('error');
					return 'error';
				}

				setOtpState('success');

				// immediately create (exactly once)
				if (!effectiveProductId) return 'success';
				inFlightRef.current = true;

				const c = await createDevice({
					token,
					productId: effectiveProductId,
					init: { cache: 'no-store' },
				});

				// consider 409 as success (already connected)
				if (c.ok || c.status === 409) {
					// Auto-link to default profile if available
					if (defaultProfileId && effectiveProductId) {
						await linkDeviceToProfile(
							defaultProfileId,
							effectiveProductId,
						).catch(() => {});
					}
					setCreated(true);
					return 'success';
				}

				// creation failed → allow retry without re-verifying
				inFlightRef.current = false;
				setOtpState('error');
				return 'error';
			}}
		/>
	);
}

'use client';
import OtpScreen from '@/components/otp/otp-screen';
import React from 'react';

interface OtpClientSectionProps {
	cardId?: string;
	deviceType?: string;
}

export default function OtpClientSection({
	cardId,
	deviceType,
}: OtpClientSectionProps) {
	// Log the received parameters for debugging
	React.useEffect(() => {
		if (cardId) {
			console.log('Card ID received:', cardId);
		}
		if (deviceType) {
			console.log('Device type received:', deviceType);
		}
	}, [cardId, deviceType]);

	return (
		<OtpScreen
			state='idle'
			cardId={cardId}
			deviceType={deviceType}
			onResend={() => console.log('resend…')}
			onVerify={async (code) => (code === '944517' ? 'success' : 'error')}
		/>
	);
}

'use client';
import OtpScreen from '@/components/cardholder/otp/otp-screen';

interface OtpClientSectionProps {
	cardId?: string;
	deviceType?: string;
}

export default function OtpClientSection({
	cardId,
	deviceType,
}: OtpClientSectionProps) {
	return (
		<OtpScreen
			state='idle'
			cardId={cardId}
			deviceType={deviceType}
			onVerify={async (code) => (code === '944517' ? 'success' : 'error')}
		/>
	);
}

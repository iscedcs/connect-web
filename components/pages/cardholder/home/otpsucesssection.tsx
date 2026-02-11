'use client';
import OtpScreen from '@/components/cardholder/otp/otp-screen';

export default function OtpSucesssSection() {
	return (
		<OtpScreen
			state='success'
			onVerify={async () => {
				return 'success' as const;
			}}
		/>
	);
}

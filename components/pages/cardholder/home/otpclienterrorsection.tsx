'use client';
import OtpScreen from '@/components/cardholder/otp/otp-screen';

export default function OtpClientErrorSection() {
	return (
		<OtpScreen
			state='error'
			onVerify={async () => {
				return 'error' as const;
			}}
		/>
	);
}

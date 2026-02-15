import BvnScreen from '@/components/cardholder/wallet/bvn-screen';
import { generateMetadata } from '@/lib/metadata';

export const metadata = generateMetadata({
	title: 'BVN Verification',
	description:
		'Verify your Bank Verification Number to complete your account setup.',
	keywords: ['BVN', 'verification', 'identity'],
	noIndex: true,
});

export default function BVNPage() {
	return <BvnScreen />;
}

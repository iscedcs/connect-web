import BvnActivationClient from '@/components/cardholder/wallet/bvn-activation-client';
import { generateMetadata } from '@/lib/metadata';

export const metadata = generateMetadata({
	title: 'Activate Wallet Payments',
	description:
		'Verify your Bank Verification Number to activate payments on your Connect profile.',
	keywords: ['BVN', 'verification', 'wallet', 'activate'],
	noIndex: true,
});

export default function BVNPage() {
	return <BvnActivationClient />;
}

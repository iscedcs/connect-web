'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import BvnScreen from './bvn-screen';
import { csrfFetch } from '@/lib/csrf-client';

/**
 * Client wrapper around BvnScreen that wires up the real API call.
 * Rendered from the /bvn page (which keeps its server-side metadata export).
 */
export default function BvnActivationClient() {
	const router = useRouter();

	const handleContinue = async (data: {
		bvn: string;
		accountNumber: string;
		bankCode: string;
	}) => {
		try {
			const res = await csrfFetch('/api/wallet/kyc', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					bvn: data.bvn,
					accountNumber: data.accountNumber,
					bankCode: data.bankCode,
				}),
			});

			const json = await res.json();

			if (!res.ok || !json.success) {
				toast.error(
					json.message || 'Verification failed. Please try again.',
				);
				return;
			}

			// Already verified or just submitted
			if (json.data?.kycStatus === 'BVN_VERIFIED') {
				toast.success('Your wallet is already activated!');
			} else {
				toast.success(
					"BVN submitted! We'll notify you once your wallet is activated.",
				);
			}

			router.push('/settings');
		} catch {
			toast.error('Something went wrong. Please check your connection.');
		}
	};

	return (
		<BvnScreen
			onContinue={handleContinue}
			backHref='/settings'
		/>
	);
}

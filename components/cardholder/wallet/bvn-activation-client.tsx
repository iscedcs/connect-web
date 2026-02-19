'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import BvnScreen from './bvn-screen';
import { csrfFetch } from '@/lib/csrf-client';
import { Loader2, RefreshCw, XCircle } from 'lucide-react';

/**
 * Client wrapper around BvnScreen that wires up the real API call.
 * Checks wallet status on mount — if BVN_SUBMITTED, shows a recheck UI
 * instead of the form. If BVN_VERIFIED, redirects to settings.
 */
export default function BvnActivationClient() {
	const router = useRouter();
	const [walletStatus, setWalletStatus] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [rechecking, setRechecking] = useState(false);

	// Fetch wallet status on mount
	useEffect(() => {
		(async () => {
			try {
				const res = await fetch('/api/wallet/status');
				if (res.ok) {
					const json = await res.json();
					const status = json?.data?.kycStatus ?? null;
					setWalletStatus(status);
					if (status === 'BVN_VERIFIED') {
						toast.success('Your wallet is already activated!');
						router.push('/wallet');
						return;
					}
				}
			} catch {
				// Ignore — show the form as fallback
			} finally {
				setLoading(false);
			}
		})();
	}, [router]);

	// Recheck KYC status from Paystack
	const handleRecheck = async () => {
		setRechecking(true);
		try {
			const res = await fetch('/api/wallet/kyc-status');
			if (!res.ok) {
				toast.error('Could not check status. Try again later.');
				return;
			}
			const json = await res.json();
			const status = json?.data?.kycStatus;
			setWalletStatus(status);

			if (status === 'BVN_VERIFIED') {
				toast.success(
					'Wallet activated! Your virtual account is ready.',
				);
				setTimeout(() => router.push('/wallet'), 1500);
			} else if (status === 'REJECTED') {
				toast.error(
					'Verification was rejected. Please try again with correct details.',
				);
				setWalletStatus('REJECTED');
			} else if (status === 'UNVERIFIED') {
				// Stale customer record was cleared — let user re-submit
				toast.info(
					json?.data?.message ||
						'Please submit your BVN again to start verification.',
				);
				setWalletStatus('UNVERIFIED');
			} else {
				toast.info(
					'Still processing. Paystack is verifying your identity — check back shortly.',
				);
			}
		} catch {
			toast.error('Something went wrong. Please try again.');
		} finally {
			setRechecking(false);
		}
	};

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
				setWalletStatus('BVN_SUBMITTED');
			}

			router.push('/wallet');
		} catch {
			toast.error('Something went wrong. Please check your connection.');
		}
	};

	// Loading state
	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<Loader2 className='w-6 h-6 animate-spin text-white/50' />
			</div>
		);
	}

	// BVN already submitted — show recheck UI
	if (walletStatus === 'BVN_SUBMITTED') {
		return (
			<div className='flex flex-col items-center justify-center min-h-screen px-6 text-center gap-6'>
				<div className='w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center'>
					<RefreshCw className='w-8 h-8 text-yellow-400' />
				</div>
				<div>
					<h2 className='text-xl font-semibold text-white mb-2'>
						Verification In Progress
					</h2>
					<p className='text-white/60 text-sm max-w-xs'>
						Your BVN has been submitted to Paystack for
						verification. This usually takes a few minutes.
					</p>
				</div>
				<button
					onClick={handleRecheck}
					disabled={rechecking}
					className='flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-medium text-sm disabled:opacity-50 transition-opacity'
				>
					{rechecking ?
						<Loader2 className='w-4 h-4 animate-spin' />
					:	<RefreshCw className='w-4 h-4' />}
					{rechecking ? 'Checking...' : 'Check Status'}
				</button>
				<button
					onClick={() => router.push('/wallet')}
					className='text-white/40 text-sm hover:text-white/60 transition-colors'
				>
					Back to Wallet
				</button>
			</div>
		);
	}

	// REJECTED — show retry message + form
	if (walletStatus === 'REJECTED') {
		return (
			<div className='flex flex-col min-h-screen'>
				<div className='flex items-center gap-3 px-6 py-4 bg-red-500/10 border-b border-red-500/20'>
					<XCircle className='w-5 h-5 text-red-400 flex-shrink-0' />
					<p className='text-red-300 text-sm'>
						Your previous verification was rejected. Please try
						again with correct details.
					</p>
				</div>
				<BvnScreen
					onContinue={handleContinue}
					backHref='/wallet'
				/>
			</div>
		);
	}

	// Default — show the BVN form (UNVERIFIED or null)
	return (
		<BvnScreen
			onContinue={handleContinue}
			backHref='/wallet'
		/>
	);
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { csrfFetch } from '@/lib/csrf-client';
import {
	Loader2,
	RefreshCw,
	Tag,
	Lock,
	CheckCircle2,
	ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

type SetupStep = 'pending' | 'tag' | 'pin' | 'done';

interface WalletSetupClientProps {
	/** The initial state to render */
	initialStep: 'pending' | 'setup';
	walletId: string;
	/** Whether the user already has a tag set */
	hasTag: boolean;
	/** Whether the user already has a PIN set */
	hasPin: boolean;
}

/**
 * Client component handling:
 * 1. BVN_SUBMITTED — pending verification UI with "Check Status" button
 * 2. BVN_VERIFIED but missing tag/PIN — setup prompts
 */
export default function WalletSetupClient({
	initialStep,
	walletId,
	hasTag: initialHasTag,
	hasPin: initialHasPin,
}: WalletSetupClientProps) {
	const router = useRouter();
	const [rechecking, setRechecking] = useState(false);

	// Setup flow state
	const [step, setStep] = useState<SetupStep>(() => {
		if (initialStep === 'pending') return 'pending';
		if (!initialHasTag) return 'tag';
		if (!initialHasPin) return 'pin';
		return 'done';
	});

	const [tag, setTag] = useState('');
	const [pin, setPin] = useState('');
	const [confirmPin, setConfirmPin] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [hasTag, setHasTag] = useState(initialHasTag);
	const [hasPin, setHasPin] = useState(initialHasPin);

	// ─── Pending Verification ────────────────────────────────────

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

			if (status === 'BVN_VERIFIED') {
				toast.success(
					'Wallet activated! Let\u2019s finish setting up.',
				);
				// Move to tag/PIN setup
				if (!hasTag) {
					setStep('tag');
				} else if (!hasPin) {
					setStep('pin');
				} else {
					setStep('done');
					router.refresh();
				}
			} else if (status === 'REJECTED') {
				toast.error(
					'Verification was rejected. Please re-submit your BVN.',
				);
				router.push('/bvn');
			} else if (status === 'UNVERIFIED') {
				toast.info(
					json?.data?.message ||
						'Please submit your BVN again to start verification.',
				);
				router.push('/bvn');
			} else {
				toast.info(
					'Still processing. Paystack is verifying your identity \u2014 check back shortly.',
				);
			}
		} catch {
			toast.error('Something went wrong. Please try again.');
		} finally {
			setRechecking(false);
		}
	};

	// ─── Tag Setup ───────────────────────────────────────────────

	const handleSetTag = async () => {
		const normalized = tag.trim().toLowerCase();
		if (!/^[a-z0-9_-]{3,30}$/.test(normalized)) {
			toast.error(
				'Tag must be 3-30 characters: lowercase letters, numbers, _ or -',
			);
			return;
		}

		setSubmitting(true);
		try {
			const res = await csrfFetch('/api/wallet/set-tag', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ tag: normalized }),
			});
			const json = await res.json();

			if (!res.ok || !json.success) {
				toast.error(json.message || 'Failed to set tag');
				return;
			}

			toast.success('Tag set successfully!');
			setHasTag(true);

			if (!hasPin) {
				setStep('pin');
			} else {
				setStep('done');
				router.refresh();
			}
		} catch {
			toast.error('Something went wrong. Please try again.');
		} finally {
			setSubmitting(false);
		}
	};

	// ─── PIN Setup ───────────────────────────────────────────────

	const handleSetPin = async () => {
		if (!/^\d{4,6}$/.test(pin)) {
			toast.error('PIN must be 4-6 digits');
			return;
		}

		if (pin !== confirmPin) {
			toast.error('PINs do not match');
			return;
		}

		setSubmitting(true);
		try {
			const res = await csrfFetch('/api/wallet/set-pin', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ walletId, pin }),
			});
			const json = await res.json();

			if (!res.ok || !json.success) {
				toast.error(json.message || 'Failed to set PIN');
				return;
			}

			toast.success('PIN set successfully! Your wallet is ready.');
			setHasPin(true);
			setStep('done');
			router.refresh();
		} catch {
			toast.error('Something went wrong. Please try again.');
		} finally {
			setSubmitting(false);
		}
	};

	// ─── Render: Pending Verification ────────────────────────────

	if (step === 'pending') {
		return (
			<div className='min-h-screen bg-black text-white'>
				{/* Simple header */}
				<div className='px-4 pt-4 pb-2'>
					<Link
						href='/'
						className='text-white/90'
					>
						<ArrowLeft className='w-5 h-5' />
					</Link>
				</div>

				<div className='flex flex-col items-center justify-center px-6 text-center gap-6 pt-20'>
					<div className='w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center'>
						<RefreshCw className='w-8 h-8 text-yellow-400' />
					</div>
					<div>
						<h2 className='text-xl font-semibold text-white mb-2'>
							Verification In Progress
						</h2>
						<p className='text-white/60 text-sm max-w-xs'>
							Your BVN has been submitted for verification. This
							usually takes a few minutes.
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
						{rechecking ? 'Checking...' : 'Check KYC Status'}
					</button>
				</div>
			</div>
		);
	}

	// ─── Render: Tag Setup ───────────────────────────────────────

	if (step === 'tag') {
		return (
			<div className='min-h-screen bg-black text-white'>
				<div className='px-4 pt-4 pb-2'>
					<Link
						href='/'
						className='text-white/90'
					>
						<ArrowLeft className='w-5 h-5' />
					</Link>
				</div>

				<div className='flex flex-col items-center px-6 pt-16 gap-6'>
					<div className='w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center'>
						<Tag className='w-8 h-8 text-green-400' />
					</div>
					<div className='text-center'>
						<h2 className='text-xl font-semibold text-white mb-2'>
							Create Your ISCE Tag
						</h2>
						<p className='text-white/60 text-sm max-w-xs'>
							Your tag is your unique identifier. Others can send
							money to you using this tag.
						</p>
					</div>

					<div className='w-full max-w-sm space-y-4'>
						<div className='relative'>
							<span className='absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm'>
								@
							</span>
							<input
								type='text'
								value={tag}
								onChange={(e) =>
									setTag(
										e.target.value
											.toLowerCase()
											.replace(/[^a-z0-9_-]/g, ''),
									)
								}
								placeholder='yourname'
								maxLength={30}
								className='w-full bg-neutral-900 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30'
							/>
						</div>
						<p className='text-white/40 text-xs'>
							3-30 characters: lowercase letters, numbers,
							underscores, hyphens
						</p>
						<button
							onClick={handleSetTag}
							disabled={submitting || tag.trim().length < 3}
							className='w-full py-3 bg-white text-black rounded-full font-medium text-sm disabled:opacity-50 transition-opacity'
						>
							{submitting ?
								<Loader2 className='w-4 h-4 animate-spin mx-auto' />
							:	'Continue'}
						</button>
					</div>
				</div>
			</div>
		);
	}

	// ─── Render: PIN Setup ───────────────────────────────────────

	if (step === 'pin') {
		return (
			<div className='min-h-screen bg-black text-white'>
				<div className='px-4 pt-4 pb-2'>
					<Link
						href='/'
						className='text-white/90'
					>
						<ArrowLeft className='w-5 h-5' />
					</Link>
				</div>

				<div className='flex flex-col items-center px-6 pt-16 gap-6'>
					<div className='w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center'>
						<Lock className='w-8 h-8 text-blue-400' />
					</div>
					<div className='text-center'>
						<h2 className='text-xl font-semibold text-white mb-2'>
							Set Your Wallet PIN
						</h2>
						<p className='text-white/60 text-sm max-w-xs'>
							Your PIN is required for sending money and
							withdrawals. Choose a 4-6 digit PIN.
						</p>
					</div>

					<div className='w-full max-w-sm space-y-4'>
						<input
							type='password'
							inputMode='numeric'
							value={pin}
							onChange={(e) =>
								setPin(
									e.target.value
										.replace(/\D/g, '')
										.slice(0, 6),
								)
							}
							placeholder='Enter PIN'
							maxLength={6}
							className='w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white text-center tracking-[0.5em] placeholder:text-white/30 placeholder:tracking-normal focus:outline-none focus:border-white/30'
						/>
						<input
							type='password'
							inputMode='numeric'
							value={confirmPin}
							onChange={(e) =>
								setConfirmPin(
									e.target.value
										.replace(/\D/g, '')
										.slice(0, 6),
								)
							}
							placeholder='Confirm PIN'
							maxLength={6}
							className='w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white text-center tracking-[0.5em] placeholder:text-white/30 placeholder:tracking-normal focus:outline-none focus:border-white/30'
						/>
						<button
							onClick={handleSetPin}
							disabled={
								submitting ||
								pin.length < 4 ||
								confirmPin.length < 4
							}
							className='w-full py-3 bg-white text-black rounded-full font-medium text-sm disabled:opacity-50 transition-opacity'
						>
							{submitting ?
								<Loader2 className='w-4 h-4 animate-spin mx-auto' />
							:	'Set PIN'}
						</button>
					</div>
				</div>
			</div>
		);
	}

	// ─── Render: Done (brief success before refresh) ─────────────

	return (
		<div className='min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4'>
			<div className='w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center'>
				<CheckCircle2 className='w-8 h-8 text-green-400' />
			</div>
			<h2 className='text-xl font-semibold'>Wallet Ready!</h2>
			<p className='text-white/60 text-sm'>Loading your wallet...</p>
			<Loader2 className='w-5 h-5 animate-spin text-white/40' />
		</div>
	);
}

'use client';

import { useState, useCallback } from 'react';
import {
	ArrowLeft,
	User,
	Hash,
	CreditCard,
	Loader2,
	CheckCircle2,
	XCircle,
	Search,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from '@/components/ui/input-otp';
import { csrfFetch } from '@/lib/csrf-client';

// ─── Types ──────────────────────────────────────────────────────────

interface RecipientInfo {
	userId: string;
	firstName: string;
	lastName: string;
	displayPicture: string | null;
	isceTag: string | null;
	accountName?: string | null;
}

type LookupMethod = 'tag' | 'dva';
type Step = 'method' | 'search' | 'amount' | 'pin' | 'success' | 'error';

// ─── Component ──────────────────────────────────────────────────────

export default function SendMoneyClient() {
	const router = useRouter();

	// Flow state
	const [step, setStep] = useState<Step>('method');
	const [method, setMethod] = useState<LookupMethod>('tag');

	// Lookup
	const [searchQuery, setSearchQuery] = useState('');
	const [recipient, setRecipient] = useState<RecipientInfo | null>(null);
	const [lookupLoading, setLookupLoading] = useState(false);
	const [lookupError, setLookupError] = useState('');

	// Amount
	const [amount, setAmount] = useState('');

	// PIN
	const [pin, setPin] = useState('');
	const [transferLoading, setTransferLoading] = useState(false);
	const [transferError, setTransferError] = useState('');
	const [transferResult, setTransferResult] = useState<{
		reference: string;
		amount: string;
	} | null>(null);

	// ── Lookup ────────────────────────────────────────────────────

	const handleLookup = useCallback(async () => {
		if (!searchQuery.trim()) return;
		setLookupLoading(true);
		setLookupError('');
		setRecipient(null);

		try {
			const param =
				method === 'tag' ?
					`tag=${encodeURIComponent(searchQuery.trim())}`
				:	`dva=${encodeURIComponent(searchQuery.trim())}`;

			const res = await csrfFetch(`/api/wallet/lookup?${param}`);
			const json = await res.json();

			if (!res.ok || !json.success) {
				setLookupError(json.message || 'User not found');
				return;
			}

			setRecipient(json.data);
		} catch {
			setLookupError('Something went wrong. Please try again.');
		} finally {
			setLookupLoading(false);
		}
	}, [searchQuery, method]);

	// ── Transfer ──────────────────────────────────────────────────

	const handleTransfer = useCallback(
		async (pinOverride?: string) => {
			const transferPin = pinOverride || pin;
			if (!recipient || !amount || !transferPin) return;
			setTransferLoading(true);
			setTransferError('');

			try {
				const res = await csrfFetch('/api/wallet/transfer', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						receiverUserId: recipient.userId,
						amount: parseFloat(amount),
						pin: transferPin,
						description: `Transfer to ${recipient.firstName} ${recipient.lastName}`,
					}),
				});

				const json = await res.json();

				if (!res.ok || !json.success) {
					setTransferError(json.message || 'Transfer failed');
					setStep('error');
					return;
				}

				setTransferResult({
					reference: json.data?.transfer?.reference ?? '',
					amount: parseFloat(amount).toLocaleString('en-NG', {
						minimumFractionDigits: 2,
					}),
				});
				setStep('success');
			} catch {
				setTransferError('Network error. Please try again.');
				setStep('error');
			} finally {
				setTransferLoading(false);
			}
		},
		[recipient, amount, pin],
	);

	// ── Navigation helpers ────────────────────────────────────────

	const goBack = () => {
		switch (step) {
			case 'search':
				setStep('method');
				setSearchQuery('');
				setRecipient(null);
				setLookupError('');
				break;
			case 'amount':
				setStep('search');
				setAmount('');
				break;
			case 'pin':
				setStep('amount');
				setPin('');
				break;
			case 'success':
			case 'error':
				router.push('/wallet');
				break;
			default:
				router.push('/wallet');
		}
	};

	const selectMethod = (m: LookupMethod) => {
		setMethod(m);
		setStep('search');
		setSearchQuery('');
		setRecipient(null);
		setLookupError('');
	};

	const confirmRecipient = () => {
		if (recipient) {
			setStep('amount');
		}
	};

	const confirmAmount = () => {
		const numAmount = parseFloat(amount);
		if (isNaN(numAmount) || numAmount <= 0) return;
		setStep('pin');
		setPin('');
	};

	// ── Render ────────────────────────────────────────────────────

	return (
		<div className='min-h-screen bg-black text-white'>
			{/* Header */}
			<div className='bg-neutral-900 rounded-b-4xl px-4 pt-3 pb-6'>
				<div className='flex items-center gap-3'>
					<button
						onClick={goBack}
						className='text-white/90'
						aria-label='Go back'
					>
						<ArrowLeft className='w-5 h-5' />
					</button>
					<h1 className='text-lg font-semibold'>
						{step === 'method' && 'Send Money'}
						{step === 'search' &&
							(method === 'tag' ? 'Find by ISCE Tag' : (
								'Find by Account Number'
							))}
						{step === 'amount' && 'Enter Amount'}
						{step === 'pin' && 'Enter PIN'}
						{step === 'success' && 'Transfer Successful'}
						{step === 'error' && 'Transfer Failed'}
					</h1>
				</div>
			</div>

			<div className='px-4 py-6'>
				{/* ── Step: Choose method ───────────────────────────── */}
				{step === 'method' && (
					<div className='space-y-3'>
						<p className='text-sm text-white/70 mb-4'>
							How would you like to find the recipient?
						</p>

						<button
							onClick={() => selectMethod('tag')}
							className='w-full flex items-center gap-4 rounded-xl bg-neutral-900 px-4 py-4 text-left hover:bg-neutral-800 transition-colors'
						>
							<div className='w-10 h-10 rounded-full bg-white/10 flex items-center justify-center'>
								<Hash className='w-5 h-5 text-white/80' />
							</div>
							<div>
								<p className='font-medium'>ISCE Tag</p>
								<p className='text-xs text-white/60'>
									Search by username (e.g. @rexed)
								</p>
							</div>
						</button>

						<button
							onClick={() => selectMethod('dva')}
							className='w-full flex items-center gap-4 rounded-xl bg-neutral-900 px-4 py-4 text-left hover:bg-neutral-800 transition-colors'
						>
							<div className='w-10 h-10 rounded-full bg-white/10 flex items-center justify-center'>
								<CreditCard className='w-5 h-5 text-white/80' />
							</div>
							<div>
								<p className='font-medium'>Account Number</p>
								<p className='text-xs text-white/60'>
									Enter their ISCE wallet account number
								</p>
							</div>
						</button>
					</div>
				)}

				{/* ── Step: Search for recipient ────────────────────── */}
				{step === 'search' && (
					<div className='space-y-4'>
						<div className='relative'>
							<Input
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								onKeyDown={(e) =>
									e.key === 'Enter' && handleLookup()
								}
								placeholder={
									method === 'tag' ?
										'Enter ISCE Tag (e.g. rexed)'
									:	'Enter 10-digit account number'
								}
								className='bg-neutral-900 border-neutral-700 text-white placeholder:text-white/40 pr-12'
								autoFocus
							/>
							<button
								onClick={handleLookup}
								disabled={lookupLoading || !searchQuery.trim()}
								className='absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40'
							>
								{lookupLoading ?
									<Loader2 className='w-4 h-4 animate-spin' />
								:	<Search className='w-4 h-4' />}
							</button>
						</div>

						{lookupError && (
							<div className='rounded-xl bg-red-950/50 border border-red-900/50 px-4 py-3'>
								<p className='text-sm text-red-300'>
									{lookupError}
								</p>
							</div>
						)}

						{recipient && (
							<div className='rounded-xl bg-neutral-900 p-4 space-y-4'>
								<div className='flex items-center gap-3'>
									<div className='w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden'>
										{recipient.displayPicture ?
											<img
												src={recipient.displayPicture}
												alt=''
												className='w-full h-full object-cover'
											/>
										:	<User className='w-6 h-6 text-white/60' />
										}
									</div>
									<div>
										<p className='font-medium'>
											{recipient.firstName}{' '}
											{recipient.lastName}
										</p>
										{recipient.isceTag && (
											<p className='text-sm text-white/60'>
												{recipient.isceTag}
											</p>
										)}
									</div>
								</div>

								<Button
									onClick={confirmRecipient}
									className='w-full rounded-full bg-white text-black hover:bg-white/90 font-medium'
								>
									Send to this person
								</Button>
							</div>
						)}
					</div>
				)}

				{/* ── Step: Enter amount ────────────────────────────── */}
				{step === 'amount' && recipient && (
					<div className='space-y-6'>
						{/* Recipient card */}
						<div className='flex items-center gap-3 rounded-xl bg-neutral-900 px-4 py-3'>
							<div className='w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden'>
								{recipient.displayPicture ?
									<img
										src={recipient.displayPicture}
										alt=''
										className='w-full h-full object-cover'
									/>
								:	<User className='w-5 h-5 text-white/60' />}
							</div>
							<div className='flex-1'>
								<p className='text-sm font-medium'>
									{recipient.firstName} {recipient.lastName}
								</p>
								{recipient.isceTag && (
									<p className='text-xs text-white/60'>
										{recipient.isceTag}
									</p>
								)}
							</div>
						</div>

						{/* Amount input */}
						<div className='text-center space-y-2'>
							<p className='text-sm text-white/70'>
								Enter amount (₦)
							</p>
							<div className='relative inline-flex items-center'>
								<span className='text-3xl font-semibold text-white/60 mr-1'>
									₦
								</span>
								<input
									type='number'
									inputMode='decimal'
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									placeholder='0.00'
									className='text-3xl font-semibold bg-transparent border-none outline-none text-center w-48 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
									autoFocus
								/>
							</div>
							<p className='text-xs text-white/50'>
								No fees for ISCE-to-ISCE transfers
							</p>
						</div>

						<Button
							onClick={confirmAmount}
							disabled={!amount || parseFloat(amount) <= 0}
							className='w-full rounded-full bg-white text-black hover:bg-white/90 font-medium disabled:opacity-40'
						>
							Continue
						</Button>
					</div>
				)}

				{/* ── Step: Enter PIN ───────────────────────────────── */}
				{step === 'pin' && recipient && (
					<div className='space-y-6'>
						{/* Summary */}
						<div className='rounded-xl bg-neutral-900 p-4 space-y-2'>
							<div className='flex justify-between text-sm'>
								<span className='text-white/60'>To</span>
								<span>
									{recipient.firstName} {recipient.lastName}
								</span>
							</div>
							{recipient.isceTag && (
								<div className='flex justify-between text-sm'>
									<span className='text-white/60'>Tag</span>
									<span>{recipient.isceTag}</span>
								</div>
							)}
							<div className='flex justify-between text-sm'>
								<span className='text-white/60'>Amount</span>
								<span className='font-semibold'>
									₦
									{parseFloat(amount).toLocaleString(
										'en-NG',
										{ minimumFractionDigits: 2 },
									)}
								</span>
							</div>
							<div className='flex justify-between text-sm'>
								<span className='text-white/60'>Fee</span>
								<span className='text-green-400'>Free</span>
							</div>
						</div>

						{/* PIN input */}
						<div className='text-center space-y-3'>
							<p className='text-sm text-white/70'>
								Enter your 4-digit wallet PIN
							</p>
							<div className='flex justify-center'>
								<InputOTP
									maxLength={4}
									value={pin}
									onChange={setPin}
									onComplete={(value) =>
										handleTransfer(value)
									}
								>
									<InputOTPGroup>
										{[0, 1, 2, 3].map((i) => (
											<InputOTPSlot
												key={i}
												index={i}
												className='w-14 h-14 text-xl bg-neutral-900 border-neutral-700 text-white'
											/>
										))}
									</InputOTPGroup>
								</InputOTP>
							</div>
						</div>

						{transferError && (
							<div className='rounded-xl bg-red-950/50 border border-red-900/50 px-4 py-3'>
								<p className='text-sm text-red-300'>
									{transferError}
								</p>
							</div>
						)}

						<Button
							onClick={() => handleTransfer()}
							disabled={pin.length < 4 || transferLoading}
							className='w-full rounded-full bg-white text-black hover:bg-white/90 font-medium disabled:opacity-40'
						>
							{transferLoading ?
								<>
									<Loader2 className='w-4 h-4 animate-spin mr-2' />
									Processing...
								</>
							:	`Send ₦${parseFloat(amount || '0').toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
							}
						</Button>
					</div>
				)}

				{/* ── Step: Success ─────────────────────────────────── */}
				{step === 'success' && recipient && transferResult && (
					<div className='text-center space-y-6 py-8'>
						<div className='w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center'>
							<CheckCircle2 className='w-10 h-10 text-green-400' />
						</div>
						<div>
							<h2 className='text-xl font-semibold'>
								Transfer Successful!
							</h2>
							<p className='text-sm text-white/60 mt-1'>
								₦{transferResult.amount} sent to{' '}
								{recipient.firstName} {recipient.lastName}
							</p>
						</div>

						<div className='rounded-xl bg-neutral-900 p-4 space-y-2 text-sm'>
							<div className='flex justify-between'>
								<span className='text-white/60'>Reference</span>
								<span className='font-mono text-xs'>
									{transferResult.reference}
								</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-white/60'>Recipient</span>
								<span>
									{recipient.firstName} {recipient.lastName}
								</span>
							</div>
							{recipient.isceTag && (
								<div className='flex justify-between'>
									<span className='text-white/60'>Tag</span>
									<span>{recipient.isceTag}</span>
								</div>
							)}
							<div className='flex justify-between'>
								<span className='text-white/60'>Amount</span>
								<span>₦{transferResult.amount}</span>
							</div>
						</div>

						<div className='space-y-2'>
							<Button
								onClick={() => router.push('/wallet')}
								className='w-full rounded-full bg-white text-black hover:bg-white/90 font-medium'
							>
								Back to Wallet
							</Button>
							<Button
								onClick={() => {
									setStep('method');
									setRecipient(null);
									setAmount('');
									setPin('');
									setTransferResult(null);
									setTransferError('');
									setSearchQuery('');
								}}
								variant='ghost'
								className='w-full rounded-full text-white/70 hover:text-white hover:bg-white/10'
							>
								Send Another
							</Button>
						</div>
					</div>
				)}

				{/* ── Step: Error ───────────────────────────────────── */}
				{step === 'error' && (
					<div className='text-center space-y-6 py-8'>
						<div className='w-20 h-20 mx-auto rounded-full bg-red-500/20 flex items-center justify-center'>
							<XCircle className='w-10 h-10 text-red-400' />
						</div>
						<div>
							<h2 className='text-xl font-semibold'>
								Transfer Failed
							</h2>
							<p className='text-sm text-white/60 mt-1'>
								{transferError ||
									'Something went wrong. Please try again.'}
							</p>
						</div>

						<div className='space-y-2'>
							<Button
								onClick={() => {
									setStep('pin');
									setPin('');
									setTransferError('');
								}}
								className='w-full rounded-full bg-white text-black hover:bg-white/90 font-medium'
							>
								Try Again
							</Button>
							<Button
								onClick={() => router.push('/wallet')}
								variant='ghost'
								className='w-full rounded-full text-white/70 hover:text-white hover:bg-white/10'
							>
								Back to Wallet
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

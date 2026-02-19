'use client';

import { useState, useCallback } from 'react';
import {
	ArrowLeft,
	ArrowDownToLine,
	Loader2,
	CheckCircle2,
	XCircle,
	Landmark,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from '@/components/ui/input-otp';
import { csrfFetch } from '@/lib/csrf-client';

// ─── Types ──────────────────────────────────────────────────────────

interface KycBankAccount {
	accountNumber: string;
	bankCode: string;
	accountName: string;
}

type Step = 'amount' | 'pin' | 'success' | 'error';

const WITHDRAWAL_FEE = 100;
const MIN_WITHDRAWAL = 500;

function formatNaira(value: number): string {
	return `₦${value.toLocaleString('en-NG', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})}`;
}

function maskAccount(accountNumber: string): string {
	if (accountNumber.length <= 4) return accountNumber;
	return `****${accountNumber.slice(-4)}`;
}

// ─── Component ──────────────────────────────────────────────────────

interface WithdrawClientProps {
	kycAccount: KycBankAccount;
	walletId: string;
	balance: number;
}

export default function WithdrawClient({
	kycAccount,
	balance,
}: WithdrawClientProps) {
	const router = useRouter();

	const [step, setStep] = useState<Step>('amount');

	// Amount
	const [amount, setAmount] = useState('');
	const [amountError, setAmountError] = useState('');

	// PIN
	const [pin, setPin] = useState('');
	const [withdrawLoading, setWithdrawLoading] = useState(false);
	const [withdrawError, setWithdrawError] = useState('');

	// Result
	const [reference, setReference] = useState('');

	// ── Derived ───────────────────────────────────────────────────

	const parsedAmount = parseFloat(amount) || 0;
	const totalDeducted = parsedAmount + WITHDRAWAL_FEE;
	const hasSufficientBalance = balance >= totalDeducted;
	const isValidAmount =
		parsedAmount >= MIN_WITHDRAWAL && hasSufficientBalance;

	// ── Withdrawal ────────────────────────────────────────────────

	const handleWithdraw = useCallback(
		async (pinOverride?: string) => {
			const withdrawPin = pinOverride || pin;
			if (!withdrawPin || pin.length < 4) return;
			setWithdrawLoading(true);
			setWithdrawError('');

			try {
				const res = await csrfFetch('/api/wallet/withdraw', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						amount: parsedAmount,
						pin: withdrawPin,
						description: `Withdrawal to ${kycAccount.accountName}`,
					}),
				});

				const json = await res.json();

				if (!res.ok || !json.success) {
					setWithdrawError(
						json.message || 'Withdrawal failed. Please try again.',
					);
					setStep('error');
					return;
				}

				setReference(json.data?.reference ?? '');
				setStep('success');
			} catch {
				setWithdrawError('Network error. Please try again.');
				setStep('error');
			} finally {
				setWithdrawLoading(false);
			}
		},
		[pin, parsedAmount, kycAccount],
	);

	// ── Navigation ────────────────────────────────────────────────

	const goBack = () => {
		switch (step) {
			case 'pin':
				setStep('amount');
				setPin('');
				setWithdrawError('');
				break;
			case 'success':
			case 'error':
				router.push('/wallet');
				break;
			default:
				router.push('/wallet');
		}
	};

	const confirmAmount = () => {
		if (!isValidAmount) {
			if (parsedAmount < MIN_WITHDRAWAL) {
				setAmountError(
					`Minimum withdrawal is ${formatNaira(MIN_WITHDRAWAL)}`,
				);
			} else if (!hasSufficientBalance) {
				setAmountError(
					`Insufficient balance. You need ${formatNaira(totalDeducted)}`,
				);
			}
			return;
		}
		setAmountError('');
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
						{step === 'amount' && 'Withdraw Funds'}
						{step === 'pin' && 'Confirm Withdrawal'}
						{step === 'success' && 'Withdrawal Initiated'}
						{step === 'error' && 'Withdrawal Failed'}
					</h1>
				</div>
			</div>

			<div className='px-4 py-6'>
				{/* ── Step: Enter Amount ────────────────────────────── */}
				{step === 'amount' && (
					<div className='space-y-6'>
						{/* KYC account card */}
						<div className='rounded-xl bg-neutral-900 p-4'>
							<p className='text-xs text-white/50 mb-2 uppercase tracking-wider'>
								Withdrawal Destination
							</p>
							<div className='flex items-center gap-3'>
								<div className='w-10 h-10 rounded-full bg-white/10 flex items-center justify-center'>
									<Landmark className='w-5 h-5 text-white/70' />
								</div>
								<div>
									<p className='text-sm font-medium'>
										{kycAccount.accountName}
									</p>
									<p className='text-xs text-white/60'>
										{maskAccount(kycAccount.accountNumber)}{' '}
										&middot; Bank {kycAccount.bankCode}
									</p>
								</div>
							</div>
							<p className='mt-3 text-[11px] text-white/40'>
								Withdrawals go to your BVN-verified bank account
								only.
							</p>
						</div>

						{/* Available balance */}
						<div className='flex justify-between text-sm'>
							<span className='text-white/60'>
								Available balance
							</span>
							<span
								className={
									balance < MIN_WITHDRAWAL + WITHDRAWAL_FEE ?
										'text-red-400'
									:	'text-white'
								}
							>
								{formatNaira(balance)}
							</span>
						</div>

						{/* Amount input */}
						<div className='text-center space-y-2'>
							<p className='text-sm text-white/70'>
								Enter amount (₦)
							</p>
							<div className='inline-flex items-center'>
								<span className='text-3xl font-semibold text-white/60 mr-1'>
									₦
								</span>
								<input
									type='number'
									inputMode='decimal'
									value={amount}
									onChange={(e) => {
										setAmount(e.target.value);
										setAmountError('');
									}}
									placeholder='0.00'
									className='text-3xl font-semibold bg-transparent border-none outline-none text-center w-44 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
									autoFocus
								/>
							</div>

							{/* Fee breakdown */}
							{parsedAmount > 0 && (
								<div className='mt-3 rounded-xl bg-neutral-900 p-3 text-xs space-y-1.5 text-left'>
									<div className='flex justify-between'>
										<span className='text-white/60'>
											You withdraw
										</span>
										<span>{formatNaira(parsedAmount)}</span>
									</div>
									<div className='flex justify-between'>
										<span className='text-white/60'>
											Service fee
										</span>
										<span className='text-orange-400'>
											{formatNaira(WITHDRAWAL_FEE)}
										</span>
									</div>
									<div className='border-t border-white/10 pt-1.5 flex justify-between font-medium'>
										<span className='text-white/80'>
											Total from wallet
										</span>
										<span>
											{formatNaira(totalDeducted)}
										</span>
									</div>
									<div className='flex justify-between text-green-400'>
										<span>You receive</span>
										<span>{formatNaira(parsedAmount)}</span>
									</div>
								</div>
							)}

							<p className='text-xs text-white/50'>
								Minimum: {formatNaira(MIN_WITHDRAWAL)} &middot;
								Flat {formatNaira(WITHDRAWAL_FEE)} fee
							</p>
						</div>

						{amountError && (
							<div className='rounded-xl bg-red-950/50 border border-red-900/50 px-4 py-3'>
								<p className='text-sm text-red-300'>
									{amountError}
								</p>
							</div>
						)}

						<Button
							onClick={confirmAmount}
							disabled={!amount || parsedAmount <= 0}
							className='w-full rounded-full bg-white text-black hover:bg-white/90 font-medium disabled:opacity-40'
						>
							Continue
						</Button>
					</div>
				)}

				{/* ── Step: Enter PIN ───────────────────────────────── */}
				{step === 'pin' && (
					<div className='space-y-6'>
						{/* Summary card */}
						<div className='rounded-xl bg-neutral-900 p-4 space-y-2 text-sm'>
							<div className='flex justify-between'>
								<span className='text-white/60'>To</span>
								<div className='text-right'>
									<p>{kycAccount.accountName}</p>
									<p className='text-xs text-white/50'>
										{maskAccount(kycAccount.accountNumber)}
									</p>
								</div>
							</div>
							<div className='flex justify-between'>
								<span className='text-white/60'>Amount</span>
								<span className='font-semibold'>
									{formatNaira(parsedAmount)}
								</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-white/60'>Fee</span>
								<span className='text-orange-400'>
									{formatNaira(WITHDRAWAL_FEE)}
								</span>
							</div>
							<div className='border-t border-white/10 pt-2 flex justify-between font-semibold'>
								<span className='text-white/80'>
									Total deducted
								</span>
								<span>{formatNaira(totalDeducted)}</span>
							</div>
						</div>

						{/* PIN OTP */}
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
										handleWithdraw(value)
									}
									disabled={withdrawLoading}
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

						{withdrawError && (
							<div className='rounded-xl bg-red-950/50 border border-red-900/50 px-4 py-3'>
								<p className='text-sm text-red-300'>
									{withdrawError}
								</p>
							</div>
						)}

						<Button
							onClick={() => handleWithdraw()}
							disabled={pin.length < 4 || withdrawLoading}
							className='w-full rounded-full bg-white text-black hover:bg-white/90 font-medium disabled:opacity-40'
						>
							{withdrawLoading ?
								<>
									<Loader2 className='w-4 h-4 animate-spin mr-2' />
									Processing...
								</>
							:	`Withdraw ${formatNaira(parsedAmount)}`}
						</Button>
					</div>
				)}

				{/* ── Step: Success ─────────────────────────────────── */}
				{step === 'success' && (
					<div className='text-center space-y-6 py-8'>
						<div className='w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center'>
							<CheckCircle2 className='w-10 h-10 text-green-400' />
						</div>
						<div>
							<h2 className='text-xl font-semibold'>
								Withdrawal Initiated!
							</h2>
							<p className='text-sm text-white/60 mt-1'>
								{formatNaira(parsedAmount)} is on its way to{' '}
								{kycAccount.accountName}. It may take a few
								minutes.
							</p>
						</div>

						<div className='rounded-xl bg-neutral-900 p-4 space-y-2 text-sm'>
							<div className='flex justify-between'>
								<span className='text-white/60'>To</span>
								<span>{kycAccount.accountName}</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-white/60'>Account</span>
								<span className='font-mono text-xs'>
									{maskAccount(kycAccount.accountNumber)}
								</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-white/60'>Amount</span>
								<span>{formatNaira(parsedAmount)}</span>
							</div>
							{reference && (
								<div className='flex justify-between'>
									<span className='text-white/60'>
										Reference
									</span>
									<span className='font-mono text-xs'>
										{reference}
									</span>
								</div>
							)}
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
									setStep('amount');
									setAmount('');
									setPin('');
									setReference('');
									setWithdrawError('');
								}}
								variant='ghost'
								className='w-full rounded-full text-white/70 hover:text-white hover:bg-white/10'
							>
								<ArrowDownToLine className='w-4 h-4 mr-2' />
								Withdraw Again
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
								Withdrawal Failed
							</h2>
							<p className='text-sm text-white/60 mt-1'>
								{withdrawError ||
									'Something went wrong. Please try again.'}
							</p>
						</div>

						<div className='space-y-2'>
							<Button
								onClick={() => {
									setStep('pin');
									setPin('');
									setWithdrawError('');
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

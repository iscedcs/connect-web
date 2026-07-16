'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
	Copy,
	Check,
	Share2,
	Wallet,
	Users,
	Clock,
	CheckCircle2,
	DollarSign,
	Sparkles,
	ArrowUpRight,
	Loader2,
	Briefcase,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

interface ReferralSummaryProps {
	earnings: { pending: number; available: number; cashedOut: number };
	referralCount: number;
}

interface ReferralClientProps {
	username?: string | null;
	summary?: ReferralSummaryProps | null;
}

function formatNaira(amount: number): string {
	return `₦${amount.toLocaleString('en-NG', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})}`;
}

export default function ReferralClient({ username, summary }: ReferralClientProps) {
	const router = useRouter();
	const displayUsername = username || 'alex_connect';
	const referralCode = displayUsername.replace(/^@/, '');
	const baseUrl =
		process.env.NEXT_PUBLIC_URL ||
		(typeof window !== 'undefined' ? window.location.origin : '');
	const shareableLink = `${baseUrl.replace(/\/$/, '')}/r/${referralCode}`;

	const [copiedCode, setCopiedCode] = useState(false);
	const [copiedLink, setCopiedLink] = useState(false);

	const [earnings, setEarnings] = useState(
		summary?.earnings ?? { pending: 0, available: 0, cashedOut: 0 },
	);
	const totalReferredCount = summary?.referralCount ?? 0;

	const [isCashOutOpen, setIsCashOutOpen] = useState(false);
	const [isCashingOut, setIsCashingOut] = useState(false);
	const [isApplyOpen, setIsApplyOpen] = useState(false);
	const [isApplying, setIsApplying] = useState(false);

	const totalEarnings =
		earnings.pending + earnings.available + earnings.cashedOut;

	const handleCopyCode = async () => {
		try {
			await navigator.clipboard.writeText(referralCode);
			setCopiedCode(true);
			toast.success('Referral code copied to clipboard!');
			setTimeout(() => setCopiedCode(false), 2500);
		} catch {
			toast.error('Failed to copy code');
		}
	};

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(shareableLink);
			setCopiedLink(true);
			toast.success('Referral link copied to clipboard!');
			setTimeout(() => setCopiedLink(false), 2500);
		} catch {
			toast.error('Failed to copy link');
		}
	};

	const handleShare = async () => {
		if (navigator.share) {
			try {
				await navigator.share({
					title: 'Join ISCE Connect',
					text: `Join me on ISCE Connect using my referral code ${referralCode}!`,
					url: shareableLink,
				});
			} catch {
				// User cancelled or share failed silently
			}
		} else {
			handleCopyLink();
		}
	};

	const handleConfirmCashOut = async () => {
		if (earnings.available <= 0) {
			toast.error('No available balance to cash out.');
			return;
		}

		setIsCashingOut(true);
		try {
			const res = await fetch('/api/referral/cash-out', { method: 'POST' });
			const result = await res.json();

			if (!result.success) {
				toast.error(result.message || 'Cash out failed. Please try again.');
				return;
			}

			const cashedAmount = result.data?.amount ?? earnings.available;
			setEarnings((prev) => ({
				...prev,
				available: 0,
				cashedOut: prev.cashedOut + cashedAmount,
			}));
			setIsCashOutOpen(false);
			toast.success(
				`Successfully cashed out ${formatNaira(cashedAmount)} to your wallet!`,
			);
			router.refresh();
		} catch {
			toast.error('Network error. Please try again.');
		} finally {
			setIsCashingOut(false);
		}
	};

	const handleApplyBusinessReferrer = async () => {
		setIsApplying(true);
		try {
			const res = await fetch('/api/referral/business/apply', {
				method: 'POST',
			});
			const result = await res.json();

			if (!result.success) {
				toast.error(result.message || 'Could not submit application.');
				return;
			}

			toast.success(result.message || 'Application submitted!');
			setIsApplyOpen(false);
		} catch {
			toast.error('Network error. Please try again.');
		} finally {
			setIsApplying(false);
		}
	};

	return (
		<div className='max-w-6xl mx-auto space-y-8 pb-12'>
			{/* Hero & Referral Code Card */}
			<div className='relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-950 p-6 md:p-8 shadow-2xl'>
				<div className='absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none' />
				<div className='absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none' />

				<div className='relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8'>
					<div className='space-y-3 max-w-xl'>
						<div className='inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary'>
							<Sparkles className='size-3.5' />
							<span>Refer & Earn Program</span>
						</div>
						<h2 className='text-2xl md:text-3xl font-bold tracking-tight text-white'>
							Share ISCE Connect & earn rewards
						</h2>
						<p className='text-sm md:text-base text-neutral-400 leading-relaxed'>
							Invite your friends to ISCE Connect. They get access to seamless
							digital cards and payments, and you earn a cash bonus for every
							friend who verifies their account.
						</p>
					</div>

					{/* Referral Code Box */}
					<div className='flex flex-col gap-4 w-full lg:w-auto min-w-[320px] rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-md'>
						<div className='space-y-1.5'>
							<span className='text-xs font-medium uppercase tracking-wider text-neutral-400'>
								Your Referral Code
							</span>
							<div className='flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-neutral-900/80 px-4 py-2.5'>
								<span className='font-mono text-lg font-bold tracking-wide text-white'>
									{referralCode}
								</span>
								<Button
									size='sm'
									variant='secondary'
									onClick={handleCopyCode}
									className='h-8 px-3 text-xs gap-1.5 shrink-0'
								>
									{copiedCode ? (
										<>
											<Check className='size-3.5 text-emerald-400' />
											<span>Copied</span>
										</>
									) : (
										<>
											<Copy className='size-3.5' />
											<span>Copy</span>
										</>
									)}
								</Button>
							</div>
						</div>

						<div className='space-y-1.5'>
							<span className='text-xs font-medium uppercase tracking-wider text-neutral-400'>
								Shareable Link
							</span>
							<div className='flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-neutral-900/80 pl-3 pr-1.5 py-1.5'>
								<span className='text-xs text-neutral-300 truncate max-w-[200px] md:max-w-[240px]'>
									{shareableLink}
								</span>
								<div className='flex items-center gap-1.5 shrink-0'>
									<Button
										size='sm'
										variant='ghost'
										onClick={handleCopyLink}
										className='h-7 w-7 p-0 text-neutral-400 hover:text-white'
										title='Copy link'
									>
										{copiedLink ? (
											<Check className='size-3.5 text-emerald-400' />
										) : (
											<Copy className='size-3.5' />
										)}
									</Button>
									<Button
										size='sm'
										variant='secondary'
										onClick={handleShare}
										className='h-7 px-2.5 text-xs gap-1'
									>
										<Share2 className='size-3' />
										<span>Share</span>
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Total Earnings & Breakdown Grid */}
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
				{/* Total Earnings */}
				<div className='relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/90 p-5 space-y-3'>
					<div className='flex items-center justify-between'>
						<span className='text-xs font-medium text-neutral-400 uppercase tracking-wider'>
							Total Earnings
						</span>
						<div className='rounded-lg bg-primary/10 p-2 text-primary'>
							<DollarSign className='size-4' />
						</div>
					</div>
					<div>
						<div className='text-2xl font-bold text-white tracking-tight'>
							{formatNaira(totalEarnings)}
						</div>
						<p className='text-xs text-neutral-400 mt-1'>
							Lifetime rewards accumulated
						</p>
					</div>
				</div>

				{/* Available Balance & Cash Out */}
				<div className='relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-neutral-900 via-neutral-900 to-emerald-950/30 p-5 space-y-3'>
					<div className='flex items-center justify-between'>
						<span className='text-xs font-medium text-emerald-400 uppercase tracking-wider flex items-center gap-1.5'>
							<span className='size-2 rounded-full bg-emerald-400 animate-pulse' />
							Available
						</span>
						<div className='rounded-lg bg-emerald-500/10 p-2 text-emerald-400'>
							<Wallet className='size-4' />
						</div>
					</div>
					<div className='flex items-baseline justify-between gap-2'>
						<div>
							<div className='text-2xl font-bold text-white tracking-tight'>
								{formatNaira(earnings.available)}
							</div>
							<p className='text-xs text-neutral-400 mt-1'>
								Ready for withdrawal
							</p>
						</div>
					</div>
					<Button
						size='sm'
						disabled={earnings.available <= 0}
						onClick={() => setIsCashOutOpen(true)}
						className='w-full mt-2 h-9 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs transition shadow-lg shadow-emerald-500/20'
					>
						<span>Cash Out</span>
						<ArrowUpRight className='size-3.5 ml-1' />
					</Button>
				</div>

				{/* Pending Earnings */}
				<div className='relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/90 p-5 space-y-3'>
					<div className='flex items-center justify-between'>
						<span className='text-xs font-medium text-amber-400 uppercase tracking-wider'>
							Pending
						</span>
						<div className='rounded-lg bg-amber-500/10 p-2 text-amber-400'>
							<Clock className='size-4' />
						</div>
					</div>
					<div>
						<div className='text-2xl font-bold text-white tracking-tight'>
							{formatNaira(earnings.pending)}
						</div>
						<p className='text-xs text-neutral-400 mt-1'>
							Awaiting referral verification
						</p>
					</div>
				</div>

				{/* Cashed Out */}
				<div className='relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/90 p-5 space-y-3'>
					<div className='flex items-center justify-between'>
						<span className='text-xs font-medium text-neutral-400 uppercase tracking-wider'>
							Cashed Out
						</span>
						<div className='rounded-lg bg-blue-500/10 p-2 text-blue-400'>
							<CheckCircle2 className='size-4' />
						</div>
					</div>
					<div>
						<div className='text-2xl font-bold text-white tracking-tight'>
							{formatNaira(earnings.cashedOut)}
						</div>
						<p className='text-xs text-neutral-400 mt-1'>
							Previously withdrawn
						</p>
					</div>
				</div>
			</div>

			{/* Referred Users Section */}
			<div className='rounded-3xl border border-white/10 bg-neutral-900/80 p-6 space-y-6'>
				<div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
					<div>
						<div className='flex items-center gap-2.5'>
							<div className='rounded-xl bg-primary/10 p-2.5 text-primary'>
								<Users className='size-5' />
							</div>
							<div>
								<h3 className='text-lg font-semibold text-white'>
									Your Referrals
								</h3>
								<p className='text-xs text-neutral-400'>
									You have referred a total of{' '}
									<span className='text-white font-medium'>
										{totalReferredCount} people
									</span>
								</p>
							</div>
						</div>
					</div>

				</div>
				<p className='text-sm text-neutral-400'>
					Every friend who verifies their account and makes a purchase adds to
					your earnings above. Individual referral activity isn&apos;t broken
					down per-person yet — check your earnings breakdown for the totals.
				</p>
			</div>

			{/* Business Referrer Section */}
			<div className='rounded-3xl border border-white/10 bg-neutral-900/80 p-6'>
				<div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
					<div className='flex items-center gap-2.5'>
						<div className='rounded-xl bg-primary/10 p-2.5 text-primary'>
							<Briefcase className='size-5' />
						</div>
						<div>
							<h3 className='text-lg font-semibold text-white'>
								Business Referrer
							</h3>
							<p className='text-xs text-neutral-400 max-w-md'>
								Organizations and high-volume promoters can apply for a
								negotiated per-unit reward rate, subject to admin approval.
							</p>
						</div>
					</div>
					<Button
						variant='secondary'
						onClick={() => setIsApplyOpen(true)}
						className='shrink-0'
					>
						Apply for Business Referrer status
					</Button>
				</div>
			</div>

			{/* Business Referrer Apply Modal */}
			<Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
				<DialogContent className='bg-neutral-900 border border-white/10 text-white max-w-md rounded-2xl'>
					<DialogHeader>
						<DialogTitle className='text-xl font-bold flex items-center gap-2'>
							<Briefcase className='size-5 text-primary' />
							<span>Apply for Business Referrer Status</span>
						</DialogTitle>
						<DialogDescription className='text-neutral-400 text-sm'>
							Submit an application to become a Business Referrer with a
							negotiated reward rate. Our team will review it and reach out
							with next steps.
						</DialogDescription>
					</DialogHeader>

					<DialogFooter className='flex items-center justify-end gap-2 sm:gap-2'>
						<Button
							variant='ghost'
							onClick={() => setIsApplyOpen(false)}
							disabled={isApplying}
							className='text-neutral-400 hover:text-white'
						>
							Cancel
						</Button>
						<Button
							onClick={handleApplyBusinessReferrer}
							disabled={isApplying}
							className='font-semibold'
						>
							{isApplying ? (
								<>
									<Loader2 className='size-4 animate-spin mr-1.5' />
									<span>Submitting...</span>
								</>
							) : (
								<span>Submit Application</span>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Cash Out Modal */}
			<Dialog open={isCashOutOpen} onOpenChange={setIsCashOutOpen}>
				<DialogContent className='bg-neutral-900 border border-white/10 text-white max-w-md rounded-2xl'>
					<DialogHeader>
						<DialogTitle className='text-xl font-bold flex items-center gap-2'>
							<Wallet className='size-5 text-emerald-400' />
							<span>Cash Out Referral Rewards</span>
						</DialogTitle>
						<DialogDescription className='text-neutral-400 text-sm'>
							Transfer your available referral earnings instantly to your ISCE
							wallet balance.
						</DialogDescription>
					</DialogHeader>

					<div className='my-4 space-y-4 rounded-xl bg-black/50 border border-white/10 p-4'>
						<div className='flex items-center justify-between text-sm'>
							<span className='text-neutral-400'>Available to Cash Out</span>
							<span className='text-lg font-bold text-emerald-400'>
								{formatNaira(earnings.available)}
							</span>
						</div>
						<div className='border-t border-white/10 pt-3 flex items-center justify-between text-xs'>
							<span className='text-neutral-400'>Destination</span>
							<span className='text-white font-medium'>
								ISCE Wallet Balance
							</span>
						</div>
					</div>

					<DialogFooter className='flex items-center justify-end gap-2 sm:gap-2'>
						<Button
							variant='ghost'
							onClick={() => setIsCashOutOpen(false)}
							disabled={isCashingOut}
							className='text-neutral-400 hover:text-white'
						>
							Cancel
						</Button>
						<Button
							onClick={handleConfirmCashOut}
							disabled={isCashingOut || earnings.available <= 0}
							className='bg-emerald-500 hover:bg-emerald-600 text-black font-semibold'
						>
							{isCashingOut ? (
								<>
									<Loader2 className='size-4 animate-spin mr-1.5' />
									<span>Processing...</span>
								</>
							) : (
								<span>Confirm Withdrawal</span>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

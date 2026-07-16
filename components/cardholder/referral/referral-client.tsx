'use client';

import React, { useState, useMemo } from 'react';
import {
	Copy,
	Check,
	Share2,
	Wallet,
	Gift,
	/* Users, */
	Clock,
	CheckCircle2,
	DollarSign,
	/* Search, */
	Sparkles,
	ArrowUpRight,
	ExternalLink,
	Loader2,
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

import { ReferralData } from '@/lib/services/referral';

interface ReferralClientProps {
	username?: string | null;
	initialData?: ReferralData | null;
}

/* Commented out referrals table for the mean time
interface ReferredUser {
	id: string;
	name: string;
	username: string;
	date: string;
	status: 'AVAILABLE' | 'PENDING' | 'CASHED_OUT';
	reward: number;
}

const DUMMY_REFERRED_USERS: ReferredUser[] = [
	{
		id: '1',
		name: 'Amaka Okafor',
		username: '@amaka_o',
		date: '10 Jul 2026',
		status: 'AVAILABLE',
		reward: 5000,
	},
	{
		id: '2',
		name: 'Tunde Adeleke',
		username: '@tunde_connect',
		date: '08 Jul 2026',
		status: 'AVAILABLE',
		reward: 5000,
	},
	{
		id: '3',
		name: 'Grace Nwosu',
		username: '@grace_n',
		date: '07 Jul 2026',
		status: 'PENDING',
		reward: 5000,
	},
	{
		id: '4',
		name: 'Emmanuel Johnson',
		username: '@emmanuel_j',
		date: '05 Jul 2026',
		status: 'AVAILABLE',
		reward: 5000,
	},
	{
		id: '5',
		name: 'Fatima Bello',
		username: '@fatima_b',
		date: '03 Jul 2026',
		status: 'PENDING',
		reward: 5000,
	},
	{
		id: '6',
		name: 'David Eze',
		username: '@david_eze',
		date: '01 Jul 2026',
		status: 'AVAILABLE',
		reward: 5000,
	},
	{
		id: '7',
		name: 'Zainab Balogun',
		username: '@zainab_b',
		date: '28 Jun 2026',
		status: 'AVAILABLE',
		reward: 5000,
	},
	{
		id: '8',
		name: 'Chijioke Williams',
		username: '@chijioke_w',
		date: '25 Jun 2026',
		status: 'CASHED_OUT',
		reward: 5000,
	},
	{
		id: '9',
		name: 'Kemi Adebayo',
		username: '@kemi_ade',
		date: '20 Jun 2026',
		status: 'CASHED_OUT',
		reward: 5000,
	},
	{
		id: '10',
		name: 'Samuel Okon',
		username: '@sammie_ok',
		date: '18 Jun 2026',
		status: 'PENDING',
		reward: 5000,
	},
	{
		id: '11',
		name: 'Blessing Udoh',
		username: '@blessing_u',
		date: '15 Jun 2026',
		status: 'CASHED_OUT',
		reward: 5000,
	},
	{
		id: '12',
		name: 'Ibrahim Sani',
		username: '@ibrahim_s',
		date: '12 Jun 2026',
		status: 'AVAILABLE',
		reward: 5000,
	},
];
*/

function formatNaira(amount: number): string {
	return `₦${amount.toLocaleString('en-NG', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})}`;
}

export default function ReferralClient({
	username,
	initialData,
}: ReferralClientProps) {
	const displayUsername = username || initialData?.code || 'alex_connect';
	const referralCode = displayUsername.replace(/^@/, '');
	const baseUrl =
		process.env.NEXT_PUBLIC_URL ||
		(typeof window !== 'undefined' ? window.location.origin : '');
	const shareableLink = `${baseUrl.replace(/\/$/, '')}/r/${referralCode}`;

	const [copiedCode, setCopiedCode] = useState(false);
	const [copiedLink, setCopiedLink] = useState(false);
	/* Commented out referrals table for the mean time
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<
		'ALL' | 'AVAILABLE' | 'PENDING' | 'CASHED_OUT'
	>('ALL');
	*/

	// Earnings state initialized from API response or fallback dummy
	const [earnings, setEarnings] = useState({
		pending: initialData?.earnings?.pending ?? 15000,
		available: initialData?.earnings?.available ?? 45000,
		cashedOut: initialData?.earnings?.cashedOut ?? 65000,
	});

	const [isCashOutOpen, setIsCashOutOpen] = useState(false);
	const [isCashingOut, setIsCashingOut] = useState(false);

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

	const handleConfirmCashOut = () => {
		if (earnings.available <= 0) {
			toast.error('No available balance to cash out.');
			return;
		}

		setIsCashingOut(true);
		setTimeout(() => {
			const cashedAmount = earnings.available;
			setEarnings((prev) => ({
				...prev,
				available: 0,
				cashedOut: prev.cashedOut + cashedAmount,
			}));
			setIsCashingOut(false);
			setIsCashOutOpen(false);
			toast.success(
				`Successfully cashed out ${formatNaira(cashedAmount)} to your wallet!`,
			);
		}, 1200);
	};

	/* Commented out referrals table for the mean time
	const filteredUsers = useMemo(() => {
		return DUMMY_REFERRED_USERS.filter((user) => {
			const matchesSearch =
				user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				user.username.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesStatus =
				statusFilter === 'ALL' || user.status === statusFilter;

			return matchesSearch && matchesStatus;
		});
	}, [searchQuery, statusFilter]);

	const totalReferredCount = initialData?.referralCount ?? 24;
	*/

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

			{/* Referred Users Section (commented out for the mean time) */}
			{/*
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

					{/* Search & Filter Controls - inner comment * /}
					<div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
						{/* Search Input - inner comment * /}
						<div className='relative'>
							<Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400' />
							<input
								type='text'
								placeholder='Search referred friends...'
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className='w-full sm:w-60 h-9 rounded-xl border border-white/10 bg-black/50 pl-9 pr-3 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white/30 transition'
							/>
						</div>

						{/* Status Filter Pills - inner comment * /}
						<div className='flex items-center gap-1.5 overflow-x-auto p-1 rounded-xl bg-black/40 border border-white/5'>
							{(
								['ALL', 'AVAILABLE', 'PENDING', 'CASHED_OUT'] as const
							).map((status) => (
								<button
									key={status}
									type='button'
									onClick={() => setStatusFilter(status)}
									className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
										statusFilter === status
											? 'bg-neutral-800 text-white shadow-sm'
											: 'text-neutral-400 hover:text-white'
									}`}
								>
									{status === 'ALL'
										? 'All'
										: status === 'AVAILABLE'
											? 'Available'
											: status === 'PENDING'
												? 'Pending'
												: 'Cashed Out'}
								</button>
							))}
						</div>
					</div>
				</div>

				{/* Referred Users Table / List - inner comment * /}
				<div className='overflow-x-auto'>
					<table className='w-full border-collapse text-left'>
						<thead>
							<tr className='border-b border-white/10 text-xs font-medium text-neutral-400 uppercase tracking-wider'>
								<th className='py-3 px-4'>User</th>
								<th className='py-3 px-4'>Date Referred</th>
								<th className='py-3 px-4'>Status</th>
								<th className='py-3 px-4 text-right'>Reward</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-white/5 text-sm'>
							{filteredUsers.length === 0 ? (
								<tr>
									<td colSpan={4} className='py-12 text-center text-neutral-500'>
										No referred users match your search criteria.
									</td>
								</tr>
							) : (
								filteredUsers.map((user) => (
									<tr
										key={user.id}
										className='hover:bg-white/[0.02] transition-colors'
									>
										<td className='py-3.5 px-4'>
											<div className='flex items-center gap-3'>
												<div className='h-9 w-9 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center font-semibold text-xs text-neutral-300'>
													{user.name
														.split(' ')
														.map((n) => n[0])
														.join('')}
												</div>
												<div>
													<p className='font-medium text-white'>
														{user.name}
													</p>
													<p className='text-xs text-neutral-400'>
														{user.username}
													</p>
												</div>
											</div>
										</td>
										<td className='py-3.5 px-4 text-xs text-neutral-400'>
											{user.date}
										</td>
										<td className='py-3.5 px-4'>
											<span
												className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${
													user.status === 'AVAILABLE'
														? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
														: user.status === 'PENDING'
															? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
															: 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
												}`}
											>
												<span
													className={`size-1.5 rounded-full ${
														user.status === 'AVAILABLE'
															? 'bg-emerald-400'
															: user.status === 'PENDING'
																? 'bg-amber-400'
																: 'bg-blue-400'
													}`}
												/>
												{user.status === 'AVAILABLE'
													? 'Available'
													: user.status === 'PENDING'
														? 'Pending'
														: 'Cashed Out'}
											</span>
										</td>
										<td className='py-3.5 px-4 text-right font-medium text-white'>
											+{formatNaira(user.reward)}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
			*/}

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

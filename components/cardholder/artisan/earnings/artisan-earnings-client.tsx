'use client';

import type { EarningsData, ArtisanProfile } from '@/lib/types/artisan';
import { ArrowLeft, TrendingUp, CheckCircle, Star, Wallet } from 'lucide-react';
import Link from 'next/link';

interface ArtisanEarningsClientProps {
	earnings: EarningsData | null;
	artisan: ArtisanProfile;
}

function StatCard({
	icon: Icon,
	label,
	value,
	sub,
}: {
	icon: React.ElementType;
	label: string;
	value: string;
	sub?: string;
}) {
	return (
		<div className='bg-white/5 rounded-xl p-4 space-y-2'>
			<div className='flex items-center gap-2 text-white/50'>
				<Icon className='size-4' />
				<span className='text-[10px] uppercase tracking-wider'>
					{label}
				</span>
			</div>
			<p className='text-xl font-semibold'>{value}</p>
			{sub && <p className='text-xs text-white/40'>{sub}</p>}
		</div>
	);
}

export default function ArtisanEarningsClient({
	earnings,
	artisan,
}: ArtisanEarningsClientProps) {
	const data = earnings ?? {
		totalEarnings: 0,
		totalBookings: 0,
		averageRating: 0,
		totalReviews: 0,
		recentTransactions: [],
	};

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center gap-3'>
				<Link
					href='/connect/artisan'
					className='p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors'
				>
					<ArrowLeft className='size-4' />
				</Link>
				<div>
					<h1 className='text-xl font-semibold'>Earnings</h1>
					<p className='text-xs text-white/50'>
						{artisan.profile?.name || 'Your Artisan Profile'}
					</p>
				</div>
			</div>

			{/* Total Earnings Hero */}
			<div className='bg-gradient-to-br from-purple-600/30 to-purple-900/30 rounded-2xl p-6 border border-purple-500/20 text-center'>
				<p className='text-xs text-white/50 mb-1'>Total Earnings</p>
				<p className='text-3xl font-bold'>
					₦{data.totalEarnings.toLocaleString()}
				</p>
				<p className='text-xs text-white/40 mt-2'>
					From {data.totalBookings} booking
					{data.totalBookings !== 1 ? 's' : ''}
				</p>
			</div>

			{/* Stats Grid */}
			<div className='grid grid-cols-2 gap-3'>
				<StatCard
					icon={Wallet}
					label='Total Bookings'
					value={String(data.totalBookings)}
				/>
				<StatCard
					icon={Star}
					label='Avg Rating'
					value={
						data.averageRating > 0 ?
							data.averageRating.toFixed(1)
						:	'—'
					}
					sub={data.averageRating > 0 ? 'out of 5' : 'No ratings yet'}
				/>
				<StatCard
					icon={TrendingUp}
					label='Total Earnings'
					value={`₦${data.totalEarnings.toLocaleString()}`}
				/>
				<StatCard
					icon={CheckCircle}
					label='Reviews'
					value={String(data.totalReviews)}
				/>
			</div>

			{/* Recent Transactions */}
			{data.recentTransactions.length > 0 && (
				<div className='bg-white/5 rounded-xl p-4 space-y-3'>
					<p className='text-xs text-white/50 uppercase tracking-wider'>
						Recent Transactions
					</p>
					{data.recentTransactions.map((tx) => (
						<div
							key={tx.id}
							className='flex items-center justify-between border-t border-white/5 pt-2 first:border-0 first:pt-0'
						>
							<div>
								<p className='text-sm text-white/80'>
									₦{tx.amount.toLocaleString()}
								</p>
								<p className='text-[10px] text-white/40'>
									{new Date(tx.createdAt).toLocaleDateString(
										'en-NG',
										{
											month: 'short',
											day: 'numeric',
										},
									)}
								</p>
							</div>
							<span
								className={`text-[10px] px-1.5 py-0.5 rounded-full ${
									tx.type === 'CREDIT' ?
										'bg-emerald-500/20 text-emerald-300'
									:	'bg-red-500/20 text-red-300'
								}`}
							>
								{tx.type}
							</span>
						</div>
					))}
				</div>
			)}

			{/* Info note */}
			<div className='bg-white/5 rounded-xl p-4'>
				<p className='text-xs text-white/50'>
					Earnings are calculated from completed bookings. Pending and
					in-progress bookings are not included in the totals.
				</p>
			</div>
		</div>
	);
}

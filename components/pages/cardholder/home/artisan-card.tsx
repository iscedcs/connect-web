'use client';

import { Button } from '@/components/ui/button';
import type { ArtisanProfile } from '@/lib/types/artisan';
import {
	ArrowRight,
	Briefcase,
	Star,
	CalendarCheck,
	TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

interface ArtisanCardProps {
	artisanProfile: ArtisanProfile | null;
}

/** CTA card shown when user is not yet an artisan */
function BecomeArtisanCTA() {
	return (
		<div className='bg-neutral-900 rounded-3xl p-8 flex flex-col gap-8'>
			<div className='bg-purple-500/20 w-14 h-14 rounded-2xl flex items-center justify-center'>
				<Briefcase className='w-7 h-7 text-purple-400' />
			</div>
			<div>
				<p className='text-[12px] text-white/60'>
					Offer your services on ISCE Connect
				</p>
				<div className='flex items-start justify-between mt-3'>
					<h3 className='text-[22px] leading-[1.2] font-normal w-[75%]'>
						Become an Artisan
						<br /> & grow your business
					</h3>
					<Link href='/connect/artisan/setup'>
						<ArrowRight className='size-5 mt-1 text-white hover:translate-x-1 transition-transform' />
					</Link>
				</div>
			</div>
		</div>
	);
}

/** Summary card shown when user is already an artisan */
function ArtisanSummaryCard({ artisan }: { artisan: ArtisanProfile }) {
	const isPending = artisan.status === 'PENDING_REVIEW';
	const isSuspended = artisan.status === 'SUSPENDED';
	const isDeactivated = artisan.status === 'DEACTIVATED';
	const isActive = artisan.status === 'ACTIVE';

	const statusLabel =
		isPending ? 'Pending Review'
		: isSuspended ? 'Suspended'
		: isDeactivated ? 'Deactivated'
		: 'Active';

	const statusColor =
		isActive ? 'text-emerald-400'
		: isPending ? 'text-amber-400'
		: 'text-red-400';

	const displayName = artisan.profile?.name || 'Artisan';

	return (
		<div className='overflow-hidden'>
			<div className='relative border-2 border-[#868686] rounded-2xl bg-gradient-to-br from-purple-950 to-neutral-900'>
				<div className='p-6 space-y-4'>
					{/* Header */}
					<div className='flex items-start justify-between'>
						<div>
							<p className='text-sm text-purple-400 font-medium'>
								Artisan Profile
							</p>
							<h3 className='text-lg font-bold text-white mt-1'>
								{displayName}
							</h3>
							<p className={`text-xs mt-0.5 ${statusColor}`}>
								{statusLabel}
							</p>
						</div>
						<div className='bg-purple-500/20 p-2 rounded-xl'>
							<Briefcase className='w-6 h-6 text-purple-400' />
						</div>
					</div>

					{/* Stats row */}
					{isActive && (
						<div className='grid grid-cols-3 gap-3'>
							<div className='bg-white/5 rounded-xl p-3 text-center'>
								<div className='flex items-center justify-center gap-1 text-amber-400'>
									<Star className='size-3.5 fill-amber-400' />
									<span className='text-base font-semibold'>
										{artisan.averageRating > 0 ?
											Number(
												artisan.averageRating,
											).toFixed(1)
										:	'—'}
									</span>
								</div>
								<p className='text-[10px] text-white/50 mt-1'>
									Rating
								</p>
							</div>
							<div className='bg-white/5 rounded-xl p-3 text-center'>
								<div className='flex items-center justify-center gap-1 text-blue-400'>
									<CalendarCheck className='size-3.5' />
									<span className='text-base font-semibold'>
										{artisan.totalReviews}
									</span>
								</div>
								<p className='text-[10px] text-white/50 mt-1'>
									Reviews
								</p>
							</div>
							<div className='bg-white/5 rounded-xl p-3 text-center'>
								<div className='flex items-center justify-center gap-1 text-emerald-400'>
									<TrendingUp className='size-3.5' />
									<span className='text-base font-semibold'>
										{artisan.totalBookings}
									</span>
								</div>
								<p className='text-[10px] text-white/50 mt-1'>
									Bookings
								</p>
							</div>
						</div>
					)}

					{/* Action button */}
					<Link href='/connect/artisan'>
						<Button
							variant='outline'
							className='w-full bg-white/5 border-white/10 text-white hover:bg-white/10 mt-2'
						>
							{isPending ? 'View Status' : 'Manage Artisan'}
							<ArrowRight className='ml-2 size-4' />
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}

export default function ArtisanCard({ artisanProfile }: ArtisanCardProps) {
	if (!artisanProfile) {
		return <BecomeArtisanCTA />;
	}

	return <ArtisanSummaryCard artisan={artisanProfile} />;
}

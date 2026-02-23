'use client';

import type { Review, ArtisanProfile } from '@/lib/types/artisan';
import { ArrowLeft, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface ArtisanReviewsClientProps {
	reviewsData: {
		reviews: Review[];
		total: number;
		page: number;
		totalPages: number;
	};
	artisan: ArtisanProfile;
}

function Stars({ rating }: { rating: number }) {
	return (
		<div className='flex gap-0.5'>
			{[1, 2, 3, 4, 5].map((i) => (
				<Star
					key={i}
					className={`size-3.5 ${
						i <= rating ?
							'fill-yellow-400 text-yellow-400'
						:	'text-white/20'
					}`}
				/>
			))}
		</div>
	);
}

export default function ArtisanReviewsClient({
	reviewsData,
	artisan,
}: ArtisanReviewsClientProps) {
	const reviews = reviewsData?.reviews ?? [];
	const total = reviewsData?.total ?? 0;

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
					<h1 className='text-xl font-semibold'>Reviews</h1>
					<p className='text-xs text-white/50'>
						{total} review{total !== 1 ? 's' : ''} &middot;{' '}
						{artisan.averageRating > 0 ?
							`${artisan.averageRating.toFixed(1)} avg`
						:	'No ratings yet'}
					</p>
				</div>
			</div>

			{/* Summary */}
			{artisan.averageRating > 0 && (
				<div className='bg-gradient-to-br from-purple-600/30 to-purple-900/30 rounded-2xl p-5 border border-purple-500/20 flex items-center gap-4'>
					<div className='text-center'>
						<p className='text-3xl font-bold'>
							{artisan.averageRating.toFixed(1)}
						</p>
						<Stars rating={Math.round(artisan.averageRating)} />
					</div>
					<div className='text-xs text-white/50 space-y-1'>
						<p>{total} total reviews</p>
						<p>
							{artisan.totalBookings} booking
							{artisan.totalBookings !== 1 ? 's' : ''}
						</p>
					</div>
				</div>
			)}

			{/* Review List */}
			{reviews.length === 0 ?
				<div className='bg-white/5 rounded-xl p-8 text-center text-white/40'>
					<Star className='size-8 mx-auto mb-3 opacity-50' />
					<p className='text-sm font-medium mb-1'>No reviews yet</p>
					<p className='text-xs'>
						Reviews will appear here after customers rate your
						services.
					</p>
				</div>
			:	<div className='space-y-3'>
					{reviews.map((review) => (
						<div
							key={review.id}
							className='bg-white/5 rounded-xl p-4 space-y-3'
						>
							<div className='flex items-center gap-3'>
								{review.reviewer?.displayPicture ?
									<Image
										src={review.reviewer.displayPicture}
										alt=''
										width={32}
										height={32}
										className='size-8 rounded-full object-cover'
									/>
								:	<div className='size-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium'>
										{review.reviewer?.firstName?.[0] ?? '?'}
									</div>
								}
								<div className='flex-1 min-w-0'>
									<p className='text-sm font-medium truncate'>
										{review.reviewer ?
											`${review.reviewer.firstName} ${review.reviewer.lastName}`
										:	'Anonymous'}
									</p>
									<p className='text-[10px] text-white/40'>
										{new Date(
											review.createdAt,
										).toLocaleDateString(undefined, {
											year: 'numeric',
											month: 'short',
											day: 'numeric',
										})}
									</p>
								</div>
								<Stars rating={review.rating} />
							</div>

							{review.comment && (
								<p className='text-sm text-white/70 leading-relaxed'>
									{review.comment}
								</p>
							)}
						</div>
					))}
				</div>
			}
		</div>
	);
}

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import type {
  ArtisanCategoryMap,
  ArtisanService,
  PortfolioItem,
  Review,
  WorkingHoursEntry,
} from "@/lib/types/artisan";

export interface PublicArtisanData {
  id: string;
  bio: string | null;
  averageRating: number | string;
  totalReviews: number;
  totalBookings: number;
  workingHours: WorkingHoursEntry[] | null;
  categories: ArtisanCategoryMap[];
  services: ArtisanService[];
  portfolio: PortfolioItem[];
}

/* ── Star renderer ── */

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`h-3.5 w-3.5 ${s <= Math.round(rating) ? "text-yellow-400" : "text-white/20"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

/* ── Price display ── */

function PriceLabel({
  price,
  currency,
}: {
  price: number | string | null;
  currency: string;
}) {
  if (!price || Number(price) === 0) {
    return (
      <span className="text-purple-300 text-xs font-medium">Get a quote</span>
    );
  }
  const formatted = Number(price).toLocaleString();
  return (
    <span className="text-purple-300 text-xs font-medium">
      {currency} {formatted}
    </span>
  );
}

/* ── Portfolio lightbox ── */

function PortfolioGallery({ items }: { items: PortfolioItem[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const imageItems = items.filter((p) => p.type === "image" && p.url);

  if (imageItems.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-3 gap-1.5">
        {imageItems.slice(0, 9).map((img, i) => (
          <button
            key={img.id}
            onClick={() => setSelected(img.url)}
            className="aspect-square rounded-lg overflow-hidden relative group"
          >
            <Image
              src={img.url}
              alt={img.caption || "Portfolio"}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
              unoptimized
            />
            {i === 8 && imageItems.length > 9 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  +{imageItems.length - 9}
                </span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl"
            onClick={() => setSelected(null)}
          >
            ✕
          </button>
          <Image
            src={selected}
            alt="Portfolio image"
            width={800}
            height={600}
            className="max-h-[80vh] w-auto rounded-lg object-contain"
            unoptimized
          />
        </div>
      )}
    </>
  );
}

/* ── Reviews section ── */

function ReviewCard({ review }: { review: Review }) {
  const name =
    review.reviewer?.name?.trim() || review.reviewerName || "Anonymous";
  return (
    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
      <div className="flex items-center gap-2 mb-1.5">
        {review.reviewer?.profilePhoto ? (
          <Image
            src={review.reviewer.profilePhoto}
            alt={name}
            width={28}
            height={28}
            className="rounded-full object-cover"
            unoptimized
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 text-xs font-bold">
            {name.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{name}</p>
          <Stars rating={review.rating} />
        </div>
        <span className="text-[10px] text-white/40">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>
      {review.comment && (
        <p className="text-xs text-white/60 leading-relaxed">
          {review.comment}
        </p>
      )}
    </div>
  );
}

/* ── Main component ── */

export default function ArtisanProfileSection({
	artisan,
	reviews: reviewsProp,
	profileName,
}: {
	artisan: PublicArtisanData;
	reviews: Review[];
	profileName: string;
}) {
	const reviews = reviewsProp ?? [];
	const [tab, setTab] = useState<'services' | 'portfolio' | 'reviews'>(
		'services',
	);

	const rating = Number(artisan.averageRating || 0);
	const primaryCategory = artisan.categories.find((c) => c.isPrimary);

	return (
		<section className='mt-6 px-4'>
			{/* Artisan badge + summary */}
			<div className='bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 mb-5'>
				<div className='flex items-center gap-2 mb-2'>
					<span className='px-2 py-0.5 bg-purple-600 rounded-full text-[10px] font-semibold uppercase tracking-wider'>
						Pro Artisan
					</span>
					{primaryCategory && (
						<span className='text-xs text-purple-300'>
							{primaryCategory.category.name}
						</span>
					)}
				</div>

				{artisan.bio && (
					<p className='text-xs text-white/70 leading-relaxed mb-3'>
						{artisan.bio}
					</p>
				)}

				<div className='flex items-center gap-4 text-xs'>
					<div className='flex items-center gap-1'>
						<Stars rating={rating} />
						<span className='text-white/60'>
							{rating.toFixed(1)} ({artisan.totalReviews})
						</span>
					</div>
					<span className='text-white/40'>
						{artisan.totalBookings} booking
						{artisan.totalBookings !== 1 ? 's' : ''}
					</span>
				</div>

				{artisan.categories.length > 1 && (
					<div className='flex flex-wrap gap-1.5 mt-3'>
						{artisan.categories.map((c) => (
							<span
								key={c.id}
								className='px-2 py-0.5 bg-white/5 rounded-full text-[10px] text-white/60'
							>
								{c.category.name}
							</span>
						))}
					</div>
				)}

				{/* Inquiry button */}
				<Link
					href={`/connect/artisan/threads/new?artisanId=${artisan.id}`}
					className='mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition'
				>
					<MessageSquare className='w-4 h-4' />
					Send Inquiry
				</Link>
			</div>

			{/* Tabs */}
			<div className='flex gap-6 text-sm mb-4'>
				{(['services', 'portfolio', 'reviews'] as const).map((t) => (
					<button
						key={t}
						onClick={() => setTab(t)}
						className={`pb-1.5 capitalize ${
							tab === t ?
								'font-semibold border-b-2 border-purple-500 text-white'
							:	'text-white/50'
						}`}
					>
						{t}
						{t === 'reviews' && artisan.totalReviews > 0 && (
							<span className='ml-1 text-[10px] text-white/40'>
								({artisan.totalReviews})
							</span>
						)}
					</button>
				))}
			</div>

			{/* Services tab */}
			{tab === 'services' && (
				<div className='space-y-2'>
					{artisan.services.length === 0 && (
						<p className='text-xs text-white/40 py-4 text-center'>
							No services listed yet.
						</p>
					)}
					{artisan.services.map((service) => (
						<div
							key={service.id}
							className='bg-white/5 rounded-xl p-3.5 border border-white/5'
						>
							<div className='flex items-start justify-between gap-2'>
								<div className='min-w-0 flex-1'>
									<h4 className='text-sm font-medium truncate'>
										{service.name}
									</h4>
									{service.description && (
										<p className='text-xs text-white/50 mt-0.5 line-clamp-2'>
											{service.description}
										</p>
									)}
								</div>
								<PriceLabel
									price={service.price}
									currency={service.currency}
								/>
							</div>
							<Link
								href={`/connect/artisan/threads/new?artisanId=${artisan.id}&serviceId=${service.id}`}
								className='mt-2 flex items-center justify-center gap-1.5 w-full py-2 bg-purple-600/10 hover:bg-purple-600/20 text-purple-300 text-xs font-medium rounded-lg transition'
							>
								<MessageSquare className='w-3.5 h-3.5' />
								Inquire
							</Link>
						</div>
					))}
				</div>
			)}

			{/* Portfolio tab */}
			{tab === 'portfolio' && (
				<div>
					{(artisan.portfolio?.length ?? 0) === 0 ?
						<p className='text-xs text-white/40 py-4 text-center'>
							No portfolio items yet.
						</p>
					:	<PortfolioGallery items={artisan.portfolio ?? []} />}
				</div>
			)}

			{/* Reviews tab */}
			{tab === 'reviews' && (
				<div className='space-y-2'>
					{reviews.length === 0 ?
						<p className='text-xs text-white/40 py-4 text-center'>
							No reviews yet.
						</p>
					:	reviews.map((review) => (
							<ReviewCard
								key={review.id}
								review={review}
							/>
						))
					}
				</div>
			)}
		</section>
	);
}

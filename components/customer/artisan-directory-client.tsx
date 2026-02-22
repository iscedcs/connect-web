'use client';

import { useState, useCallback } from 'react';
import type {
	ArtisanDirectoryCard,
	ArtisanCategory,
	DirectoryResponse,
} from '@/lib/types/artisan';
import { Search, Star, MapPin, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';

const CONNECT_API = process.env.NEXT_PUBLIC_CONNECT_API_URL!;

interface Props {
	initialData: DirectoryResponse | null;
	featured: ArtisanDirectoryCard[] | null;
	categories: ArtisanCategory[] | null;
}

export default function ArtisanDirectoryClient({
	initialData,
	featured: featuredProp,
	categories: categoriesProp,
}: Props) {
	const safeInitial = initialData ?? {
		artisans: [],
		total: 0,
		page: 1,
		totalPages: 1,
	};
	const featured = featuredProp ?? [];
	const categories = categoriesProp ?? [];

	const [artisans, setArtisans] = useState(safeInitial.artisans);
	const [total, setTotal] = useState(safeInitial.total);
	const [page, setPage] = useState(safeInitial.page);
	const [totalPages, setTotalPages] = useState(safeInitial.totalPages);
	const [search, setSearch] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('');
	const [loading, setLoading] = useState(false);

	const fetchArtisans = useCallback(
		async (p: number, cat: string, q: string) => {
			setLoading(true);
			try {
				const sp = new URLSearchParams();
				sp.set('page', String(p));
				sp.set('limit', '20');
				if (cat) sp.set('category', cat);
				if (q) sp.set('search', q);
				const res = await fetch(
					`${CONNECT_API}/api/directory/artisans?${sp.toString()}`,
				);
				const json = await res.json().catch(() => null);
				const data = json?.data ?? json;
				if (data?.artisans) {
					setArtisans(data.artisans);
					setTotal(data.total ?? 0);
					setPage(data.page ?? 1);
					setTotalPages(data.totalPages ?? 0);
				}
			} catch {
				/* network */
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	function handleSearch() {
		fetchArtisans(1, selectedCategory, search);
	}

	function handleCategoryFilter(catSlug: string) {
		const next = catSlug === selectedCategory ? '' : catSlug;
		setSelectedCategory(next);
		fetchArtisans(1, next, search);
	}

	function handlePage(p: number) {
		fetchArtisans(p, selectedCategory, search);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	return (
		<div className='min-h-screen bg-black text-white'>
			<div className='max-w-3xl mx-auto px-4 py-8 space-y-8'>
				{/* Header */}
				<div className='text-center space-y-2'>
					<h1 className='text-2xl font-bold'>Artisan Directory</h1>
					<p className='text-sm text-white/50'>
						Find skilled professionals near you
					</p>
				</div>

				{/* Search */}
				<div className='flex gap-2'>
					<div className='relative flex-1'>
						<Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40' />
						<Input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							onKeyDown={(e) =>
								e.key === 'Enter' && handleSearch()
							}
							placeholder='Search artisans…'
							className='bg-white/5 border-white/10 pl-9'
						/>
						{search && (
							<button
								title='Clear search'
								type='button'
								onClick={() => {
									setSearch('');
									fetchArtisans(1, selectedCategory, '');
								}}
								className='absolute right-3 top-1/2 -translate-y-1/2'
							>
								<X className='size-3.5 text-white/40 hover:text-white/70' />
							</button>
						)}
					</div>
				</div>

				{/* Categories */}
				{categories.length > 0 && (
					<div className='flex flex-wrap gap-2'>
						{categories.map((cat) => (
							<button
								key={cat.id}
								type='button'
								onClick={() => handleCategoryFilter(cat.slug)}
								className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
									selectedCategory === cat.slug ?
										'bg-purple-600 text-white'
									:	'bg-white/5 text-white/60 hover:bg-white/10'
								}`}
							>
								{cat.name}
								{cat.artisanCount != null && (
									<span className='ml-1 opacity-60'>
										({cat.artisanCount})
									</span>
								)}
							</button>
						))}
					</div>
				)}

				{/* Featured */}
				{featured.length > 0 && !search && !selectedCategory && (
					<section className='space-y-3'>
						<h2 className='text-sm font-medium text-white/60'>
							Featured Artisans
						</h2>
						<div className='grid grid-cols-2 gap-3'>
							{featured.map((a) => (
								<ArtisanCard
									key={a.id}
									artisan={a}
									featured
								/>
							))}
						</div>
					</section>
				)}

				{/* Results */}
				<section className='space-y-3'>
					{!loading && (
						<p className='text-xs text-white/40'>
							{total} artisan{total !== 1 ? 's' : ''} found
						</p>
					)}

					{loading ?
						<div className='py-12 text-center text-white/40 text-sm'>
							Searching…
						</div>
					: artisans.length === 0 ?
						<div className='py-12 text-center text-white/40'>
							<p className='text-sm font-medium mb-1'>
								No artisans found
							</p>
							<p className='text-xs'>
								Try adjusting your search or filters.
							</p>
						</div>
					:	<div className='space-y-3'>
							{artisans.map((a) => (
								<ArtisanCard
									key={a.id}
									artisan={a}
								/>
							))}
						</div>
					}
				</section>

				{/* Pagination */}
				{totalPages > 1 && (
					<div className='flex items-center justify-center gap-2'>
						{Array.from({ length: totalPages }, (_, i) => i + 1)
							.filter(
								(p) =>
									p === 1 ||
									p === totalPages ||
									Math.abs(p - page) <= 2,
							)
							.map((p, idx, arr) => (
								<span
									key={p}
									className='contents'
								>
									{idx > 0 && arr[idx - 1] !== p - 1 && (
										<span className='text-white/30 text-xs'>
											…
										</span>
									)}
									<button
										type='button'
										onClick={() => handlePage(p)}
										className={`size-8 rounded-lg text-xs font-medium transition-colors ${
											p === page ?
												'bg-purple-600 text-white'
											:	'bg-white/5 text-white/60 hover:bg-white/10'
										}`}
									>
										{p}
									</button>
								</span>
							))}
					</div>
				)}

				{/* Footer */}
				<div className='text-center pt-4'>
					<Link
						href='/'
						className='text-xs text-white/40 hover:text-white/60 transition-colors'
					>
						Powered by ISCE Connect
					</Link>
				</div>
			</div>
		</div>
	);
}

function ArtisanCard({
	artisan,
	featured,
}: {
	artisan: ArtisanDirectoryCard;
	featured?: boolean;
}) {
	const href = artisan.profile?.slug ? `/p/${artisan.profile.slug}` : '#';

	const coverImage = artisan.portfolio?.[0]?.url;
	const startingPrice = artisan.services
		?.filter((s) => s.price != null)
		?.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))?.[0];

	return (
		<Link
			href={href}
			className={`block rounded-xl overflow-hidden transition-colors ${
				featured ?
					'bg-gradient-to-br from-purple-600/10 to-purple-900/10 border border-purple-500/20'
				:	'bg-white/5 hover:bg-white/[0.08]'
			}`}
		>
			{/* Cover */}
			{coverImage && (
				<div className='aspect-[2/1] relative'>
					<Image
						src={coverImage}
						alt={artisan.profile?.firstName ?? 'Artisan'}
						fill
						className='object-cover'
					/>
				</div>
			)}

			<div className='p-3 space-y-2'>
				{/* Avatar + Name */}
				<div className='flex items-center gap-2.5'>
					{artisan.profile?.displayPicture ?
						<Image
							src={artisan.profile.displayPicture}
							alt=''
							width={36}
							height={36}
							className='size-9 rounded-full object-cover shrink-0'
						/>
					:	<div className='size-9 rounded-full bg-purple-500/20 flex items-center justify-center text-sm font-medium shrink-0'>
							{artisan.profile?.firstName?.[0] ?? '?'}
						</div>
					}
					<div className='flex-1 min-w-0'>
						<p className='text-sm font-medium truncate'>
							{artisan.profile?.firstName}{' '}
							{artisan.profile?.lastName}
						</p>
					</div>
				</div>

				{/* Meta */}
				<div className='flex items-center gap-3 text-[10px] text-white/50'>
					{artisan.averageRating > 0 && (
						<span className='flex items-center gap-0.5'>
							<Star className='size-3 fill-yellow-400 text-yellow-400' />
							{artisan.averageRating.toFixed(1)}
							<span className='text-white/30'>
								({artisan.totalReviews})
							</span>
						</span>
					)}
					{artisan.profile?.city && (
						<span className='flex items-center gap-0.5'>
							<MapPin className='size-3' />
							{artisan.profile.city}
							{artisan.profile.state ?
								`, ${artisan.profile.state}`
							:	''}
						</span>
					)}
					{startingPrice && (
						<span>
							From ₦{startingPrice.price?.toLocaleString()}
						</span>
					)}
				</div>

				{/* Categories */}
				{artisan.categories?.length > 0 && (
					<div className='flex flex-wrap gap-1'>
						{artisan.categories.slice(0, 3).map((cat) => (
							<span
								key={cat.categoryId}
								className='text-[10px] bg-white/5 text-white/50 px-1.5 py-0.5 rounded'
							>
								{cat.category?.name}
							</span>
						))}
					</div>
				)}
			</div>
		</Link>
	);
}

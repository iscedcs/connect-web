'use client';

import { useState } from 'react';
import type {
	Promotion,
	ArtisanProfile,
	PromotionType,
} from '@/lib/types/artisan';
import { ArrowLeft, Sparkles, X, Plus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CONNECT_API = process.env.NEXT_PUBLIC_CONNECT_API_URL!;

const PROMO_TYPES: { value: PromotionType; label: string; desc: string }[] = [
	{
		value: 'SPONSORED',
		label: 'Sponsored',
		desc: 'Boosted visibility across the directory',
	},
	{
		value: 'BOOST',
		label: 'Boost',
		desc: 'Show at the top of search results',
	},
];

interface Props {
	promotions: Promotion[];
	artisan: ArtisanProfile;
	profileId: string;
	accessToken: string;
}

export default function ArtisanPromotionsClient({
	promotions: initial,
	artisan,
	profileId,
	accessToken,
}: Props) {
	const [promotions, setPromotions] = useState(initial);
	const [showForm, setShowForm] = useState(false);
	const [type, setType] = useState<PromotionType>('SPONSORED');
	const [durationDays, setDurationDays] = useState('7');
	const [loading, setLoading] = useState(false);

	const active = promotions.filter((p) => p.status === 'ACTIVE');
	const past = promotions.filter((p) => p.status !== 'ACTIVE');

	async function handleCreate() {
		const days = parseInt(durationDays, 10);
		if (!days || days < 1) {
			toast.error('Duration must be at least 1 day');
			return;
		}
		setLoading(true);
		try {
			const res = await fetch(`${CONNECT_API}/api/artisan/promotions`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ profileId, type, durationDays: days }),
			});
			const json = await res.json().catch(() => null);
			if (!res.ok) {
				toast.error(json?.message || 'Failed to create promotion');
				return;
			}
			if (json?.data) {
				setPromotions((prev) => [json.data, ...prev]);
			}
			toast.success('Promotion created');
			setShowForm(false);
			setDurationDays('7');
		} catch {
			toast.error('Network error');
		} finally {
			setLoading(false);
		}
	}

	async function handleCancel(promotionId: string) {
		if (!confirm('Cancel this promotion?')) return;
		try {
			const res = await fetch(
				`${CONNECT_API}/api/artisan/promotions/${profileId}/${promotionId}/cancel`,
				{
					method: 'POST',
					headers: { Authorization: `Bearer ${accessToken}` },
				},
			);
			if (!res.ok) {
				const json = await res.json().catch(() => null);
				toast.error(json?.message || 'Failed to cancel');
				return;
			}
			setPromotions((prev) =>
				prev.map((p) =>
					p.id === promotionId ?
						{ ...p, status: 'CANCELLED' as const }
					:	p,
				),
			);
			toast.success('Promotion cancelled');
		} catch {
			toast.error('Network error');
		}
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-3'>
					<Link
						href='/connect/artisan'
						className='p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors'
					>
						<ArrowLeft className='size-4' />
					</Link>
					<div>
						<h1 className='text-xl font-semibold'>Promotions</h1>
						<p className='text-xs text-white/50'>
							Boost your visibility
						</p>
					</div>
				</div>
				{!showForm && (
					<Button
						size='sm'
						onClick={() => setShowForm(true)}
						className='bg-purple-600 hover:bg-purple-700 text-xs'
					>
						<Plus className='size-3.5 mr-1' />
						New
					</Button>
				)}
			</div>

			{/* Create Form */}
			{showForm && (
				<div className='bg-white/5 rounded-xl p-4 space-y-4 border border-purple-500/20'>
					<div className='flex items-center justify-between'>
						<h2 className='text-sm font-medium'>New Promotion</h2>
						<button
							title='close'
							type='button'
							onClick={() => setShowForm(false)}
							className='p-1 rounded-lg hover:bg-white/10'
						>
							<X className='size-4' />
						</button>
					</div>

					{/* Type selector */}
					<div className='space-y-2'>
						<label className='text-xs text-white/50'>Type</label>
						<div className='space-y-2'>
							{PROMO_TYPES.map((pt) => (
								<button
									key={pt.value}
									type='button'
									onClick={() => setType(pt.value)}
									className={`w-full text-left p-3 rounded-lg border transition-colors ${
										type === pt.value ?
											'border-purple-500 bg-purple-500/10'
										:	'border-white/10 bg-white/5 hover:bg-white/10'
									}`}
								>
									<p className='text-sm font-medium'>
										{pt.label}
									</p>
									<p className='text-xs text-white/40'>
										{pt.desc}
									</p>
								</button>
							))}
						</div>
					</div>

					{/* Duration */}
					<div className='space-y-1'>
						<label className='text-xs text-white/50'>
							Duration (days)
						</label>
						<Input
							type='number'
							min={1}
							max={90}
							value={durationDays}
							onChange={(e) => setDurationDays(e.target.value)}
							className='bg-white/5 border-white/10'
						/>
					</div>

					<Button
						onClick={handleCreate}
						disabled={loading}
						className='w-full bg-purple-600 hover:bg-purple-700'
					>
						{loading ? 'Creating...' : 'Create Promotion'}
					</Button>
				</div>
			)}

			{/* Active Promotions */}
			{active.length > 0 && (
				<div className='space-y-3'>
					<h2 className='text-xs text-white/50 uppercase tracking-wider'>
						Active
					</h2>
					{active.map((p) => (
						<PromotionCard
							key={p.id}
							promo={p}
							onCancel={() => handleCancel(p.id)}
						/>
					))}
				</div>
			)}

			{/* Past Promotions */}
			{past.length > 0 && (
				<div className='space-y-3'>
					<h2 className='text-xs text-white/50 uppercase tracking-wider'>
						Past
					</h2>
					{past.map((p) => (
						<PromotionCard
							key={p.id}
							promo={p}
						/>
					))}
				</div>
			)}

			{/* Empty State */}
			{promotions.length === 0 && !showForm && (
				<div className='bg-white/5 rounded-xl p-8 text-center text-white/40'>
					<Sparkles className='size-8 mx-auto mb-3 opacity-50' />
					<p className='text-sm font-medium mb-1'>
						No promotions yet
					</p>
					<p className='text-xs'>
						Create a promotion to boost your artisan profile
						visibility.
					</p>
				</div>
			)}
		</div>
	);
}

function PromotionCard({
	promo,
	onCancel,
}: {
	promo: Promotion;
	onCancel?: () => void;
}) {
	const typeLabel =
		PROMO_TYPES.find((t) => t.value === promo.type)?.label ?? promo.type;

	const start = new Date(promo.startsAt).toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
	});
	const end = new Date(promo.endsAt).toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});

	return (
		<div className='bg-white/5 rounded-xl p-4 flex items-center gap-3'>
			<div
				className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${
					promo.status === 'ACTIVE' ?
						'bg-purple-500/20 text-purple-300'
					:	'bg-white/10 text-white/40'
				}`}
			>
				<Sparkles className='size-4' />
			</div>
			<div className='flex-1 min-w-0'>
				<div className='flex items-center gap-2'>
					<p className='text-sm font-medium'>{typeLabel}</p>
					{promo.status === 'ACTIVE' && (
						<span className='text-[10px] bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded-full'>
							Active
						</span>
					)}
				</div>
				<p className='text-xs text-white/40'>
					{start} — {end}
				</p>
			</div>
			{promo.status === 'ACTIVE' && onCancel && (
				<button
					type='button'
					onClick={onCancel}
					className='text-xs text-red-400 hover:text-red-300 transition-colors'
				>
					Cancel
				</button>
			)}
		</div>
	);
}

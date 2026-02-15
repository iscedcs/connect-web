'use client';

import { useEffect, useState, useCallback } from 'react';
import {
	fetchCardInteractions,
	fetchCardInteractionsByMethod,
	fetchCardInteractionStats,
	deleteCardInteraction,
	type CardInteraction,
	type CardInteractionStats,
	type ScanType,
} from '@/lib/services/card-interactions';
import { Smartphone, BarChart3, Trash2, NfcIcon } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';

type Tab = 'all' | 'TAP' | 'SCAN';

export default function AnalyticsClient({
	accessToken,
}: {
	accessToken: string;
}) {
	const [interactions, setInteractions] = useState<CardInteraction[]>([]);
	const [stats, setStats] = useState<CardInteractionStats | null>(null);
	const [tab, setTab] = useState<Tab>('all');
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [loading, setLoading] = useState(true);

	const loadInteractions = useCallback(async () => {
		setLoading(true);
		try {
			let data;
			if (tab === 'all') {
				data = await fetchCardInteractions({ accessToken, page });
			} else {
				data = await fetchCardInteractionsByMethod({
					accessToken,
					method: tab as ScanType,
					page,
				});
			}
			setInteractions(data.cardInteractions);
			setTotalPages(data.pagination.pages);
		} catch {
			toast.error('Failed to load interactions');
		} finally {
			setLoading(false);
		}
	}, [accessToken, tab, page]);

	const loadStats = useCallback(async () => {
		try {
			const s = await fetchCardInteractionStats({ accessToken });
			setStats(s);
		} catch {
			/* optional */
		}
	}, [accessToken]);

	useEffect(() => {
		loadInteractions();
	}, [loadInteractions]);

	useEffect(() => {
		loadStats();
	}, [loadStats]);

	async function handleDelete(id: string) {
		try {
			await deleteCardInteraction({ accessToken, id });
			setInteractions((prev) => prev.filter((i) => i.id !== id));
			toast.success('Interaction removed');
			loadStats();
		} catch {
			toast.error('Failed to delete');
		}
	}

	function changeTab(t: Tab) {
		setTab(t);
		setPage(1);
	}

	const tabs: { key: Tab; label: string }[] = [
		{ key: 'all', label: 'All' },
		{ key: 'TAP', label: 'NFC Tap' },
		{ key: 'SCAN', label: 'QR Scan' },
	];

	return (
		<div className='space-y-4'>
			{/* Stats */}
			{stats && (
				<>
					<div className='grid grid-cols-3 gap-3'>
						<StatCard
							label='Total'
							value={stats.totalInteractions}
						/>
						<StatCard
							label='Taps'
							value={stats.tapInteractions}
							sub={`${stats.tapPercentage}%`}
						/>
						<StatCard
							label='Scans'
							value={stats.scanInteractions}
							sub={`${stats.scanPercentage}%`}
						/>
					</div>
					<div className='grid grid-cols-3 gap-3'>
						<StatCard
							label='Today'
							value={stats.todayInteractions}
						/>
						<StatCard
							label='This Week'
							value={stats.thisWeekInteractions}
						/>
						<StatCard
							label='Devices'
							value={stats.uniqueDevices}
						/>
					</div>
				</>
			)}

			{/* Tabs */}
			<div className='flex gap-2'>
				{tabs.map((t) => (
					<button
						key={t.key}
						onClick={() => changeTab(t.key)}
						className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
							tab === t.key ?
								'bg-white text-black font-medium'
							:	'bg-white/10 text-white/60 hover:bg-white/20'
						}`}
					>
						{t.label}
					</button>
				))}
			</div>

			{/* List */}
			{loading ?
				<div className='space-y-3'>
					{[...Array(4)].map((_, i) => (
						<div
							key={i}
							className='h-16 rounded-xl bg-white/5 animate-pulse'
						/>
					))}
				</div>
			: interactions.length === 0 ?
				<div className='text-center py-12 text-white/40'>
					<BarChart3 className='h-10 w-10 mx-auto mb-3 opacity-30' />
					<p>No interactions recorded yet</p>
				</div>
			:	<div className='space-y-2'>
					{interactions.map((i) => (
						<div
							key={i.id}
							className='bg-white/[0.04] rounded-xl border border-white/5 p-4 flex items-center gap-3'
						>
							<div className='shrink-0'>
								{i.method === 'TAP' ?
									<NfcIcon className='h-5 w-5 text-blue-400' />
								:	<Smartphone className='h-5 w-5 text-green-400' />
								}
							</div>

							<div className='flex-1 min-w-0'>
								<div className='flex items-center gap-2'>
									<span className='text-sm font-medium text-white'>
										{i.method === 'TAP' ?
											'NFC Tap'
										:	'QR Scan'}
									</span>
									<span className='text-xs text-white/20'>
										·
									</span>
									<span className='text-xs text-white/40 truncate'>
										{i.deviceId}
									</span>
								</div>
								<p className='text-xs text-white/30 mt-0.5'>
									{format(
										new Date(i.createdAt),
										'MMM d, yyyy HH:mm',
									)}{' '}
									·{' '}
									{formatDistanceToNow(
										new Date(i.createdAt),
										{
											addSuffix: true,
										},
									)}
								</p>
							</div>

							<button
								onClick={() => handleDelete(i.id)}
								className='text-red-400/40 hover:text-red-400 shrink-0'
								title='Remove'
							>
								<Trash2 className='h-3.5 w-3.5' />
							</button>
						</div>
					))}
				</div>
			}

			{/* Pagination */}
			{totalPages > 1 && (
				<div className='flex items-center justify-center gap-3 pt-2'>
					<button
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						disabled={page <= 1}
						className='px-3 py-1 text-sm bg-white/10 rounded disabled:opacity-30 text-white'
					>
						Prev
					</button>
					<span className='text-sm text-white/40'>
						{page} / {totalPages}
					</span>
					<button
						onClick={() =>
							setPage((p) => Math.min(totalPages, p + 1))
						}
						disabled={page >= totalPages}
						className='px-3 py-1 text-sm bg-white/10 rounded disabled:opacity-30 text-white'
					>
						Next
					</button>
				</div>
			)}
		</div>
	);
}

function StatCard({
	label,
	value,
	sub,
}: {
	label: string;
	value: number;
	sub?: string;
}) {
	return (
		<div className='bg-white/5 rounded-xl p-3 text-center'>
			<p className='text-lg font-semibold text-white'>{value}</p>
			<p className='text-xs text-white/40'>{label}</p>
			{sub && <p className='text-[10px] text-white/25 mt-0.5'>{sub}</p>}
		</div>
	);
}

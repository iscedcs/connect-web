'use client';

import { useEffect, useState, useCallback } from 'react';
import {
	submitSupportRequest,
	fetchSupportRequests,
	deleteSupportRequest,
	searchSupportRequests,
	fetchSupportRequestStats,
	type SupportRequest,
	type SupportRequestStats,
} from '@/lib/services/support-request';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
	MessageSquarePlus,
	Search,
	Trash2,
	ChevronDown,
	ChevronUp,
	LifeBuoy,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function SupportClient({
	accessToken,
}: {
	accessToken: string;
}) {
	const [requests, setRequests] = useState<SupportRequest[]>([]);
	const [stats, setStats] = useState<SupportRequestStats | null>(null);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');

	// New request form
	const [showForm, setShowForm] = useState(false);
	const [subject, setSubject] = useState('');
	const [message, setMessage] = useState('');
	const [submitting, setSubmitting] = useState(false);

	// Expanded detail
	const [expandedId, setExpandedId] = useState<string | null>(null);

	const loadRequests = useCallback(async () => {
		setLoading(true);
		try {
			const data =
				searchQuery.trim() ?
					await searchSupportRequests({
						accessToken,
						query: searchQuery,
						page,
					})
				:	await fetchSupportRequests({ accessToken, page });
			setRequests(data.supportRequests);
			setTotalPages(data.pagination.pages);
		} catch {
			toast.error('Failed to load support requests');
		} finally {
			setLoading(false);
		}
	}, [accessToken, page, searchQuery]);

	const loadStats = useCallback(async () => {
		try {
			const s = await fetchSupportRequestStats({ accessToken });
			setStats(s);
		} catch {
			/* optional */
		}
	}, [accessToken]);

	useEffect(() => {
		loadRequests();
	}, [loadRequests]);

	useEffect(() => {
		loadStats();
	}, [loadStats]);

	// Debounced search
	useEffect(() => {
		const timeout = setTimeout(() => {
			setPage(1);
			loadRequests();
		}, 400);
		return () => clearTimeout(timeout);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchQuery]);

	async function handleSubmit() {
		if (!subject.trim() || !message.trim()) return;
		setSubmitting(true);
		try {
			await submitSupportRequest({
				accessToken,
				subject: subject.trim(),
				message: message.trim(),
			});
			toast.success('Support request submitted');
			setSubject('');
			setMessage('');
			setShowForm(false);
			loadRequests();
			loadStats();
		} catch {
			toast.error('Failed to submit request');
		} finally {
			setSubmitting(false);
		}
	}

	async function handleDelete(id: string) {
		try {
			await deleteSupportRequest({ accessToken, id });
			setRequests((prev) => prev.filter((r) => r.id !== id));
			toast.success('Request removed');
			loadStats();
		} catch {
			toast.error('Failed to delete request');
		}
	}

	return (
		<div className='space-y-4'>
			{/* Stats */}
			{stats && (
				<div className='grid grid-cols-2 gap-3'>
					<StatCard
						label='Total'
						value={stats.totalRequests}
					/>
					<StatCard
						label='Today'
						value={stats.todayRequests}
					/>
					<StatCard
						label='This Week'
						value={stats.thisWeekRequests}
					/>
					<StatCard
						label='This Month'
						value={stats.thisMonthRequests}
					/>
				</div>
			)}

			{/* New Request Toggle */}
			<button
				onClick={() => setShowForm((v) => !v)}
				className='w-full flex items-center justify-center gap-2 py-2.5 bg-white text-black rounded-xl font-medium text-sm hover:bg-white/90 transition-colors'
			>
				<MessageSquarePlus className='h-4 w-4' />
				{showForm ? 'Cancel' : 'New Support Request'}
			</button>

			{/* New Request Form */}
			{showForm && (
				<div className='bg-white/5 rounded-xl p-4 space-y-3 border border-white/10'>
					<Input
						placeholder='Subject'
						value={subject}
						onChange={(e) => setSubject(e.target.value)}
						className='bg-transparent border-white/10 text-white'
					/>
					<Textarea
						placeholder='Describe your issue…'
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						rows={4}
						className='bg-transparent border-white/10 text-white resize-none'
					/>
					<button
						onClick={handleSubmit}
						disabled={
							submitting || !subject.trim() || !message.trim()
						}
						className='w-full py-2 bg-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-blue-400 transition-colors'
					>
						{submitting ? 'Submitting…' : 'Submit'}
					</button>
				</div>
			)}

			{/* Search */}
			<div className='relative'>
				<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40' />
				<Input
					placeholder='Search requests…'
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className='pl-9 bg-neutral-900 text-white border-white/10'
				/>
			</div>

			{/* List */}
			{loading ?
				<div className='space-y-3'>
					{[...Array(3)].map((_, i) => (
						<div
							key={i}
							className='h-20 rounded-xl bg-white/5 animate-pulse'
						/>
					))}
				</div>
			: requests.length === 0 ?
				<div className='text-center py-12 text-white/40'>
					<LifeBuoy className='h-10 w-10 mx-auto mb-3 opacity-30' />
					<p>No support requests yet</p>
				</div>
			:	<div className='space-y-2'>
					{requests.map((r) => (
						<div
							key={r.id}
							className='bg-white/[0.04] rounded-xl border border-white/5 p-4'
						>
							<div
								className='flex items-start justify-between cursor-pointer'
								onClick={() =>
									setExpandedId(
										expandedId === r.id ? null : r.id,
									)
								}
							>
								<div className='flex-1 min-w-0'>
									<p className='text-sm font-medium text-white'>
										{r.subject}
									</p>
									<p className='text-xs text-white/30 mt-1'>
										{formatDistanceToNow(
											new Date(r.createdAt),
											{ addSuffix: true },
										)}
									</p>
								</div>
								{expandedId === r.id ?
									<ChevronUp className='h-4 w-4 text-white/30 shrink-0' />
								:	<ChevronDown className='h-4 w-4 text-white/30 shrink-0' />
								}
							</div>

							{expandedId === r.id && (
								<div className='mt-3 pt-3 border-t border-white/5'>
									<p className='text-sm text-white/60 whitespace-pre-wrap'>
										{r.message}
									</p>
									<div className='flex justify-end mt-3'>
										<button
											onClick={() => handleDelete(r.id)}
											className='text-xs text-red-400/60 hover:text-red-400 flex items-center gap-1'
										>
											<Trash2 className='h-3 w-3' />
											Remove
										</button>
									</div>
								</div>
							)}
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

			{/* Contact info */}
			<div className='bg-white/5 rounded-xl p-4 text-sm text-white/50 space-y-1'>
				<p>
					You can also email us at{' '}
					<strong className='text-white/70'>support@isce.tech</strong>
				</p>
				<p>Response time: within 24–48 hours</p>
			</div>
		</div>
	);
}

function StatCard({ label, value }: { label: string; value: number }) {
	return (
		<div className='bg-white/5 rounded-xl p-3 text-center'>
			<p className='text-lg font-semibold text-white'>{value}</p>
			<p className='text-xs text-white/40'>{label}</p>
		</div>
	);
}

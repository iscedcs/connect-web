'use client';

import { useEffect, useState, useCallback } from 'react';
import {
	fetchNotifications,
	fetchUnreadNotifications,
	fetchNotificationsByType,
	fetchNotificationStats,
	markNotificationRead,
	markAllNotificationsRead,
	deleteNotification,
	type Notification,
	type NotificationStats,
	type NotificationType,
} from '@/lib/services/notification';
import { Bell, CheckCheck, Trash2, Users, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

type Tab = 'all' | 'unread' | 'CARD_INTERACTION' | 'CONTACT_SHARED';

export default function NotificationsClient({
	accessToken,
}: {
	accessToken: string;
}) {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [stats, setStats] = useState<NotificationStats | null>(null);
	const [tab, setTab] = useState<Tab>('all');
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [loading, setLoading] = useState(true);

	const loadNotifications = useCallback(async () => {
		setLoading(true);
		try {
			let data;
			if (tab === 'all') {
				data = await fetchNotifications({ accessToken, page });
			} else if (tab === 'unread') {
				data = await fetchUnreadNotifications({ accessToken, page });
			} else {
				data = await fetchNotificationsByType({
					accessToken,
					type: tab as NotificationType,
					page,
				});
			}
			setNotifications(data.notifications);
			setTotalPages(data.pagination.pages);
		} catch {
			toast.error('Failed to load notifications');
		} finally {
			setLoading(false);
		}
	}, [accessToken, tab, page]);

	const loadStats = useCallback(async () => {
		try {
			const s = await fetchNotificationStats({ accessToken });
			setStats(s);
		} catch {
			/* stats are optional */
		}
	}, [accessToken]);

	useEffect(() => {
		loadNotifications();
	}, [loadNotifications]);

	useEffect(() => {
		loadStats();
	}, [loadStats]);

	async function handleRead(id: string) {
		try {
			await markNotificationRead({ accessToken, id });
			setNotifications((prev) =>
				prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
			);
			setStats((prev) =>
				prev ?
					{
						...prev,
						unreadNotifications: Math.max(
							0,
							prev.unreadNotifications - 1,
						),
					}
				:	prev,
			);
		} catch {
			toast.error('Failed to mark as read');
		}
	}

	async function handleReadAll() {
		try {
			await markAllNotificationsRead({ accessToken });
			setNotifications((prev) =>
				prev.map((n) => ({ ...n, isRead: true })),
			);
			setStats((prev) =>
				prev ? { ...prev, unreadNotifications: 0 } : prev,
			);
			toast.success('All marked as read');
		} catch {
			toast.error('Failed to mark all as read');
		}
	}

	async function handleDelete(id: string) {
		try {
			await deleteNotification({ accessToken, id });
			setNotifications((prev) => prev.filter((n) => n.id !== id));
			toast.success('Notification removed');
			loadStats();
		} catch {
			toast.error('Failed to delete notification');
		}
	}

	function changeTab(newTab: Tab) {
		setTab(newTab);
		setPage(1);
	}

	const iconForType = (type: NotificationType) => {
		switch (type) {
			case 'CARD_INTERACTION':
				return <CreditCard className='h-4 w-4 text-blue-400' />;
			case 'CONTACT_SHARED':
				return <Users className='h-4 w-4 text-green-400' />;
			default:
				return <Bell className='h-4 w-4 text-white/40' />;
		}
	};

	const tabs: { key: Tab; label: string }[] = [
		{ key: 'all', label: 'All' },
		{ key: 'unread', label: 'Unread' },
		{ key: 'CARD_INTERACTION', label: 'Card' },
		{ key: 'CONTACT_SHARED', label: 'Contact' },
	];

	return (
		<div className='space-y-4'>
			{/* Stats */}
			{stats && (
				<div className='grid grid-cols-2 gap-3'>
					<StatCard
						label='Total'
						value={stats.totalNotifications}
					/>
					<StatCard
						label='Unread'
						value={stats.unreadNotifications}
					/>
					<StatCard
						label='Today'
						value={stats.todayNotifications}
					/>
					<StatCard
						label='This Week'
						value={stats.thisWeekNotifications}
					/>
				</div>
			)}

			{/* Tabs + Mark All Read */}
			<div className='flex items-center justify-between gap-2'>
				<div className='flex gap-2 overflow-x-auto'>
					{tabs.map((t) => (
						<button
							key={t.key}
							onClick={() => changeTab(t.key)}
							className={`px-3 py-1.5 text-sm rounded-full shrink-0 transition-colors ${
								tab === t.key ?
									'bg-white text-black font-medium'
								:	'bg-white/10 text-white/60 hover:bg-white/20'
							}`}
						>
							{t.label}
							{t.key === 'unread' && stats?.unreadNotifications ?
								` (${stats.unreadNotifications})`
							:	''}
						</button>
					))}
				</div>

				{stats && stats.unreadNotifications > 0 && (
					<button
						onClick={handleReadAll}
						className='text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 shrink-0'
						title='Mark all as read'
					>
						<CheckCheck className='h-3.5 w-3.5' />
						<span className='hidden sm:inline'>Read all</span>
					</button>
				)}
			</div>

			{/* List */}
			{loading ?
				<div className='space-y-3'>
					{[...Array(4)].map((_, i) => (
						<div
							key={i}
							className='h-20 rounded-xl bg-white/5 animate-pulse'
						/>
					))}
				</div>
			: notifications.length === 0 ?
				<div className='text-center py-12 text-white/40'>
					<Bell className='h-10 w-10 mx-auto mb-3 opacity-30' />
					<p>No notifications yet</p>
				</div>
			:	<div className='space-y-2'>
					{notifications.map((n) => (
						<div
							key={n.id}
							className={`relative rounded-xl border p-4 transition-colors ${
								n.isRead ?
									'bg-white/[0.02] border-white/5'
								:	'bg-white/[0.06] border-white/10'
							}`}
						>
							{/* Unread dot */}
							{!n.isRead && (
								<span className='absolute top-4 right-4 h-2 w-2 rounded-full bg-blue-400' />
							)}

							<div className='flex items-start gap-3'>
								<div className='mt-0.5'>
									{iconForType(n.type)}
								</div>

								<div className='flex-1 min-w-0'>
									<p className='text-sm font-medium text-white leading-tight'>
										{n.title}
									</p>
									<p className='text-sm text-white/60 mt-0.5 line-clamp-2'>
										{n.message}
									</p>
									<p className='text-xs text-white/30 mt-1.5'>
										{formatDistanceToNow(
											new Date(n.createdAt),
											{ addSuffix: true },
										)}
									</p>
								</div>
							</div>

							{/* Actions */}
							<div className='flex items-center gap-3 mt-2 pt-2 border-t border-white/5'>
								{!n.isRead && (
									<button
										onClick={() => handleRead(n.id)}
										className='text-xs text-blue-400 hover:text-blue-300'
									>
										Mark read
									</button>
								)}
								<button
									onClick={() => handleDelete(n.id)}
									className='text-xs text-red-400/60 hover:text-red-400 flex items-center gap-1 ml-auto'
								>
									<Trash2 className='h-3 w-3' />
									Remove
								</button>
							</div>
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

function StatCard({ label, value }: { label: string; value: number }) {
	return (
		<div className='bg-white/5 rounded-xl p-3 text-center'>
			<p className='text-lg font-semibold text-white'>{value}</p>
			<p className='text-xs text-white/40'>{label}</p>
		</div>
	);
}

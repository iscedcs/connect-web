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
	CATEGORY_TYPES,
	type Notification,
	type NotificationStats,
	type NotificationType,
	type NotificationCategory,
} from '@/lib/services/notification';
import { useNotificationSocket } from '@/hooks/useNotificationSocket';
import {
	Bell,
	CheckCheck,
	Trash2,
	Users,
	CreditCard,
	Wallet,
	Calendar,
	Star,
	MessageSquare,
	Banknote,
	ShieldCheck,
	ShieldOff,
	Megaphone,
	Handshake,
	UserPlus,
	Send,
	Receipt,
	AlertTriangle,
	Video,
	Bookmark,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function NotificationsClient({
	accessToken,
}: {
	accessToken: string;
}) {
	const router = useRouter();
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [stats, setStats] = useState<NotificationStats | null>(null);
	const [tab, setTab] = useState<NotificationCategory>('all');
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [loading, setLoading] = useState(true);

	// Real-time notifications via WebSocket
	const { unreadCount } = useNotificationSocket({
		accessToken,
		onNotification: useCallback(
			(notification: Notification) => {
				// Prepend new notification if on "all" or matching category tab
				if (tab === 'all' || tab === 'unread') {
					setNotifications((prev) => [notification, ...prev]);
				} else {
					const categoryTypes =
						CATEGORY_TYPES[tab as keyof typeof CATEGORY_TYPES];
					if (categoryTypes?.includes(notification.type)) {
						setNotifications((prev) => [notification, ...prev]);
					}
				}
				// Update stats
				setStats((prev) =>
					prev ?
						{
							...prev,
							totalNotifications: prev.totalNotifications + 1,
							unreadNotifications: prev.unreadNotifications + 1,
							todayNotifications: prev.todayNotifications + 1,
							thisWeekNotifications:
								prev.thisWeekNotifications + 1,
						}
					:	prev,
				);
			},
			[tab],
		),
	});

	const loadNotifications = useCallback(async () => {
		setLoading(true);
		try {
			let data;
			if (tab === 'all') {
				data = await fetchNotifications({ accessToken, page });
			} else if (tab === 'unread') {
				data = await fetchUnreadNotifications({ accessToken, page });
			} else {
				// Fetch by each type in the category and merge
				const categoryTypes =
					CATEGORY_TYPES[tab as keyof typeof CATEGORY_TYPES];
				if (categoryTypes && categoryTypes.length === 1) {
					data = await fetchNotificationsByType({
						accessToken,
						type: categoryTypes[0],
						page,
					});
				} else if (categoryTypes) {
					// Fetch all types in parallel for multi-type categories
					const results = await Promise.all(
						categoryTypes.map((type) =>
							fetchNotificationsByType({
								accessToken,
								type,
								page,
							}).catch(() => ({
								notifications: [],
								pagination: { page: 1, pages: 1 },
							})),
						),
					);
					const merged = results
						.flatMap((r) => r.notifications)
						.sort(
							(a, b) =>
								new Date(b.createdAt).getTime() -
								new Date(a.createdAt).getTime(),
						);
					data = {
						notifications: merged,
						pagination: {
							page,
							pages: Math.max(
								...results.map((r) => r.pagination.pages),
								1,
							),
						},
					};
				} else {
					data = await fetchNotifications({ accessToken, page });
				}
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

	function handleNotificationClick(n: Notification) {
		if (!n.isRead) handleRead(n.id);
		// Navigate to action URL if available
		const actionUrl = (n as Notification & { actionUrl?: string })
			.actionUrl;
		if (actionUrl) router.push(actionUrl);
	}

	function changeTab(newTab: NotificationCategory) {
		setTab(newTab);
		setPage(1);
	}

	const tabs: { key: NotificationCategory; label: string }[] = [
		{ key: 'all', label: 'All' },
		{ key: 'unread', label: 'Unread' },
		{ key: 'booking', label: 'Bookings' },
		{ key: 'thread', label: 'Threads' },
		{ key: 'payment', label: 'Payments' },
		{ key: 'card', label: 'Card' },
		{ key: 'contact', label: 'Contacts' },
		{ key: 'wallet', label: 'Wallet' },
		{ key: 'artisan', label: 'Artisan' },
	];

	const displayUnread = unreadCount ?? stats?.unreadNotifications ?? 0;

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
						value={displayUnread}
						highlight
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
				<div className='flex gap-2 overflow-x-auto no-scrollbar pb-1'>
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
							{t.key === 'unread' && displayUnread > 0 ?
								` (${displayUnread})`
							:	''}
						</button>
					))}
				</div>

				{displayUnread > 0 && (
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
							onClick={() => handleNotificationClick(n)}
							className={`relative rounded-xl border p-4 transition-colors cursor-pointer hover:bg-white/[0.08] ${
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
								<div className='mt-0.5 shrink-0'>
									<NotificationIcon type={n.type} />
								</div>

								<div className='flex-1 min-w-0'>
									<div className='flex items-center gap-2'>
										<p className='text-sm font-medium text-white leading-tight'>
											{n.title}
										</p>
										<span className='text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/40 shrink-0'>
											{labelForType(n.type)}
										</span>
									</div>
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
										onClick={(e) => {
											e.stopPropagation();
											handleRead(n.id);
										}}
										className='text-xs text-blue-400 hover:text-blue-300'
									>
										Mark read
									</button>
								)}
								<button
									onClick={(e) => {
										e.stopPropagation();
										handleDelete(n.id);
									}}
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

/* ---------- Icon for each notification type ---------- */

function NotificationIcon({ type }: { type: NotificationType }) {
	const cls = 'h-4 w-4';
	switch (type) {
		// Card
		case 'CARD_INTERACTION':
			return <CreditCard className={`${cls} text-blue-400`} />;

		// Contact
		case 'CONTACT_SHARED':
			return <Users className={`${cls} text-green-400`} />;
		case 'CONTACT_SAVED':
			return <UserPlus className={`${cls} text-green-400`} />;

		// Booking
		case 'BOOKING_RECEIVED':
			return <Bookmark className={`${cls} text-purple-400`} />;
		case 'BOOKING_CONFIRMED':
			return <Handshake className={`${cls} text-emerald-400`} />;
		case 'BOOKING_CANCELLED':
			return <AlertTriangle className={`${cls} text-red-400`} />;
		case 'BOOKING_COMPLETED':
			return <CheckCheck className={`${cls} text-emerald-400`} />;
		case 'APPOINTMENT_BOOKED':
			return <Calendar className={`${cls} text-cyan-400`} />;
		case 'MEETING_REQUEST':
			return <Video className={`${cls} text-cyan-400`} />;

		// Thread
		case 'THREAD_NEW_INQUIRY':
			return <MessageSquare className={`${cls} text-blue-400`} />;
		case 'THREAD_NEW_MESSAGE':
			return <Send className={`${cls} text-blue-300`} />;
		case 'THREAD_PROPOSAL_RECEIVED':
			return <Receipt className={`${cls} text-amber-400`} />;
		case 'THREAD_PROPOSAL_ACCEPTED':
			return <Handshake className={`${cls} text-emerald-400`} />;
		case 'THREAD_PROPOSAL_DECLINED':
			return <AlertTriangle className={`${cls} text-red-400`} />;

		// Payment
		case 'PAYMENT_SENT_CONFIRMED':
			return <Send className={`${cls} text-green-400`} />;
		case 'PAYMENT_RECEIVED_CONFIRMED':
			return <Banknote className={`${cls} text-emerald-400`} />;
		case 'PAYMENT_DISPUTED':
			return <AlertTriangle className={`${cls} text-orange-400`} />;

		// Wallet
		case 'WALLET_UPDATE':
			return <Wallet className={`${cls} text-violet-400`} />;
		case 'WALLET_FUNDED':
			return <Banknote className={`${cls} text-green-400`} />;
		case 'WALLET_TRANSFER':
			return <Send className={`${cls} text-violet-400`} />;

		// Artisan
		case 'ARTISAN_ACTIVATED':
			return <ShieldCheck className={`${cls} text-emerald-400`} />;
		case 'ARTISAN_SUSPENDED':
			return <ShieldOff className={`${cls} text-red-400`} />;
		case 'REVIEW_RECEIVED':
			return <Star className={`${cls} text-amber-400`} />;
		case 'PROMOTION_STARTED':
			return <Megaphone className={`${cls} text-pink-400`} />;
		case 'PROMOTION_EXPIRED':
			return <Megaphone className={`${cls} text-white/30`} />;

		default:
			return <Bell className={`${cls} text-white/40`} />;
	}
}

/* ---------- Human-readable label per type ---------- */

function labelForType(type: NotificationType): string {
	const labels: Record<NotificationType, string> = {
		CARD_INTERACTION: 'Card',
		CONTACT_SHARED: 'Contact',
		CONTACT_SAVED: 'Contact',
		WALLET_UPDATE: 'Wallet',
		WALLET_FUNDED: 'Wallet',
		WALLET_TRANSFER: 'Transfer',
		MEETING_REQUEST: 'Meeting',
		APPOINTMENT_BOOKED: 'Appointment',
		ARTISAN_ACTIVATED: 'Artisan',
		ARTISAN_SUSPENDED: 'Artisan',
		BOOKING_RECEIVED: 'Booking',
		BOOKING_CONFIRMED: 'Booking',
		BOOKING_CANCELLED: 'Booking',
		BOOKING_COMPLETED: 'Booking',
		REVIEW_RECEIVED: 'Review',
		PROMOTION_STARTED: 'Promo',
		PROMOTION_EXPIRED: 'Promo',
		THREAD_NEW_INQUIRY: 'Thread',
		THREAD_NEW_MESSAGE: 'Thread',
		THREAD_PROPOSAL_RECEIVED: 'Proposal',
		THREAD_PROPOSAL_ACCEPTED: 'Proposal',
		THREAD_PROPOSAL_DECLINED: 'Proposal',
		PAYMENT_SENT_CONFIRMED: 'Payment',
		PAYMENT_RECEIVED_CONFIRMED: 'Payment',
		PAYMENT_DISPUTED: 'Dispute',
	};
	return labels[type] ?? type;
}

/* ---------- Stat card ---------- */

function StatCard({
	label,
	value,
	highlight,
}: {
	label: string;
	value: number;
	highlight?: boolean;
}) {
	return (
		<div className='bg-white/5 rounded-xl p-3 text-center'>
			<p
				className={`text-lg font-semibold ${highlight && value > 0 ? 'text-blue-400' : 'text-white'}`}
			>
				{value}
			</p>
			<p className='text-xs text-white/40'>{label}</p>
		</div>
	);
}

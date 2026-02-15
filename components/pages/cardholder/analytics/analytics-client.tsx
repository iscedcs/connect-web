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
import {
	fetchProfileStats,
	type ProfileStats,
} from '@/lib/services/profile-stats';
import {
	fetchNotificationStats,
	type NotificationStats,
} from '@/lib/services/notification';
import {
	fetchSupportRequestStats,
	type SupportRequestStats,
} from '@/lib/services/support-request';
import { fetchSocialStats, type SocialStats } from '@/lib/services/social';
import { fetchReceivedContactStats } from '@/lib/services/contact';
import {
	Smartphone,
	BarChart3,
	Trash2,
	NfcIcon,
	TrendingUp,
	Users,
	Bell,
	Link2,
	MessageSquare,
	Eye,
	QrCode,
	ChevronDown,
	ChevronUp,
	Activity,
	Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';

type Tab = 'all' | 'TAP' | 'SCAN';

interface ContactStats {
	totalContacts: number;
	contactsWithEmail: number;
	contactsWithPhone: number;
	contactsWithNotes: number;
	todayContacts: number;
	thisWeekContacts: number;
	completionRate: number;
}

export default function AnalyticsClient({
	accessToken,
	defaultProfileId,
}: {
	accessToken: string;
	defaultProfileId?: string;
}) {
	const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
	const [cardStats, setCardStats] = useState<CardInteractionStats | null>(
		null,
	);
	const [notifStats, setNotifStats] = useState<NotificationStats | null>(
		null,
	);
	const [supportStats, setSupportStats] =
		useState<SupportRequestStats | null>(null);
	const [socialStats, setSocialStats] = useState<SocialStats | null>(null);
	const [contactStats, setContactStats] = useState<ContactStats | null>(null);

	const [interactions, setInteractions] = useState<CardInteraction[]>([]);
	const [tab, setTab] = useState<Tab>('all');
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [listLoading, setListLoading] = useState(true);
	const [showInteractions, setShowInteractions] = useState(false);
	const [loading, setLoading] = useState(true);

	const loadAllStats = useCallback(async () => {
		setLoading(true);
		const results = await Promise.allSettled([
			fetchProfileStats(accessToken),
			fetchCardInteractionStats({ accessToken }),
			fetchNotificationStats({ accessToken }),
			fetchSupportRequestStats({ accessToken }),
			fetchSocialStats({ accessToken }),
			defaultProfileId
				? fetchReceivedContactStats({
						profileId: defaultProfileId,
						accessToken,
					})
				: Promise.resolve(null),
		]);

		if (results[0].status === 'fulfilled') setProfileStats(results[0].value);
		if (results[1].status === 'fulfilled') setCardStats(results[1].value);
		if (results[2].status === 'fulfilled') setNotifStats(results[2].value);
		if (results[3].status === 'fulfilled')
			setSupportStats(results[3].value);
		if (results[4].status === 'fulfilled') setSocialStats(results[4].value);
		if (results[5].status === 'fulfilled')
			setContactStats(results[5].value);

		setLoading(false);
	}, [accessToken, defaultProfileId]);

	const loadInteractions = useCallback(async () => {
		setListLoading(true);
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
			setListLoading(false);
		}
	}, [accessToken, tab, page]);

	useEffect(() => {
		loadAllStats();
	}, [loadAllStats]);

	useEffect(() => {
		if (showInteractions) loadInteractions();
	}, [showInteractions, loadInteractions]);

	async function handleDelete(id: string) {
		try {
			await deleteCardInteraction({ accessToken, id });
			setInteractions((prev) => prev.filter((i) => i.id !== id));
			toast.success('Interaction removed');
			loadAllStats();
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

	if (loading) {
		return (
			<div className='space-y-4'>
				{[...Array(6)].map((_, i) => (
					<div
						key={i}
						className='h-20 rounded-2xl bg-white/5 animate-pulse'
					/>
				))}
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			{/* ═══ OVERVIEW ═══ */}
			<section>
				<SectionHeader
					icon={<Activity className='h-4 w-4' />}
					title='Overview'
				/>
				<div className='grid grid-cols-2 gap-3 mt-3'>
					<MetricCard
						label='Card Interactions'
						value={
							profileStats?.cardInteractionsCount ??
							cardStats?.totalInteractions ??
							0
						}
						icon={<Eye className='h-4 w-4 text-blue-400' />}
					/>
					<MetricCard
						label='Contacts Received'
						value={
							profileStats?.contactsCount ??
							contactStats?.totalContacts ??
							0
						}
						icon={<Users className='h-4 w-4 text-green-400' />}
					/>
					<MetricCard
						label='Social Links'
						value={
							profileStats?.socialsCount ??
							socialStats?.totalSocials ??
							0
						}
						icon={<Link2 className='h-4 w-4 text-purple-400' />}
					/>
					<MetricCard
						label='Notifications'
						value={profileStats?.unreadNotificationsCount ?? 0}
						icon={<Bell className='h-4 w-4 text-yellow-400' />}
						sub='unread'
					/>
				</div>
			</section>

			{/* ═══ CARD INTERACTIONS ═══ */}
			{cardStats && (
				<section>
					<SectionHeader
						icon={<TrendingUp className='h-4 w-4' />}
						title='Card Interactions'
					/>

					<div className='grid grid-cols-2 gap-3 mt-3'>
						<div className='bg-white/[0.04] rounded-2xl border border-white/5 p-4'>
							<div className='flex items-center gap-2 mb-2'>
								<NfcIcon className='h-4 w-4 text-blue-400' />
								<span className='text-xs text-white/50'>
									NFC Taps
								</span>
							</div>
							<p className='text-2xl font-bold text-white'>
								{cardStats.tapInteractions}
							</p>
							<PercentBar
								percent={cardStats.tapPercentage}
								color='bg-blue-500'
							/>
						</div>
						<div className='bg-white/[0.04] rounded-2xl border border-white/5 p-4'>
							<div className='flex items-center gap-2 mb-2'>
								<QrCode className='h-4 w-4 text-green-400' />
								<span className='text-xs text-white/50'>
									QR Scans
								</span>
							</div>
							<p className='text-2xl font-bold text-white'>
								{cardStats.scanInteractions}
							</p>
							<PercentBar
								percent={cardStats.scanPercentage}
								color='bg-green-500'
							/>
						</div>
					</div>

					<div className='grid grid-cols-3 gap-2 mt-3'>
						<MiniStat
							label='Today'
							value={cardStats.todayInteractions}
						/>
						<MiniStat
							label='This week'
							value={cardStats.thisWeekInteractions}
						/>
						<MiniStat
							label='This month'
							value={cardStats.thisMonthInteractions}
						/>
					</div>

					<div className='mt-3 bg-white/[0.04] rounded-xl border border-white/5 px-4 py-3 flex items-center justify-between'>
						<div className='flex items-center gap-2'>
							<Smartphone className='h-4 w-4 text-white/40' />
							<span className='text-sm text-white/60'>
								Unique devices
							</span>
						</div>
						<span className='text-sm font-semibold text-white'>
							{cardStats.uniqueDevices}
						</span>
					</div>

					<button
						onClick={() => setShowInteractions(!showInteractions)}
						className='mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors py-2'
					>
						{showInteractions ? 'Hide' : 'View'} recent interactions
						{showInteractions ?
							<ChevronUp className='h-3.5 w-3.5' />
						:	<ChevronDown className='h-3.5 w-3.5' />}
					</button>

					{showInteractions && (
						<div className='space-y-3 mt-1'>
							<div className='flex gap-2'>
								{tabs.map((t) => (
									<button
										key={t.key}
										onClick={() => changeTab(t.key)}
										className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
											tab === t.key
												? 'bg-white text-black font-medium'
												: 'bg-white/10 text-white/50 hover:bg-white/15'
										}`}
									>
										{t.label}
									</button>
								))}
							</div>

							{listLoading ?
								<div className='space-y-2'>
									{[...Array(3)].map((_, i) => (
										<div
											key={i}
											className='h-14 rounded-xl bg-white/5 animate-pulse'
										/>
									))}
								</div>
							: interactions.length === 0 ?
								<div className='text-center py-8 text-white/30'>
									<BarChart3 className='h-8 w-8 mx-auto mb-2 opacity-30' />
									<p className='text-sm'>
										No interactions yet
									</p>
								</div>
							:	<div className='space-y-1.5'>
									{interactions.map((i) => (
										<div
											key={i.id}
											className='bg-white/[0.03] rounded-xl border border-white/5 px-3 py-3 flex items-center gap-3'
										>
											<div className='shrink-0'>
												{i.method === 'TAP' ?
													<NfcIcon className='h-4 w-4 text-blue-400' />
												:	<QrCode className='h-4 w-4 text-green-400' />
												}
											</div>
											<div className='flex-1 min-w-0'>
												<div className='flex items-center gap-1.5'>
													<span className='text-sm font-medium text-white'>
														{i.method === 'TAP' ?
															'NFC Tap'
														:	'QR Scan'}
													</span>
													{i.deviceType && (
														<span className='text-[10px] text-white/25 bg-white/5 px-1.5 py-0.5 rounded'>
															{i.deviceType}
														</span>
													)}
												</div>
												<p className='text-[11px] text-white/25 mt-0.5'>
													{format(
														new Date(i.createdAt),
														'MMM d, yyyy HH:mm',
													)}
													{' · '}
													{formatDistanceToNow(
														new Date(i.createdAt),
														{ addSuffix: true },
													)}
												</p>
											</div>
											<button
												onClick={() =>
													handleDelete(i.id)
												}
												className='text-red-400/30 hover:text-red-400 shrink-0 p-1'
												title='Remove'
											>
												<Trash2 className='h-3 w-3' />
											</button>
										</div>
									))}
								</div>
							}

							{totalPages > 1 && (
								<div className='flex items-center justify-center gap-3 pt-1'>
									<button
										onClick={() =>
											setPage((p) => Math.max(1, p - 1))
										}
										disabled={page <= 1}
										className='px-3 py-1 text-xs bg-white/10 rounded disabled:opacity-30 text-white'
									>
										Prev
									</button>
									<span className='text-xs text-white/30'>
										{page} / {totalPages}
									</span>
									<button
										onClick={() =>
											setPage((p) =>
												Math.min(totalPages, p + 1),
											)
										}
										disabled={page >= totalPages}
										className='px-3 py-1 text-xs bg-white/10 rounded disabled:opacity-30 text-white'
									>
										Next
									</button>
								</div>
							)}
						</div>
					)}
				</section>
			)}

			{/* ═══ CONTACTS RECEIVED ═══ */}
			{contactStats && (
				<section>
					<SectionHeader
						icon={<Users className='h-4 w-4' />}
						title='Contacts Received'
					/>
					<div className='grid grid-cols-2 gap-3 mt-3'>
						<MetricCard
							label='Total'
							value={contactStats.totalContacts}
							icon={<Users className='h-4 w-4 text-green-400' />}
						/>
						<MetricCard
							label='Completion'
							value={`${contactStats.completionRate}%`}
							icon={
								<TrendingUp className='h-4 w-4 text-teal-400' />
							}
							sub='email + phone'
						/>
					</div>
					<div className='grid grid-cols-3 gap-2 mt-3'>
						<MiniStat
							label='With email'
							value={contactStats.contactsWithEmail}
						/>
						<MiniStat
							label='With phone'
							value={contactStats.contactsWithPhone}
						/>
						<MiniStat
							label='With notes'
							value={contactStats.contactsWithNotes}
						/>
					</div>
					<div className='grid grid-cols-2 gap-2 mt-2'>
						<MiniStat
							label='Today'
							value={contactStats.todayContacts}
						/>
						<MiniStat
							label='This week'
							value={contactStats.thisWeekContacts}
						/>
					</div>
				</section>
			)}

			{/* ═══ SOCIAL LINKS ═══ */}
			{socialStats && socialStats.totalSocials > 0 && (
				<section>
					<SectionHeader
						icon={<Globe className='h-4 w-4' />}
						title='Social Links'
					/>
					<div className='mt-3 bg-white/[0.04] rounded-2xl border border-white/5 p-4'>
						<div className='flex items-center justify-between mb-3'>
							<span className='text-sm text-white/60'>
								Total platforms
							</span>
							<span className='text-lg font-bold text-white'>
								{socialStats.totalSocials}
							</span>
						</div>
						{socialStats.platforms.length > 0 && (
							<div className='space-y-2'>
								{socialStats.platforms.map((p) => (
									<div
										key={p.platform}
										className='flex items-center justify-between'
									>
										<span className='text-sm text-white/50 capitalize'>
											{p.platform}
										</span>
										<span className='text-sm font-medium text-white'>
											{p.count}
										</span>
									</div>
								))}
							</div>
						)}
					</div>
				</section>
			)}

			{/* ═══ NOTIFICATIONS ═══ */}
			{notifStats && (
				<section>
					<SectionHeader
						icon={<Bell className='h-4 w-4' />}
						title='Notifications'
					/>
					<div className='grid grid-cols-2 gap-3 mt-3'>
						<MetricCard
							label='Total'
							value={notifStats.totalNotifications}
							icon={<Bell className='h-4 w-4 text-yellow-400' />}
						/>
						<MetricCard
							label='Unread'
							value={notifStats.unreadNotifications}
							icon={<Eye className='h-4 w-4 text-orange-400' />}
							sub={`${notifStats.readRate}% read`}
						/>
					</div>
					<div className='grid grid-cols-2 gap-2 mt-3'>
						<MiniStat
							label='Card interaction'
							value={notifStats.cardInteractionNotifications}
						/>
						<MiniStat
							label='Contact shared'
							value={notifStats.contactSharedNotifications}
						/>
					</div>
					<div className='grid grid-cols-2 gap-2 mt-2'>
						<MiniStat
							label='Today'
							value={notifStats.todayNotifications}
						/>
						<MiniStat
							label='This week'
							value={notifStats.thisWeekNotifications}
						/>
					</div>
				</section>
			)}

			{/* ═══ SUPPORT REQUESTS ═══ */}
			{supportStats && (
				<section>
					<SectionHeader
						icon={<MessageSquare className='h-4 w-4' />}
						title='Support Requests'
					/>
					<div className='grid grid-cols-2 gap-3 mt-3'>
						<MetricCard
							label='Total'
							value={supportStats.totalRequests}
							icon={
								<MessageSquare className='h-4 w-4 text-indigo-400' />
							}
						/>
						<MetricCard
							label='This month'
							value={supportStats.thisMonthRequests}
							icon={
								<TrendingUp className='h-4 w-4 text-indigo-300' />
							}
						/>
					</div>
					<div className='grid grid-cols-2 gap-2 mt-3'>
						<MiniStat
							label='Today'
							value={supportStats.todayRequests}
						/>
						<MiniStat
							label='This week'
							value={supportStats.thisWeekRequests}
						/>
					</div>
				</section>
			)}
		</div>
	);
}

/* ──────────── sub-components ──────────── */

function SectionHeader({
	icon,
	title,
}: {
	icon: React.ReactNode;
	title: string;
}) {
	return (
		<div className='flex items-center gap-2'>
			<div className='text-white/40'>{icon}</div>
			<h2 className='text-sm font-semibold text-white/80 uppercase tracking-wider'>
				{title}
			</h2>
		</div>
	);
}

function MetricCard({
	label,
	value,
	icon,
	sub,
}: {
	label: string;
	value: number | string;
	icon: React.ReactNode;
	sub?: string;
}) {
	return (
		<div className='bg-white/[0.04] rounded-2xl border border-white/5 p-4'>
			<div className='flex items-center gap-2 mb-1'>
				{icon}
				<span className='text-xs text-white/40'>{label}</span>
			</div>
			<p className='text-2xl font-bold text-white'>{value}</p>
			{sub && (
				<p className='text-[10px] text-white/25 mt-0.5'>{sub}</p>
			)}
		</div>
	);
}

function MiniStat({ label, value }: { label: string; value: number }) {
	return (
		<div className='bg-white/[0.03] rounded-xl px-3 py-2.5 text-center'>
			<p className='text-base font-semibold text-white'>{value}</p>
			<p className='text-[10px] text-white/35'>{label}</p>
		</div>
	);
}

function PercentBar({
	percent,
	color,
}: {
	percent: number;
	color: string;
}) {
	return (
		<div className='mt-2 h-1 rounded-full bg-white/10 overflow-hidden'>
			<div
				className={`h-full rounded-full ${color} transition-all duration-500`}
				style={{ width: `${Math.min(percent, 100)}%` }}
			/>
		</div>
	);
}

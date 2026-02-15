import { Users, Share2, Bell, LifeBuoy, CreditCard } from 'lucide-react';
import type { ProfileStats } from '@/lib/services/profile-stats';
import Link from 'next/link';

interface ProfileStatsCardProps {
	stats: ProfileStats;
}

const STAT_ITEMS = [
	{
		key: 'socialsCount' as const,
		label: 'Social Links',
		icon: Share2,
		color: 'text-sky-400',
		bg: 'bg-sky-400/10',
		href: '/connect/links/socials',
	},
	{
		key: 'contactsCount' as const,
		label: 'Contacts',
		icon: Users,
		color: 'text-emerald-400',
		bg: 'bg-emerald-400/10',
		href: '/contacts',
	},
	{
		key: 'cardInteractionsCount' as const,
		label: 'Card Taps',
		icon: CreditCard,
		color: 'text-purple-400',
		bg: 'bg-purple-400/10',
		href: '/analytics',
	},
	{
		key: 'unreadNotificationsCount' as const,
		label: 'Unread',
		icon: Bell,
		color: 'text-amber-400',
		bg: 'bg-amber-400/10',
		href: '/notifications',
	},
	{
		key: 'supportRequestsCount' as const,
		label: 'Tickets',
		icon: LifeBuoy,
		color: 'text-rose-400',
		bg: 'bg-rose-400/10',
		href: '/support',
	},
];

export default function ProfileStatsCard({ stats }: ProfileStatsCardProps) {
	return (
		<div className='rounded-2xl border border-white/10 bg-white/[0.03] p-4'>
			<h3 className='text-sm font-semibold text-white/70 mb-3'>
				Profile Overview
			</h3>
			<div className='grid grid-cols-3 gap-3'>
				{STAT_ITEMS.slice(0, 3).map((item) => (
					<Link
						key={item.key}
						href={item.href}
						className='flex flex-col items-center gap-1.5 rounded-xl p-3 hover:bg-white/5 transition'
					>
						<div
							className={`h-9 w-9 rounded-full ${item.bg} flex items-center justify-center`}
						>
							<item.icon className={`h-4 w-4 ${item.color}`} />
						</div>
						<span className='text-lg font-bold'>
							{stats[item.key]}
						</span>
						<span className='text-2xs text-white/50'>
							{item.label}
						</span>
					</Link>
				))}
			</div>
			<div className='grid grid-cols-2 gap-3 mt-3'>
				{STAT_ITEMS.slice(3).map((item) => (
					<Link
						key={item.key}
						href={item.href}
						className='flex items-center gap-3 rounded-xl p-3 hover:bg-white/5 transition'
					>
						<div
							className={`h-8 w-8 rounded-full ${item.bg} flex items-center justify-center shrink-0`}
						>
							<item.icon className={`h-4 w-4 ${item.color}`} />
						</div>
						<div>
							<span className='text-base font-bold block leading-tight'>
								{stats[item.key]}
							</span>
							<span className='text-2xs text-white/50'>
								{item.label}
							</span>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}

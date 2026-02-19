import { getAuthInfo } from '@/actions/auth';
import { getConnectProfile } from '@/lib/services/profile';
import { generateMetadata } from '@/lib/metadata';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
	User,
	Bell,
	BarChart3,
	Settings2,
	LifeBuoy,
	FileText,
	Shield,
	ChevronRight,
	Smartphone,
	Wallet,
	AtSign,
	ExternalLink,
} from 'lucide-react';

export const metadata = generateMetadata({
	title: 'Settings',
	description:
		'Manage your Connect account settings, profile, and preferences.',
	keywords: ['settings', 'account', 'preferences'],
});

const SETTINGS_SECTIONS = [
	{
		heading: 'Profile',
		items: [
			{
				href: '/profiles',
				label: 'Profiles',
				description:
					'Manage your profiles, create new ones, or set a default',
				Icon: User,
			},
			{
				href: '/devices',
				label: 'Devices',
				description:
					'Manage NFC cards, wristbands, and link them to profiles',
				Icon: Smartphone,
			},
			{
				href: '/settings/connect-config',
				label: 'Profile Configuration',
				description: 'Module ordering, visibility, and theme settings',
				Icon: Settings2,
			},
		],
	},
	{
		heading: 'Activity',
		items: [
			{
				href: '/notifications',
				label: 'Notifications',
				description:
					'View card interactions and contact sharing alerts',
				Icon: Bell,
			},
			{
				href: '/analytics',
				label: 'Card Analytics',
				description: 'NFC tap and QR scan statistics',
				Icon: BarChart3,
			},
		],
	},
	{
		heading: 'Payments & Wallet',
		items: [
			{
				href: '/bvn',
				label: 'Activate Wallet Payments',
				description:
					'Verify your BVN to receive money on your Connect profile',
				Icon: Wallet,
			},
			{
				href: '/settings/account/tag',
				label: 'ISCE Tag (@handle)',
				description:
					'Set your unique @tag so others can find and pay you',
				Icon: AtSign,
			},
		],
	},
	{
		heading: 'Help & Legal',
		items: [
			{
				href: '/support',
				label: 'Contact Support',
				description: 'Submit a ticket or view previous requests',
				Icon: LifeBuoy,
			},
			{
				href: '/terms',
				label: 'Terms of Service',
				description: 'Our terms and conditions',
				Icon: FileText,
			},
			{
				href: '/privacy',
				label: 'Privacy Policy',
				description: 'How we handle your data',
				Icon: Shield,
			},
		],
	},
];

export default async function SettingsPage() {
	const authInfo = await getAuthInfo();
	const isAuthed = !('error' in authInfo) && !authInfo.isExpired;
	if (!isAuthed) redirect('/');

	const connectProfile = await getConnectProfile();
	const hasProfile = Boolean(connectProfile?.id);

	return (
		<main className='min-h-screen bg-black text-white'>
			<div className='max-w-md mx-auto p-4 space-y-6'>
				<h1 className='text-2xl font-bold'>Settings</h1>

				{!hasProfile && (
					<Link
						href='/settings/account/create'
						className='flex items-center justify-between rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 hover:bg-sky-500/20 transition'
					>
						<div>
							<p className='text-sm font-semibold text-sky-400'>
								Get started
							</p>
							<p className='text-xs text-white/50 mt-0.5'>
								Create your first Connect profile
							</p>
						</div>
						<ChevronRight className='h-4 w-4 text-sky-400' />
					</Link>
				)}

				{SETTINGS_SECTIONS.map((section) => (
					<section key={section.heading}>
						<h2 className='text-xs font-semibold uppercase tracking-wider text-white/40 mb-2 px-1'>
							{section.heading}
						</h2>
						<div className='rounded-xl border border-white/5 overflow-hidden divide-y divide-white/5'>
							{section.items.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									className='flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition'
								>
									<div className='h-9 w-9 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0'>
										<item.Icon className='h-4 w-4 text-white/60' />
									</div>
									<div className='flex-1 min-w-0'>
										<p className='text-sm font-medium'>
											{item.label}
										</p>
										<p className='text-xs text-white/40 truncate'>
											{item.description}
										</p>
									</div>
									<ChevronRight className='h-4 w-4 text-white/20 shrink-0' />
								</Link>
							))}
						</div>
					</section>
				))}

				{process.env.NEXT_PUBLIC_WALLET_WEB_URL && (
					<section>
						<h2 className='text-xs font-semibold uppercase tracking-wider text-white/40 mb-2 px-1'>
							ISCE Wallet App
						</h2>
						<a
							href={process.env.NEXT_PUBLIC_WALLET_WEB_URL}
							target='_blank'
							rel='noopener noreferrer'
							className='flex items-center gap-3 px-4 py-3.5 rounded-xl border border-white/5 hover:bg-white/5 transition'
						>
							<div className='h-9 w-9 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0'>
								<Wallet className='h-4 w-4 text-white/60' />
							</div>
							<div className='flex-1 min-w-0'>
								<p className='text-sm font-medium'>
									Manage on ISCE Wallet
								</p>
								<p className='text-xs text-white/40 truncate'>
									View balance, transactions, and full wallet
									management
								</p>
							</div>
							<ExternalLink className='h-4 w-4 text-white/20 shrink-0' />
						</a>
					</section>
				)}
			</div>
		</main>
	);
}

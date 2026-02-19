'use client';

import { ContactIcon, PrivacyIcon, SignOutIcon, TermsIcon } from '@/lib/icons';
import { ChevronRight, Settings, Settings2, Users, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Row = {
	href?: string;
	label: string;
	Icon: React.ComponentType<{ className?: string }>;
	onClick?: (e: React.MouseEvent) => void;
};

export default function AccountSettingsList({
	isAuthenticated,
}: {
	isAuthenticated: boolean;
}) {
	const router = useRouter();

	const baseRows: Row[] = [
		{
			href: '/profiles',
			label: 'View all profiles',
			Icon: Users,
		},
		{
			href: '/bvn',
			label: 'Wallet activation',
			Icon: Wallet,
		},
		{
			href: '/settings',
			label: 'Settings',
			Icon: Settings,
		},
		{
			href: '/settings/connect-config',
			label: 'Profile configuration',
			Icon: Settings2,
		},
		{ href: '/support', label: 'Contact support', Icon: ContactIcon },
		{ href: '/terms', label: 'Terms of service', Icon: TermsIcon },
		{ href: '/privacy', label: 'Privacy policy', Icon: PrivacyIcon },
	];

	const authRow: Row =
		isAuthenticated ?
			{
				href: '/auth/logout',
				label: 'Sign out from this device',
				Icon: SignOutIcon,
			}
		:	{
				label: 'Sign in to this device',
				Icon: SignOutIcon,
				onClick: (e) => {
					e.preventDefault();
					const back = window.location.href;
					router.push(
						`/auth/login?redirect=${encodeURIComponent(back)}`,
					);
				},
			};
	const rows = [...baseRows, authRow];
	return (
		<div className='mt-4'>
			<h4 className='text-xl font-extrabold text-gray-300 mb-3'>
				Account settings
			</h4>
			<div className=' rounded-2xl overflow-hidden'>
				{rows.map(({ href, label, Icon, onClick }) =>
					href ?
						<Link
							key={label}
							href={href!}
							prefetch={
								href === '/auth/logout' ? false : undefined
							}
							className='flex items-center justify-between px-4 py-4 hover:bg-neutral-800 active:bg-neutral-800'
						>
							<div className='flex items-center gap-3'>
								<Icon className='w-5 h-5 text-gray-200' />
								<span className='text-sm'>{label}</span>
							</div>
							<ChevronRight className='w-4 h-4 text-gray-400' />
						</Link>
					:	<button
							key={label}
							type='button'
							onClick={onClick}
							className='w-full text-left flex items-center justify-between px-4 py-4 hover:bg-neutral-800 active:bg-neutral-800'
						>
							<div className='flex items-center gap-3'>
								<Icon className='w-5 h-5 text-gray-200' />
								<span className='text-sm'>{label}</span>
							</div>
							<ChevronRight className='w-4 h-4 text-gray-400' />
						</button>,
				)}
			</div>
		</div>
	);
}

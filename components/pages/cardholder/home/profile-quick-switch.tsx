'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { URLS } from '@/lib/const';
import { Check, ChevronDown, Loader2, Plus, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarInitials } from '@/lib/utils';
import Link from 'next/link';

interface QuickSwitchProfile {
	id?: string;
	name?: string | null;
	position?: string | null;
	profilePhoto?: string | null;
	slug?: string | null;
	is_default?: boolean;
}

interface ProfileQuickSwitchProps {
	currentProfileId?: string | null;
	profiles?: QuickSwitchProfile[] | null;
	accessToken?: string;
	className?: string;
	triggerSize?: 'sm' | 'md';
}

export default function ProfileQuickSwitch({
	currentProfileId,
	profiles = [],
	accessToken,
	className = '',
	triggerSize = 'md',
}: ProfileQuickSwitchProps) {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const [switchingId, setSwitchingId] = useState<string | null>(null);

	const profileList = (profiles ?? []).filter(
		(p): p is QuickSwitchProfile & { id: string } => Boolean(p && p.id),
	);

	const handleSwitch = async (targetProfile: QuickSwitchProfile & { id: string }) => {
		if (targetProfile.id === currentProfileId) {
			setIsOpen(false);
			return;
		}

		if (switchingId) return;

		setSwitchingId(targetProfile.id);

		try {
			const url = `${
				process.env.NEXT_PUBLIC_CONNECT_API_URL
			}${URLS.multi_profile.set_default_one.replace(
				'{profileId}',
				targetProfile.id,
			)}`;

			const res = await fetch(url, {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json',
				},
			});

			const json = await res.json().catch(() => null);

			if (res.ok) {
				toast.success(
					`Switched active profile to ${targetProfile.name || 'selected profile'}`,
				);
				setIsOpen(false);
				router.refresh();
			} else {
				toast.error(
					json?.message || 'Failed to switch active profile',
				);
			}
		} catch (error) {
			console.error('Error switching profile:', error);
			toast.error('An unexpected error occurred while switching profiles');
		} finally {
			setSwitchingId(null);
		}
	};

	const buttonSizeClasses =
		triggerSize === 'sm'
			? 'h-5 w-5 -bottom-0.5 -right-0.5'
			: 'h-6 w-6 -bottom-1 -right-1';

	const iconSizeClasses = triggerSize === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';

	return (
		<div
			className={`absolute ${buttonSizeClasses} z-20 ${className}`}
			onClick={(e) => {
				e.stopPropagation();
			}}
		>
			<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
				<DropdownMenuTrigger asChild>
					<button
						type='button'
						aria-label='Quick switch profile'
						title='Switch profile'
						className='flex h-full w-full items-center justify-center rounded-full bg-neutral-900 border border-white/20 text-white/90 shadow-md transition-all hover:bg-neutral-800 hover:text-white hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer'
					>
						<ChevronDown className={iconSizeClasses} />
					</button>
				</DropdownMenuTrigger>

				<DropdownMenuContent
					align='start'
					sideOffset={8}
					className='w-72 bg-neutral-950/95 border-white/10 text-white shadow-2xl backdrop-blur-lg p-2 rounded-xl z-50'
				>
					<DropdownMenuLabel className='px-2 py-1.5 flex items-center justify-between text-xs text-white/60 font-medium'>
						<span>Switch Profile</span>
						{profileList.length > 0 && (
							<span className='text-[10px] bg-white/10 rounded-full px-2 py-0.5 text-white/70'>
								{profileList.length}{' '}
								{profileList.length === 1 ? 'profile' : 'profiles'}
							</span>
						)}
					</DropdownMenuLabel>

					<DropdownMenuSeparator className='bg-white/10 my-1' />

					<DropdownMenuGroup className='max-h-60 overflow-y-auto space-y-1 py-1'>
						{profileList.length === 0 ? (
							<div className='py-3 text-center text-xs text-white/50'>
								No profiles found
							</div>
						) : (
							profileList.map((profile) => {
								const isActive =
									profile.id === currentProfileId ||
									(profile.is_default && !currentProfileId);
								const isSwitching = switchingId === profile.id;
								const displayName =
									profile.name || 'Unnamed Profile';
								const initials = getAvatarInitials(displayName);

								return (
									<DropdownMenuItem
										key={profile.id}
										disabled={!!switchingId}
										onClick={() => handleSwitch(profile)}
										className={`flex items-center justify-between gap-3 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
											isActive
												? 'bg-white/10 text-white font-medium'
												: 'hover:bg-white/5 text-white/80'
										}`}
									>
										<div className='flex items-center gap-2.5 min-w-0 flex-1'>
											<Avatar className='h-8 w-8 shrink-0 overflow-hidden border border-white/10'>
												<AvatarImage
													src={
														profile.profilePhoto ||
														'/assets/default-avatar.png'
													}
													alt={displayName}
													className='object-cover h-full w-full'
												/>
												<AvatarFallback className='bg-neutral-800 text-white text-[10px]'>
													{initials}
												</AvatarFallback>
											</Avatar>

											<div className='min-w-0 flex-1'>
												<p className='text-xs font-semibold text-white truncate'>
													{displayName}
												</p>
												{profile.position && (
													<p className='text-[11px] text-white/50 truncate'>
														{profile.position}
													</p>
												)}
											</div>
										</div>

										<div className='shrink-0 ml-2'>
											{isSwitching ? (
												<Loader2 className='h-4 w-4 animate-spin text-emerald-400' />
											) : isActive ? (
												<span className='flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'>
													<Check className='h-3 w-3' />
												</span>
											) : null}
										</div>
									</DropdownMenuItem>
								);
							})
						)}
					</DropdownMenuGroup>

					<DropdownMenuSeparator className='bg-white/10 my-1' />

					<div className='space-y-0.5 pt-1'>
						<Link
							href='/settings/account/create'
							onClick={() => setIsOpen(false)}
							className='flex items-center gap-2 px-2 py-1.5 text-xs text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer'
						>
							<Plus className='h-3.5 w-3.5 text-emerald-400' />
							<span>Create new profile</span>
						</Link>

						<Link
							href='/profiles'
							onClick={() => setIsOpen(false)}
							className='flex items-center gap-2 px-2 py-1.5 text-xs text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer'
						>
							<Settings className='h-3.5 w-3.5 text-white/50' />
							<span>Manage profiles</span>
						</Link>
					</div>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

'use client';

import MaxWidthWrapper from '@/components/maxwidth-wrapper';
import ShareQrDialog from '@/components/customer/share-qr-dialog';
import AddSlugDialog from './add-slug-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { BellIcon } from '@/lib/icons';
import { getDeterministicAvatarDataUri, getAvatarInitials } from '@/lib/utils';
import { BarChart2, MessageSquare, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useNotificationSocket } from '@/hooks/useNotificationSocket';

type ProfileHeaderProfile = {
	profilePhoto: string | null;
	coverPhoto: string | null;
	name: string | null;
	position: string | null;
	description: string | null;
	slug?: string | null;
};

interface ProfileHeaderProps {
	connectProfile?: ProfileHeaderProfile | null;
	user?: UserInfo | null;
	profileId?: string | null;
	contactData?: {
		primary?: { email?: string; phone_number?: string };
	};
	linksData?: { title?: string; url?: string; platform?: string }[];
	socialsData?: { title?: string; url?: string; platform?: string }[];
	unreadThreadCount?: number;
	unreadNotificationCount?: number;
	accessToken?: string;
}

export default function ProfileHeader({
	user,
	connectProfile,
	profileId,
	contactData,
	linksData,
	socialsData,
	unreadThreadCount = 0,
	unreadNotificationCount = 0,
	accessToken,
}: ProfileHeaderProps) {
	// Real-time notification count via WebSocket
	const { unreadCount: wsUnreadCount } = useNotificationSocket({
		accessToken: accessToken || '',
		enabled: !!accessToken,
	});

	// Use WebSocket count if available (> 0 means we've received an update),
	// otherwise fall back to server-side count
	const notifCount =
		wsUnreadCount > 0 ? wsUnreadCount : unreadNotificationCount;

	const coverUrl = connectProfile?.coverPhoto || '/cover-image.png';

	const avatarUrl =
		connectProfile?.profilePhoto ||
		user?.displayPicture ||
		getDeterministicAvatarDataUri(
			user?.id || connectProfile?.name,
			connectProfile?.name,
		);

	const name =
		connectProfile?.name ||
		[user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
		'Connect User';

	const roleOrBio = connectProfile?.position || '';

	const initials = getAvatarInitials(name);

	const slug = connectProfile?.slug;

	return (
		<div className='flex flex-col w-full backdrop-blur-md bg-black/70  pb-4'>
			{/* Cover Image */}
			<div className='relative w-full h-32'>
				<Image
					src={coverUrl}
					fill
					sizes='100vw'
					priority
					alt='Cover'
					className='w-full h-full object-cover'
				/>
				<div className='absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent' />

				{/* Avatar overlapping cover */}
				<div className='absolute -bottom-10 left-6'>
					<Avatar className='w-20 h-20 overflow-hidden'>
						<AvatarImage
							src={avatarUrl}
							alt='User Avatar'
							className='object-cover w-full h-full'
						/>
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>
				</div>
			</div>

			{/* Profile Info */}
			<MaxWidthWrapper className='mt-14'>
				<div className='flex flex-col w-full  space-y-4 '>
					{/* Role */}
					<div className='mb-3  items-start'>
						{!!roleOrBio && (
							<p className='text-sm text-white'>{roleOrBio}</p>
						)}
						{/* Name */}
						<h2 className='text-2xl font-extrabold'>{name}</h2>
					</div>
					{/* Buttons + Icons in one row */}
					<div className='flex w-full  items-center justify-between'>
						<div className='flex gap-2'>
							{/* <Button
                variant="secondary"
                className="rounded-full border-none px-4 py-2 cursor-pointer text-xs ">
                Send money
              </Button> */}
							<Link href='/contacts'>
								<Button
									variant='default'
									className='rounded-full bg-[#151515D9] border-[#868686] border-[0.5px] px-4 py-2 cursor-pointer text-xs '
								>
									View contacts
								</Button>
							</Link>
						</div>

						{/* Icons */}
						<div className='flex items-center'>
							{slug ?
								<ShareQrDialog
									profileId={slug}
									profile={{
										name: connectProfile?.name ?? undefined,
										profilePhoto:
											connectProfile?.profilePhoto ??
											undefined,
										position:
											connectProfile?.position ??
											undefined,
										bio:
											connectProfile?.description ??
											undefined,
									}}
									contact={contactData}
									links={linksData}
									socials={socialsData}
									slugMode
								/>
							:	<AddSlugDialog />}
							<Link
								href='/connect/artisan/threads'
								className='relative'
							>
								<Button
									size='icon'
									className='rounded-full bg-transparent hover:bg-transparent cursor-pointer'
									title='Messages'
								>
									<MessageSquare className='w-10 h-10' />
								</Button>
								{unreadThreadCount > 0 && (
									<span className='absolute -top-0.5 -right-0.5 bg-purple-500 text-white text-[9px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1'>
										{unreadThreadCount > 99 ?
											'99+'
										:	unreadThreadCount}
									</span>
								)}
							</Link>
							<Link href='/analytics'>
								<Button
									size='icon'
									className='rounded-full bg-transparent hover:bg-transparent cursor-pointer'
									title='Card Analytics'
								>
									<BarChart2 className='w-10 h-10' />
								</Button>
							</Link>
							<Link
								href='/notifications'
								className='relative'
							>
								<Button
									size='icon'
									className='rounded-full bg-transparent hover:bg-transparent cursor-pointer'
									title='Notifications'
								>
									<BellIcon className='w-10 h-10' />
								</Button>
								{notifCount > 0 && (
									<span className='absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1'>
										{notifCount > 99 ? '99+' : notifCount}
									</span>
								)}
							</Link>
							<Link href='/contacts'>
								<Button
									size='icon'
									className='rounded-full bg-transparent hover:bg-transparent cursor-pointer'
									title='Contacts Received'
								>
									<Users className='w-10 h-10' />
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</MaxWidthWrapper>
		</div>
	);
}

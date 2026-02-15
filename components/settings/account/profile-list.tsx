'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ProfileCard from './profile-card';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { URLS } from '@/lib/const';
import { LeftIcon } from '@/lib/icons';

interface Profile {
	id: string;
	name: string;
	position: string;
	profilePhoto?: string | null;
	slug?: string | null;
	is_default: boolean;
}

export default function ProfileList({
	profiles,
	accessToken,
}: {
	profiles: Profile[];
	accessToken: string;
}) {
	const [list, setList] = useState<Profile[]>(profiles);

	async function refresh() {
		const res = await fetch(
			`${process.env.NEXT_PUBLIC_CONNECT_API_URL}${URLS.multi_profile.all}`,
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			},
		);

		const json = await res.json();
		setList(json.data?.profiles || []);
	}

	const router = useRouter();
	return (
		<div className='space-y-4'>
			<div className='mb-3 flex items-center justify-between gap-3'>
				<button
					title='back'
					onClick={() => router.back()}
					className='inline-flex items-center gap-2 bg-transparent hover:bg-transparent cursor-pointer text-white/90'
				>
					<LeftIcon />
				</button>

				<Button
					className='h-10 px-4 rounded-full bg-gradient-to-r from-primary  text-white font-semibold shadow-md shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-400'
					onClick={() =>
						(window.location.href = '/settings/account/create')
					}
				>
					<Plus className='h-4 w-4 mr-2' />
					Create profile
				</Button>
			</div>
			{list.map((profile) => (
				<ProfileCard
					key={profile.id}
					profile={profile}
					accessToken={accessToken}
					onUpdated={refresh}
				/>
			))}

			<Button
				variant='ghost'
				className='w-full underline text-white/50 cursor-pointer'
				onClick={() =>
					(window.location.href = '/settings/account/deleted')
				}
			>
				View deleted profiles
			</Button>
		</div>
	);
}

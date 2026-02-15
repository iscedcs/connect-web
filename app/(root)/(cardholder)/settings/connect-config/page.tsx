import { getAuthInfo } from '@/actions/auth';
import { getConnectProfile } from '@/lib/services/profile';
import { fetchConnectConfig } from '@/lib/services/connect-config';
import ConnectConfigClient from '@/components/settings/connect-config-client';
import { generateMetadata } from '@/lib/metadata';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata = generateMetadata({
	title: 'Profile Configuration',
	description:
		'Configure the display order, visibility, and theme of your Connect profile modules.',
	keywords: ['settings', 'configuration', 'connect', 'modules', 'theme'],
});

export default async function ConnectConfigPage() {
	const [connectProfile, authInfo] = await Promise.all([
		getConnectProfile(),
		getAuthInfo(),
	]);

	const isAuthed = !('error' in authInfo) && !authInfo.isExpired;
	if (!isAuthed) redirect('/');

	const accessToken = authInfo.accessToken;
	const profileId = connectProfile?.id;

	if (!profileId) {
		return (
			<main className='min-h-screen bg-black text-white p-4'>
				<div className='max-w-md mx-auto pt-12 text-center'>
					<p className='text-white/60'>
						Create a profile first to configure your Connect page.
					</p>
					<Link
						href='/settings/account/create'
						className='mt-4 inline-block px-6 py-2 bg-sky-600 rounded-full text-sm font-medium'
					>
						Create Profile
					</Link>
				</div>
			</main>
		);
	}

	const config = await fetchConnectConfig({ profileId, accessToken });

	return (
		<main className='min-h-screen bg-black text-white'>
			<div className='max-w-md mx-auto p-4'>
				<div className='flex items-center gap-3 mb-6'>
					<Link
						href='/settings/account'
						className='p-2 rounded-full hover:bg-white/10 transition'
					>
						<ChevronLeft className='h-5 w-5' />
					</Link>
					<h1 className='text-xl font-bold'>Profile Configuration</h1>
				</div>

				<ConnectConfigClient
					profileId={profileId}
					accessToken={accessToken}
					initialConfig={config}
				/>
			</div>
		</main>
	);
}

import { getAuthInfo } from '@/actions/auth';
import { generateMetadata } from '@/lib/metadata';
import { redirect } from 'next/navigation';
import SubpageHeader from '@/components/shared/subpage-header';
import ManageAccountClient from '@/components/pages/cardholder/manage-account/manage-account-client';

export const metadata = generateMetadata({
	title: 'Manage Account',
	description:
		'Manage your ISCE Connect account. Delete your account and all associated data.',
	keywords: ['account', 'delete', 'manage', 'data'],
});

export default async function ManageAccountPage() {
	const authInfo = await getAuthInfo();
	const isAuthed = !('error' in authInfo) && !authInfo.isExpired;
	if (!isAuthed) redirect('/');

	return (
		<main className='min-h-screen bg-black text-white'>
			<SubpageHeader
				title='Manage Account'
				backHref='/settings'
			/>
			<ManageAccountClient />
		</main>
	);
}

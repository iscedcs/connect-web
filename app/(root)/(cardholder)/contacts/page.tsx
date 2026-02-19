import { getAuthInfo } from '@/actions/auth';
import ContactsClient from '@/components/pages/cardholder/contact/contact-client';
import { fetchReceivedContacts } from '@/lib/services/contact';
import { getConnectProfile } from '@/lib/services/profile';
import { generateMetadata } from '@/lib/metadata';
import SubpageHeader from '@/components/shared/subpage-header';

export const metadata = generateMetadata({
	title: 'Contacts',
	description:
		'View and manage contacts shared with you through your Connect profile.',
	keywords: ['contacts', 'received contacts', 'shared contacts'],
});

export default async function ReceivedContactsPage() {
	const authInfo = await getAuthInfo();

	if ('error' in authInfo || authInfo.isExpired) {
		return <div className='text-white p-6'>Redirecting to login...</div>;
	}

	const accessToken = authInfo.accessToken;
	const profile = await getConnectProfile();

	if (!profile?.id) {
		return (
			<div className='p-6 text-white/60'>
				No profile found for this account
			</div>
		);
	}

	const data = await fetchReceivedContacts({
		profileId: profile.id,
		accessToken,
		page: 1,
		limit: 10,
	});

	return (
		<main className='min-h-screen bg-black text-white'>
			<SubpageHeader
				title='Contacts'
				backHref='/dashboard'
			/>
			<div className='p-6 space-y-4'>
				{data.contacts.length === 0 ?
					<p className='text-white/50'>No contacts received yet</p>
				:	<ContactsClient
						data={data}
						profileId={profile.id}
						accessToken={accessToken}
					/>
				}
			</div>
		</main>
	);
}

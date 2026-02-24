import { getAuthInfo } from '@/actions/auth';
import NewThreadClient from '@/components/cardholder/artisan/threads/new-thread-client';
import { getConnectProfile } from '@/lib/services/profile';
import { redirect } from 'next/navigation';

interface Props {
	searchParams: Promise<{ artisanId?: string; serviceId?: string }>;
}

export default async function NewThreadPage({ searchParams }: Props) {
	const { artisanId, serviceId } = await searchParams;

	if (!artisanId) redirect('/connect/artisan/directory');

	const auth = await getAuthInfo();
	if ('error' in auth || auth.isExpired) redirect('/');

	const connectProfile = await getConnectProfile();
	if (!connectProfile?.id) redirect('/dashboard');

	return (
		<div className='px-4 py-6'>
			<NewThreadClient
				artisanId={artisanId}
				serviceId={serviceId}
				accessToken={auth.accessToken}
				profileId={connectProfile.id}
				userName={`${connectProfile.name || ''}`.trim()}
			/>
		</div>
	);
}

import { getAuthInfo } from '@/actions/auth';
import { getConnectProfile } from '@/lib/services/profile';
import { redirect } from 'next/navigation';
import { getThread, getMyArtisanProfile } from '@/lib/services/artisan';
import ThreadConversationClient from '@/components/cardholder/artisan/threads/thread-conversation-client';

interface Props {
	params: Promise<{ threadId: string }>;
}

export default async function ThreadConversationPage({ params }: Props) {
	const { threadId } = await params;

	const auth = await getAuthInfo();
	if ('error' in auth || auth.isExpired) redirect('/');

	const connectProfile = await getConnectProfile();
	if (!connectProfile?.id) redirect('/dashboard');

	const [thread, artisan] = await Promise.all([
		getThread(threadId),
		getMyArtisanProfile(connectProfile.id),
	]);

	if (!thread) redirect('/connect/artisan/threads');

	return (
		<ThreadConversationClient
			thread={thread}
			currentUserId={auth.user.id!}
			accessToken={auth.accessToken}
			profileId={connectProfile.id}
			isArtisan={!!artisan}
		/>
	);
}

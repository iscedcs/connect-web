import { getAuthInfo } from '@/actions/auth';
import { generateMetadata } from '@/lib/metadata';
import { redirect } from 'next/navigation';
import SubpageHeader from '@/components/shared/subpage-header';
import SubscriptionClient from '@/components/pages/cardholder/subscription/subscription-client';
import {
	getMyLimits,
	getMySubscription,
	getPlans,
} from '@/lib/services/subscription';

export const dynamic = 'force-dynamic';

export const metadata = generateMetadata({
	title: 'Subscription',
	description:
		'View your Connect plan, compare plans, and manage your subscription.',
	keywords: ['subscription', 'plan', 'billing', 'upgrade', 'pro'],
});

export default async function SubscriptionPage() {
	const auth = await getAuthInfo();

	if ('error' in auth || auth.isExpired) {
		redirect('/');
	}

	const { accessToken } = auth;

	// Each of these resolves to null/[] on failure rather than throwing, so a
	// single unavailable endpoint degrades that section instead of the page.
	const [subscription, plans, limits] = await Promise.all([
		getMySubscription(accessToken),
		getPlans(accessToken),
		getMyLimits(accessToken),
	]);

	return (
		<main className='min-h-screen bg-black text-white'>
			<SubpageHeader
				title='Subscription'
				backHref='/settings'
			/>
			<SubscriptionClient
				subscription={subscription}
				plans={plans}
				limits={limits}
			/>
		</main>
	);
}

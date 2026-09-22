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
import { getWalletStatus } from '@/lib/services/wallet';

export const dynamic = 'force-dynamic';

export const metadata = generateMetadata({
	title: 'Subscription',
	description:
		'View your LYNCON plan, compare plans, and manage your subscription.',
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
	const [subscription, plans, limits, walletStatus] = await Promise.all([
		getMySubscription(accessToken),
		getPlans(accessToken),
		getMyLimits(accessToken),
		getWalletStatus(accessToken),
	]);
	// No wallet (or it couldn't be loaded): only card payments are offered.
	const wallet = walletStatus?.hasWallet
		? {
				hasPin: walletStatus.hasPin,
				balanceKobo: Math.round((walletStatus.balance ?? 0) * 100),
			}
		: null;

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
				wallet={wallet}
			/>
		</main>
	);
}

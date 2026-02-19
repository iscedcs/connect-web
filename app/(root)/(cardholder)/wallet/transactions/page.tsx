import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getWalletStatus, getTransactions } from '@/lib/services/wallet';
import AllTransactionsClient from '@/components/cardholder/wallet/all-transactions-client';

export const metadata = {
	title: 'All Transactions — ISCE Wallet',
};

export default async function AllTransactionsPage({
	searchParams,
}: {
	searchParams: Promise<{ page?: string }>;
}) {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get('accessToken')?.value;

	if (!accessToken) {
		redirect('/auth/login?redirect=/wallet/transactions');
	}

	const walletStatus = await getWalletStatus(accessToken);

	if (
		!walletStatus ||
		!walletStatus.hasWallet ||
		walletStatus.kycStatus !== 'BVN_VERIFIED'
	) {
		redirect('/bvn');
	}

	const params = await searchParams;
	const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
	const perPage = 20;

	const txData =
		walletStatus.walletId ?
			await getTransactions(accessToken, walletStatus.walletId, {
				page,
				perPage,
			})
		:	null;

	return (
		<AllTransactionsClient
			transactions={txData?.transactions ?? []}
			pagination={
				txData?.pagination ?? {
					page: 1,
					perPage,
					total: 0,
					pages: 0,
				}
			}
		/>
	);
}

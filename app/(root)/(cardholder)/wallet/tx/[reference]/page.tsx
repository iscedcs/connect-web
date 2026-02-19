import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import {
	getWalletStatus,
	getTransactionByReference,
} from '@/lib/services/wallet';
import TransactionDetailClient from '@/components/cardholder/wallet/transaction-detail-client';

export const metadata = {
	title: 'Transaction Details — ISCE Wallet',
};

export default async function TransactionDetailPage({
	params,
}: {
	params: Promise<{ reference: string }>;
}) {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get('accessToken')?.value;

	if (!accessToken) {
		redirect('/auth/login?redirect=/wallet');
	}

	const walletStatus = await getWalletStatus(accessToken);

	if (
		!walletStatus ||
		!walletStatus.hasWallet ||
		walletStatus.kycStatus !== 'BVN_VERIFIED' ||
		!walletStatus.walletId
	) {
		redirect('/bvn');
	}

	const { reference } = await params;

	const transaction = await getTransactionByReference(
		accessToken,
		walletStatus.walletId,
		reference,
	);

	if (!transaction) {
		notFound();
	}

	return <TransactionDetailClient transaction={transaction} />;
}

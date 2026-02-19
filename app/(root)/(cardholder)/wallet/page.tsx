import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
	getWalletStatus,
	getTransactions,
	type WalletTransaction,
} from '@/lib/services/wallet';
import WalletHistoryList, {
	type WalletTxn,
} from '@/components/cardholder/wallet/wallet-history-list';
import WalletEmptyState from '@/components/cardholder/wallet/empty-wallet-state';

/** Format a Decimal string as ₦X,XXX.XX */
function formatNaira(value: number | string | null): string {
	const num = typeof value === 'string' ? parseFloat(value) : (value ?? 0);
	return `₦${num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Map wallet-nest transaction to the presentational WalletTxn shape */
function toWalletTxn(tx: WalletTransaction): WalletTxn {
	const date = new Date(tx.createdAt);
	const amount = parseFloat(tx.amount);
	const prefix = tx.flow === 'CREDIT' ? '+' : '-';

	return {
		id: tx.id,
		title: tx.description || tx.type.replace(/_/g, ' '),
		date: date.toLocaleDateString('en-NG', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		}),
		time: date.toLocaleTimeString('en-NG', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true,
		}),
		amount: `${prefix}${formatNaira(amount)}`,
		iconSrc: '/assets/Vector.svg',
		href: `/wallet/tx/${tx.reference}`,
	};
}

export default async function WalletPage() {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get('accessToken')?.value;

	if (!accessToken) {
		redirect('/auth/login?redirect=/wallet');
	}

	const walletStatus = await getWalletStatus(accessToken);

	// Redirect unverified users to BVN activation
	if (
		!walletStatus ||
		!walletStatus.hasWallet ||
		walletStatus.kycStatus !== 'BVN_VERIFIED'
	) {
		redirect('/bvn');
	}

	// Fetch transactions using the wallet ID
	const txData =
		walletStatus.walletId ?
			await getTransactions(accessToken, walletStatus.walletId, {
				perPage: 10,
			})
		:	null;

	const balance = formatNaira(walletStatus.balance);
	const accountNumber = [
		walletStatus.virtualAccountNumber,
		walletStatus.virtualAccountBank,
	]
		.filter(Boolean)
		.join(' - ');

	const transactions = txData?.transactions ?? [];

	if (transactions.length === 0) {
		return (
			<WalletEmptyState
				balance={balance}
				accountNumber={accountNumber || 'No account'}
				accountLabel='Wallet account details'
			/>
		);
	}

	const items: WalletTxn[] = transactions.map(toWalletTxn);

	return (
		<WalletHistoryList
			balance={balance}
			accountNumber={accountNumber || 'No account'}
			accountLabel='Wallet account details'
			items={items}
		/>
	);
}

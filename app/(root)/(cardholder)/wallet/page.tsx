import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
	getWalletStatus,
	getTransactions,
	getAuthUserProfile,
	type WalletTransaction,
} from '@/lib/services/wallet';
import WalletHistoryList, {
	type WalletTxn,
} from '@/components/cardholder/wallet/wallet-history-list';
import WalletEmptyState from '@/components/cardholder/wallet/empty-wallet-state';
import WalletSetupClient from '@/components/cardholder/wallet/wallet-setup-client';

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

	// No wallet or unverified — go to BVN activation
	if (
		!walletStatus ||
		!walletStatus.hasWallet ||
		walletStatus.kycStatus === 'UNVERIFIED' ||
		walletStatus.kycStatus === null
	) {
		redirect('/bvn');
	}

	// BVN submitted but not yet verified — show pending UI
	if (walletStatus.kycStatus === 'BVN_SUBMITTED') {
		return (
			<WalletSetupClient
				initialStep='pending'
				walletId={walletStatus.walletId!}
				hasTag={false}
				hasPin={false}
			/>
		);
	}

	// Rejected — redirect to BVN form for re-submission
	if (walletStatus.kycStatus === 'REJECTED') {
		redirect('/bvn');
	}

	// BVN_VERIFIED — check if tag + PIN are set
	const userProfile = await getAuthUserProfile(accessToken);
	const hasTag = !!userProfile?.username;
	const hasPin = walletStatus.hasPin;

	// If either tag or PIN is missing, show the setup flow
	if (!hasTag || !hasPin) {
		return (
			<WalletSetupClient
				initialStep='setup'
				walletId={walletStatus.walletId!}
				hasTag={hasTag}
				hasPin={hasPin}
			/>
		);
	}

	// Fully set up — render the normal wallet UI
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

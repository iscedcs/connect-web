import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getWalletStatus } from '@/lib/services/wallet';
import WalletEmptyState from '@/components/cardholder/wallet/empty-wallet-state';

export default async function EmptyWalletPage() {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get('accessToken')?.value;

	if (!accessToken) {
		redirect('/auth/login?redirect=/wallet/empty');
	}

	const walletStatus = await getWalletStatus(accessToken);

	if (
		!walletStatus ||
		!walletStatus.hasWallet ||
		walletStatus.kycStatus !== 'BVN_VERIFIED'
	) {
		redirect('/bvn');
	}

	const balance = `₦${(walletStatus.balance ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
	const accountNumber = [
		walletStatus.virtualAccountNumber,
		walletStatus.virtualAccountBank,
	]
		.filter(Boolean)
		.join(' - ');

	return (
		<WalletEmptyState
			balance={balance}
			accountNumber={accountNumber || 'No account'}
			accountLabel='Wallet account details'
		/>
	);
}

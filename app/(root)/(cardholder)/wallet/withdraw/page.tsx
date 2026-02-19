import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getWalletStatus, getMyKycBankAccount } from '@/lib/services/wallet';
import WithdrawClient from '@/components/cardholder/wallet/withdraw-client';

export default async function WithdrawPage() {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get('accessToken')?.value;

	if (!accessToken) {
		redirect('/auth/login?redirect=/wallet/withdraw');
	}

	const [walletStatus, kycAccount] = await Promise.all([
		getWalletStatus(accessToken),
		getMyKycBankAccount(accessToken),
	]);

	// Guard: must have a verified wallet
	if (
		!walletStatus ||
		!walletStatus.hasWallet ||
		walletStatus.kycStatus !== 'BVN_VERIFIED'
	) {
		redirect('/bvn');
	}

	// Guard: must have a KYC bank account linked
	if (!kycAccount) {
		redirect('/bvn');
	}

	const balance =
		walletStatus.balance !== null ? Number(walletStatus.balance) : 0;

	return (
		<WithdrawClient
			kycAccount={{
				...kycAccount,
				accountName: kycAccount.accountName ?? 'Account Holder',
			}}
			walletId={walletStatus.walletId!}
			balance={balance}
		/>
	);
}

/**
 * Wallet service — server-side calls to wallet-nest.
 */

const WALLET_API_URL =
	process.env.WALLET_API_URL || process.env.NEXT_PUBLIC_WALLET_API_URL || '';

/**
 * Check if a user has completed wallet onboarding (KYC level ONE+, active virtual account).
 * Returns false on any network/API error so the button is simply hidden.
 */
export async function checkCanReceiveMoney(userId: string): Promise<boolean> {
	if (!WALLET_API_URL || !userId) return false;

	try {
		const res = await fetch(
			`${WALLET_API_URL}/api/wallets/can-receive/${userId}`,
			{
				next: { revalidate: 300 }, // cache 5 min per profile
			},
		);
		if (!res.ok) return false;
		const json: { success: boolean; data: { canReceive: boolean } } =
			await res.json();
		return json?.data?.canReceive === true;
	} catch {
		return false;
	}
}

/** List the authenticated user’s wallets from wallet-nest. */
export async function getMyWallets(accessToken: string): Promise<any[]> {
	if (!WALLET_API_URL || !accessToken) return [];
	try {
		const res = await fetch(`${WALLET_API_URL}/api/wallets`, {
			headers: { Authorization: `Bearer ${accessToken}` },
			cache: 'no-store',
		});
		if (!res.ok) return [];
		const json = await res.json();
		return json?.data?.wallets ?? [];
	} catch {
		return [];
	}
}

/** Create a default NGN wallet for the authenticated user. */
export async function createDefaultWallet(
	accessToken: string,
): Promise<any | null> {
	if (!WALLET_API_URL || !accessToken) return null;
	try {
		const res = await fetch(`${WALLET_API_URL}/api/wallets`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ currency: 'NGN' }),
		});
		if (!res.ok) return null;
		const json = await res.json();
		return json?.data?.wallet ?? null;
	} catch {
		return null;
	}
}

/** Submit BVN to wallet-nest KYC endpoint. */
export async function submitBvnKyc(
	accessToken: string,
	walletId: string,
	params: {
		bvn: string;
		firstName: string;
		lastName: string;
		email: string;
		phone?: string;
		dob?: string;
	},
): Promise<{ success: boolean; message: string; data?: any }> {
	if (!WALLET_API_URL || !accessToken)
		return { success: false, message: 'Service unavailable' };
	try {
		const res = await fetch(
			`${WALLET_API_URL}/api/wallets/${walletId}/kyc/submit-bvn`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(params),
				cache: 'no-store',
			},
		);
		const json = await res.json();
		return {
			success: res.ok && json?.success,
			message: json?.message ?? (res.ok ? 'BVN submitted' : 'Failed'),
			data: json?.data,
		};
	} catch {
		return { success: false, message: 'Network error. Please try again.' };
	}
}

/** Wallet status info returned by getWalletStatus */
export interface WalletStatusInfo {
	hasWallet: boolean;
	kycStatus:
		| 'UNVERIFIED'
		| 'BVN_SUBMITTED'
		| 'BVN_VERIFIED'
		| 'REJECTED'
		| null;
	virtualAccountNumber: string | null;
	virtualAccountBank: string | null;
	balance: number | null;
	currency: string | null;
}

/**
 * Get the user's NGN wallet status including KYC status and virtual account info.
 * Returns null if no wallet exists or on any error.
 */
export async function getWalletStatus(
	accessToken: string,
): Promise<WalletStatusInfo | null> {
	const wallets = await getMyWallets(accessToken);
	const ngnWallet = wallets.find((w: any) => w.currency === 'NGN');

	if (!ngnWallet) {
		return {
			hasWallet: false,
			kycStatus: null,
			virtualAccountNumber: null,
			virtualAccountBank: null,
			balance: null,
			currency: null,
		};
	}

	return {
		hasWallet: true,
		kycStatus: ngnWallet.kycStatus ?? 'UNVERIFIED',
		virtualAccountNumber: ngnWallet.virtualAccountNumber ?? null,
		virtualAccountBank: ngnWallet.virtualAccountBank ?? null,
		balance: ngnWallet.balance ? parseFloat(ngnWallet.balance) : 0,
		currency: ngnWallet.currency ?? 'NGN',
	};
}

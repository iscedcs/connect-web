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

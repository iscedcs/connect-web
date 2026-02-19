/**
 * Wallet service — server-side calls to wallet-nest and isce-auth.
 */

const WALLET_API_URL =
	process.env.WALLET_API_URL || process.env.NEXT_PUBLIC_WALLET_API_URL || '';

const AUTH_API_URL = process.env.AUTH_API_URL || '';

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

/** List Nigerian banks from wallet-nest (Paystack). */
export async function listBanks(): Promise<
	{ name: string; code: string; slug: string }[]
> {
	if (!WALLET_API_URL) return [];
	try {
		const res = await fetch(`${WALLET_API_URL}/api/wallets/banks`, {
			next: { revalidate: 3600 }, // cache 1 hour — bank list rarely changes
		});
		if (!res.ok) return [];
		const json = await res.json();
		return json?.data ?? [];
	} catch {
		return [];
	}
}

/** Resolve a bank account number to the account holder name. */
export async function resolveAccountNumber(
	accessToken: string,
	accountNumber: string,
	bankCode: string,
): Promise<{ accountName: string; accountNumber: string } | null> {
	if (!WALLET_API_URL || !accessToken) return null;
	try {
		const params = new URLSearchParams({
			account_number: accountNumber,
			bank_code: bankCode,
		});
		const res = await fetch(
			`${WALLET_API_URL}/api/wallets/resolve-account?${params}`,
			{
				headers: { Authorization: `Bearer ${accessToken}` },
				cache: 'no-store',
			},
		);
		if (!res.ok) return null;
		const json = await res.json();
		return json?.data ?? null;
	} catch {
		return null;
	}
}

/** Submit BVN + bank account to wallet-nest KYC endpoint. */
export async function submitBvnKyc(
	accessToken: string,
	walletId: string,
	params: {
		bvn: string;
		accountNumber: string;
		bankCode: string;
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

/**
 * Poll wallet-nest to recheck KYC status from Paystack.
 * If verification completed, the backend upgrades the wallet + creates DVA.
 */
export async function recheckKycStatus(accessToken: string): Promise<{
	success: boolean;
	data?: {
		kycStatus: string;
		kycLevel?: string;
		virtualAccountNumber?: string | null;
		virtualAccountBank?: string | null;
	};
}> {
	if (!WALLET_API_URL || !accessToken) return { success: false };
	try {
		const res = await fetch(`${WALLET_API_URL}/api/wallets/kyc-status`, {
			headers: { Authorization: `Bearer ${accessToken}` },
			cache: 'no-store',
		});
		if (!res.ok) return { success: false };
		const json = await res.json();
		return json;
	} catch {
		return { success: false };
	}
}

/** Wallet status info returned by getWalletStatus */
export interface WalletStatusInfo {
	hasWallet: boolean;
	walletId: string | null;
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
			walletId: null,
			kycStatus: null,
			virtualAccountNumber: null,
			virtualAccountBank: null,
			balance: null,
			currency: null,
		};
	}

	return {
		hasWallet: true,
		walletId: ngnWallet.id ?? null,
		kycStatus: ngnWallet.kycStatus ?? 'UNVERIFIED',
		virtualAccountNumber: ngnWallet.virtualAccountNumber ?? null,
		virtualAccountBank: ngnWallet.virtualAccountBank ?? null,
		balance: ngnWallet.balance ? parseFloat(ngnWallet.balance) : 0,
		currency: ngnWallet.currency ?? 'NGN',
	};
}

/** Transaction record from wallet-nest */
export interface WalletTransaction {
	id: string;
	reference: string;
	type: string;
	flow: 'CREDIT' | 'DEBIT';
	amount: string;
	fee: string;
	balanceBefore: string;
	balanceAfter: string;
	status: string;
	description: string | null;
	sourceModule: string;
	sourceReference: string | null;
	createdAt: string;
	updatedAt: string;
}

/** Fetch paginated transactions for a wallet from wallet-nest. */
export async function getTransactions(
	accessToken: string,
	walletId: string,
	query?: { page?: number; perPage?: number },
): Promise<{
	transactions: WalletTransaction[];
	pagination: { page: number; perPage: number; total: number; pages: number };
} | null> {
	if (!WALLET_API_URL || !accessToken || !walletId) return null;
	try {
		const params = new URLSearchParams();
		if (query?.page) params.set('page', String(query.page));
		if (query?.perPage) params.set('perPage', String(query.perPage));

		const qs = params.toString();
		const url = `${WALLET_API_URL}/api/wallets/${walletId}/transactions${qs ? `?${qs}` : ''}`;

		const res = await fetch(url, {
			headers: { Authorization: `Bearer ${accessToken}` },
			cache: 'no-store',
		});
		if (!res.ok) return null;
		const json = await res.json();
		return json?.data ?? null;
	} catch {
		return null;
	}
}

// ─── Recipient lookup ───────────────────────────────────────────────

/** Recipient info returned by the lookup functions */
export interface RecipientInfo {
	userId: string;
	firstName: string;
	lastName: string;
	displayPicture: string | null;
	isceTag: string | null;
}

/**
 * Look up a user by their ISCE Tag (username).
 * Calls isce-auth's public `GET /user/tag/:tag` endpoint.
 */
export async function lookupByTag(tag: string): Promise<RecipientInfo | null> {
	if (!AUTH_API_URL || !tag) return null;
	try {
		const normalized = tag.startsWith('@') ? tag.slice(1) : tag;
		const res = await fetch(
			`${AUTH_API_URL}/user/tag/${encodeURIComponent(normalized)}`,
			{
				cache: 'no-store',
			},
		);
		if (!res.ok) return null;
		const json = await res.json();
		if (!json?.success || !json?.data) return null;
		return {
			userId: json.data.id,
			firstName: json.data.firstName,
			lastName: json.data.lastName,
			displayPicture: json.data.displayPicture ?? null,
			isceTag: json.data.isceTag ?? null,
		};
	} catch {
		return null;
	}
}

/**
 * Look up a wallet owner by their DVA (dedicated virtual account) number.
 * Calls wallet-nest's public `GET /api/wallets/lookup-dva/:accountNumber` then
 * resolves the userId to user details via isce-auth.
 */
export async function lookupByDva(
	accountNumber: string,
	accessToken?: string,
): Promise<(RecipientInfo & { accountName: string | null }) | null> {
	if (!WALLET_API_URL || !accountNumber) return null;
	try {
		const res = await fetch(
			`${WALLET_API_URL}/api/wallets/lookup-dva/${encodeURIComponent(accountNumber)}`,
			{ cache: 'no-store' },
		);
		if (!res.ok) return null;
		const json = await res.json();
		if (!json?.success || !json?.data?.userId) return null;

		// Resolve user details from isce-auth
		const userRes = await fetch(
			`${AUTH_API_URL}/user/one/${json.data.userId}`,
			{
				cache: 'no-store',
				headers:
					accessToken ?
						{ Authorization: `Bearer ${accessToken}` }
					:	{},
			},
		);
		let firstName = json.data.accountName?.split(' ')[0] ?? 'Unknown';
		let lastName =
			json.data.accountName?.split(' ').slice(1).join(' ') ?? '';
		let displayPicture: string | null = null;
		let isceTag: string | null = null;

		if (userRes.ok) {
			const userJson = await userRes.json();
			if (userJson?.success && userJson?.data) {
				firstName = userJson.data.firstName ?? firstName;
				lastName = userJson.data.lastName ?? lastName;
				displayPicture = userJson.data.displayPicture ?? null;
				isceTag =
					userJson.data.username ?
						`@${userJson.data.username}`
					:	null;
			}
		}

		return {
			userId: json.data.userId,
			firstName,
			lastName,
			displayPicture,
			isceTag,
			accountName: json.data.accountName ?? null,
		};
	} catch {
		return null;
	}
}

// ─── Transfers ──────────────────────────────────────────────────────

export interface TransferResult {
	success: boolean;
	message: string;
	data?: {
		transfer: {
			id: string;
			reference: string;
			amount: string;
			status: string;
		};
	};
}

/**
 * Send money to another ISCE user by their userId.
 * Calls wallet-nest's `POST /api/wallets/:walletId/transfers/to-user`.
 */
export async function transferToUser(
	accessToken: string,
	walletId: string,
	params: {
		receiverUserId: string;
		amount: number;
		pin: string;
		description?: string;
	},
): Promise<TransferResult> {
	if (!WALLET_API_URL || !accessToken)
		return { success: false, message: 'Service unavailable' };
	try {
		const res = await fetch(
			`${WALLET_API_URL}/api/wallets/${walletId}/transfers/to-user`,
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
			message:
				json?.message ??
				(res.ok ? 'Transfer completed' : 'Transfer failed'),
			data: json?.data,
		};
	} catch {
		return { success: false, message: 'Network error. Please try again.' };
	}
}

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

/** Public wallet profile returned for the "Send money" modal on a public Connect profile */
export interface PublicWalletProfile {
	canReceive: boolean;
	accountNumber: string | null;
	bankName: string | null;
	accountName: string | null;
	txLimit: number | null;
	isceTag: string | null;
}

/**
 * Fetch the public wallet profile for a user — used on the Connect public profile page.
 * Combines the virtual account details from wallet-nest with the ISCE tag from isce-auth.
 * Returns null on any error so the send-money button is simply hidden.
 */
export async function getPublicWalletProfile(
	userId: string,
): Promise<PublicWalletProfile | null> {
	if (!WALLET_API_URL || !userId) return null;

	try {
		const [walletRes, userRes] = await Promise.allSettled([
			fetch(`${WALLET_API_URL}/api/wallets/public-account/${userId}`, {
				next: { revalidate: 300 },
			}),
			AUTH_API_URL ?
				fetch(`${AUTH_API_URL}/user/one/${userId}`, {
					next: { revalidate: 300 },
				})
			:	Promise.resolve(null),
		]);

		const walletFetch =
			walletRes.status === 'fulfilled' ? walletRes.value : null;
		if (!walletFetch?.ok) return null;

		const walletJson = await walletFetch.json();
		if (!walletJson?.success || !walletJson?.data?.canReceive) return null;

		let isceTag: string | null = null;
		if (userRes.status === 'fulfilled' && userRes.value) {
			try {
				const userFetch = userRes.value as Response;
				if (userFetch.ok) {
					const userJson = await userFetch.json();
					const username =
						userJson?.data?.username ?? userJson?.username ?? null;
					isceTag = username ? `@${username}` : null;
				}
			} catch {
				// non-fatal — ISCE tag simply won't be shown
			}
		}

		return {
			canReceive: true,
			accountNumber: walletJson.data.accountNumber ?? null,
			bankName: walletJson.data.bankName ?? null,
			accountName: walletJson.data.accountName ?? null,
			txLimit: walletJson.data.txLimit ?? null,
			isceTag,
		};
	} catch {
		return null;
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
 * Retry KYC with corrected/new information.
 * Calls wallet-nest's POST /wallets/:id/kyc/retry.
 * Only allowed when kycStatus is REJECTED or UNVERIFIED.
 */
export async function retryBvnKyc(
	accessToken: string,
	walletId: string,
	params: {
		bvn: string;
		accountNumber: string;
		bankCode: string;
		firstName?: string;
		lastName?: string;
	},
): Promise<{ success: boolean; message: string; data?: any }> {
	if (!WALLET_API_URL || !accessToken)
		return { success: false, message: 'Service unavailable' };
	try {
		const res = await fetch(
			`${WALLET_API_URL}/api/wallets/${walletId}/kyc/retry`,
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
			message: json?.message ?? (res.ok ? 'BVN re-submitted' : 'Failed'),
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
	hasPin: boolean;
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
			hasPin: false,
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
		hasPin: !!ngnWallet.hasPin,
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

/** Full transaction detail from wallet-nest (single transaction endpoint) */
export interface WalletTransactionDetail extends WalletTransaction {
	balanceBefore: string;
	balanceAfter: string;
	sourceModule: string;
	sourceReference: string | null;
	updatedAt: string;
	metadata: Record<string, any> | null;
}

/** Fetch a single transaction by reference from wallet-nest. */
export async function getTransactionByReference(
	accessToken: string,
	walletId: string,
	reference: string,
): Promise<WalletTransactionDetail | null> {
	if (!WALLET_API_URL || !accessToken || !walletId || !reference) return null;
	try {
		const url = `${WALLET_API_URL}/api/wallets/${walletId}/transactions/${encodeURIComponent(reference)}`;
		const res = await fetch(url, {
			headers: { Authorization: `Bearer ${accessToken}` },
			cache: 'no-store',
		});
		if (!res.ok) return null;
		const json = await res.json();
		return json?.data?.transaction ?? null;
	} catch {
		return null;
	}
}

// ─── Recipient lookup (continued) ──────────────────────────────────

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

/**
 * Get the authenticated user's KYC verification bank account
 * (the account submitted during BVN verification — the only withdrawal destination).
 */
export async function getMyKycBankAccount(accessToken: string): Promise<{
	accountNumber: string;
	bankCode: string;
	accountName: string | null;
} | null> {
	if (!WALLET_API_URL || !accessToken) return null;
	try {
		const res = await fetch(`${WALLET_API_URL}/api/wallets/kyc-account`, {
			headers: { Authorization: `Bearer ${accessToken}` },
			cache: 'no-store',
		});
		if (!res.ok) return null;
		const json = await res.json();
		if (!json?.success || !json?.data) return null;
		return json.data;
	} catch {
		return null;
	}
}

/**
 * Withdraw to the KYC-verified bank account.
 * Calls wallet-nest POST /api/wallets/:walletId/transactions/withdraw-to-kyc
 */
export async function withdrawToKycAccount(
	accessToken: string,
	walletId: string,
	params: { amount: number; pin: string; description?: string },
): Promise<{ success: boolean; message: string; data?: any }> {
	if (!WALLET_API_URL || !accessToken)
		return { success: false, message: 'Service unavailable' };
	try {
		const res = await fetch(
			`${WALLET_API_URL}/api/wallets/${walletId}/transactions/withdraw-to-kyc`,
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
				(res.ok ? 'Withdrawal initiated' : 'Withdrawal failed'),
			data: json?.data,
		};
	} catch {
		return { success: false, message: 'Network error. Please try again.' };
	}
}

// ─── PIN Management ─────────────────────────────────────────────────

/** Set an initial wallet PIN. */
export async function setWalletPin(
	accessToken: string,
	walletId: string,
	pin: string,
): Promise<{ success: boolean; message: string }> {
	if (!WALLET_API_URL || !accessToken)
		return { success: false, message: 'Service unavailable' };
	try {
		const res = await fetch(
			`${WALLET_API_URL}/api/wallets/${walletId}/set-pin`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ pin }),
				cache: 'no-store',
			},
		);
		const json = await res.json();
		return {
			success: res.ok && json?.success,
			message:
				json?.message ?? (res.ok ? 'PIN set' : 'Failed to set PIN'),
		};
	} catch {
		return { success: false, message: 'Network error. Please try again.' };
	}
}

// ─── Payment Methods ────────────────────────────────────────────────

/** Add a payment method (bank account) to a wallet. */
export async function addPaymentMethod(
	accessToken: string,
	walletId: string,
	data: {
		type: 'BANK_ACCOUNT' | 'CARD' | 'DEDICATED_ACCOUNT';
		accountNumber?: string;
		accountName?: string;
		bankName?: string;
		bankCode?: string;
		label?: string;
	},
): Promise<{ success: boolean; message: string }> {
	if (!WALLET_API_URL || !accessToken)
		return { success: false, message: 'Service unavailable' };
	try {
		const res = await fetch(
			`${WALLET_API_URL}/api/wallets/${walletId}/payment-methods`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
				cache: 'no-store',
			},
		);
		const json = await res.json();
		return {
			success: res.ok && json?.success,
			message:
				json?.message ??
				(res.ok ?
					'Payment method added'
				:	'Failed to add payment method'),
		};
	} catch {
		return { success: false, message: 'Network error. Please try again.' };
	}
}

// ─── User Tag (isce-auth) ───────────────────────────────────────────

/**
 * Get the current user's profile from isce-auth (includes username/tag).
 */
export async function getAuthUserProfile(
	accessToken: string,
): Promise<{ username: string | null } | null> {
	if (!AUTH_API_URL || !accessToken) return null;
	try {
		const res = await fetch(`${AUTH_API_URL}/user/me`, {
			headers: { Authorization: `Bearer ${accessToken}` },
			cache: 'no-store',
		});
		if (!res.ok) return null;
		const json = await res.json();
		const user = json?.data ?? json;
		return { username: user?.username ?? null };
	} catch {
		return null;
	}
}

/**
 * Set or update the authenticated user's tag (username) via isce-auth.
 */
export async function setUserTag(
	accessToken: string,
	username: string,
): Promise<{ success: boolean; message: string }> {
	if (!AUTH_API_URL || !accessToken)
		return { success: false, message: 'Service unavailable' };
	try {
		const res = await fetch(`${AUTH_API_URL}/user`, {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ username }),
			cache: 'no-store',
		});
		const json = await res.json();
		return {
			success: res.ok,
			message:
				json?.message ??
				(res.ok ? 'Tag set successfully' : 'Failed to set tag'),
		};
	} catch {
		return { success: false, message: 'Network error. Please try again.' };
	}
}

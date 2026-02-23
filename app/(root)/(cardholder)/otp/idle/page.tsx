import { getAuthInfo } from '@/actions/auth';
import OtpClientSection from '@/components/pages/home/otpclientsection';
import DeviceOwnershipError from '@/components/pages/home/device-ownership-error';
import { BASE_URLS, URLS } from '@/lib/const';

const CONNECT_API = process.env.NEXT_PUBLIC_CONNECT_API_URL;

interface PageProps {
	searchParams: Promise<{
		cardid?: string;
		type?: string;
		payment?: string;
		token_error?: string;
	}>;
}

async function checkDeviceOwnership(productId: string, currentUserId?: string) {
	try {
		const url = `${BASE_URLS.AUTH_API}${URLS.device.product}/${productId}`;
		const res = await fetch(url, {
			method: 'GET',
			headers: { Accept: 'application/json' },
			cache: 'no-store',
		});

		if (!res.ok) {
			// Device not found — not owned, proceed normally
			return null;
		}

		const json = await res.json();
		const device = json?.data;

		if (!device?.userId) {
			// Device exists but not assigned to anyone — proceed normally
			return null;
		}

		if (device.userId === currentUserId) {
			// Device already belongs to current user
			return {
				ownedBySelf: true,
				owner:
					device.user ?
						{
							name: `${device.user.firstName ?? ''} ${device.user.lastName ?? ''}`.trim(),
							email: device.user.email ?? '',
						}
					:	null,
			};
		}

		// Device belongs to another user
		return {
			ownedBySelf: false,
			owner:
				device.user ?
					{
						name: `${device.user.firstName ?? ''} ${device.user.lastName ?? ''}`.trim(),
						email: device.user.email ?? '',
					}
				:	null,
		};
	} catch (error) {
		console.error('[otp/idle] Device ownership check failed:', error);
		// On error, allow the user to proceed (fail open)
		return null;
	}
}

export default async function Page({ searchParams }: PageProps) {
	const authInfo = await getAuthInfo();
	const params = await searchParams;
	const user = authInfo.user;
	const cardId = params.cardid;
	const accessToken =
		'accessToken' in authInfo ? authInfo.accessToken : undefined;

	// Check device ownership before showing OTP/payment flow
	if (cardId && user?.id) {
		const ownership = await checkDeviceOwnership(cardId, user.id);

		if (ownership) {
			if (!ownership.ownedBySelf && ownership.owner) {
				// Device belongs to another user — show error
				return (
					<DeviceOwnershipError
						ownerName={ownership.owner.name}
						ownerEmail={ownership.owner.email}
						deviceProductId={cardId}
					/>
				);
			}

			if (ownership.ownedBySelf) {
				// Device already belongs to current user — show message
				return (
					<DeviceOwnershipError
						ownerName='you'
						ownerEmail=''
						deviceProductId={cardId}
						isSelf
					/>
				);
			}
		}
	}

	// Fetch user's default profile for auto-linking after device creation
	let defaultProfileId: string | undefined;
	if (accessToken) {
		try {
			const res = await fetch(
				`${CONNECT_API}${URLS.multi_profile.get_default}`,
				{
					headers: {
						authorization: `Bearer ${accessToken}`,
						accept: 'application/json',
					},
					cache: 'no-store',
				},
			);
			if (res.ok) {
				const json = await res.json();
				defaultProfileId = json?.data?.id;
			}
			// Fallback: get first profile from all profiles
			if (!defaultProfileId) {
				const allRes = await fetch(
					`${CONNECT_API}${URLS.multi_profile.all}`,
					{
						headers: {
							authorization: `Bearer ${accessToken}`,
							accept: 'application/json',
						},
						cache: 'no-store',
					},
				);
				if (allRes.ok) {
					const allJson = await allRes.json();
					const profiles =
						allJson?.data?.profiles ?? allJson?.data ?? [];
					if (profiles.length > 0) {
						defaultProfileId = profiles[0].id;
					}
				}
			}
		} catch {
			// Non-critical — device will just not be auto-linked
		}
	}

	return (
		<OtpClientSection
			cardId={cardId}
			// deviceType={params.type}
			user={user}
			defaultProfileId={defaultProfileId}
		/>
	);
}

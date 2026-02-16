import { URLS } from '@/lib/const';
import { csrfFetch } from '@/lib/csrf-client';

const CONNECT_API = process.env.NEXT_PUBLIC_CONNECT_API_URL;

export interface DeviceBinding {
	id: string;
	deviceId: string;
	profileId: string;
	linkedAt: string;
	profile?: {
		id: string;
		name: string;
		slug: string | null;
		profilePhoto: string | null;
	};
}

export interface DeviceBindingsResponse {
	profiles: Array<{
		id: string;
		name: string;
		slug: string | null;
		profilePhoto: string | null;
	}>;
	bindings: DeviceBinding[];
}

/**
 * Fetch all device-profile bindings for the authenticated user.
 */
export async function getDeviceBindings(
	accessToken: string,
): Promise<DeviceBindingsResponse | null> {
	try {
		const res = await fetch(
			`${CONNECT_API}${URLS.device_profile.bindings}`,
			{
				headers: {
					accept: 'application/json',
					authorization: `Bearer ${accessToken}`,
				},
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

/**
 * Link a device to a profile.
 */
export async function linkDeviceToProfile(
	profileId: string,
	deviceId: string,
): Promise<{ success: boolean; message: string }> {
	try {
		const url = `${CONNECT_API}${URLS.device_profile.link.replace('{profileId}', profileId)}`;
		const res = await csrfFetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ deviceId }),
		});
		const json = await res.json();
		return {
			success: json?.success ?? false,
			message: json?.message ?? '',
		};
	} catch (err: any) {
		return {
			success: false,
			message: err?.message ?? 'Failed to link device',
		};
	}
}

/**
 * Unlink a device from a profile.
 */
export async function unlinkDeviceFromProfile(
	profileId: string,
	deviceId: string,
): Promise<{ success: boolean; message: string }> {
	try {
		const url = `${CONNECT_API}${URLS.device_profile.unlink
			.replace('{profileId}', profileId)
			.replace('{deviceId}', deviceId)}`;
		const res = await csrfFetch(url, {
			method: 'DELETE',
		});
		const json = await res.json();
		return {
			success: json?.success ?? false,
			message: json?.message ?? '',
		};
	} catch (err: any) {
		return {
			success: false,
			message: err?.message ?? 'Failed to unlink device',
		};
	}
}

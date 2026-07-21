import { BASE_URLS, URLS } from '../const';
import { csrfFetch } from '../csrf-client';

type BaseRes<T = any> = { ok: boolean; status: number; data: T };

const baseInit: RequestInit = {
	cache: 'no-store',
};

export async function verifyDeviceToken(params: {
	token: string;
	userId: string;
	init?: RequestInit;
}) {
	const res = await csrfFetch('/api/device/verify-token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ token: params.token, userId: params.userId }),
		...baseInit,
		...(params.init ?? {}),
	});
	const data = await res.json().catch(() => ({}));
	return { ok: res.ok, status: res.status, data };
}

export async function createDevice(params: {
	token: string;
	productId: string;
	init?: RequestInit;
}) {
	const res = await csrfFetch('/api/device/create', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			token: params.token,
			productId: params.productId,
		}),
		...baseInit,
		...(params.init ?? {}),
	});
	const data = await res.json().catch(() => ({}));
	return { ok: res.ok, status: res.status, data };
}

/**
 * Initialize a Paystack payment to purchase a device code.
 * Server-side route will redirect to Paystack checkout.
 */
export async function initDevicePayment(params: {
	productId: string;
	email?: string;
}) {
	const res = await csrfFetch('/api/device/payment/init', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			productId: params.productId,
			email: params.email,
		}),
		...baseInit,
	});
	const data = await res.json().catch(() => ({}));
	return { ok: res.ok, status: res.status, data };
}

export async function removeDevice(deviceId: string, accessToken: string) {
	const res = await csrfFetch('/api/device/remove', {
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ id: deviceId, accessToken }),
		...baseInit,
	});
	const data = await res.json().catch(() => ({}));
	return { ok: res.ok, status: res.status, data };
}

export async function getUserDevices(userId: string, accessToken: string) {
	try {
		const res = await fetch(
			`${BASE_URLS.AUTH_API}${URLS.device.user.replace('{userId}', userId)}`,
			{
				headers: {
					accept: 'application/json',
					authorization: `Bearer ${accessToken}`,
				},
				cache: 'no-store',
			},
		);

		if (!res.ok) {
			console.error(`[getUserDevices] non-OK status: ${res.status}`);
			return [];
		}

		const json = await res.json();
		return json?.data ?? json ?? [];
	} catch (error) {
		console.error('[getUserDevices] fetch error:', error);
		return [];
	}
}

import { URLS } from '@/lib/const';
import { http } from './http';
import { generatePassword } from '../utils';

const CONNECT_API = process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL;
const AUTH_API = process.env.NEXT_PUBLIC_LIVE_ISCEAUTH_BACKEND_URL;

export async function saveContactFlow({
	profileId,
	firstName,
	lastName,
	email,
	phone,
	note,
}: {
	profileId: string;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	note?: string;
}) {
	try {
		await http.post(`${CONNECT_API}${URLS.contact.leave}`, {
			profileId,
			firstName,
			lastName,
			email,
			phone,
			note,
		});

		const password = generatePassword();

		await http.post(`${AUTH_API}${URLS.auth.quick_register}`, {
			firstName,
			lastName,
			email,
			phone,
			password,
		});

		return {
			success: true,
			password,
		};
	} catch (err: any) {
		return {
			success: false,
			error: err?.message || 'Something went wrong',
		};
	}
}

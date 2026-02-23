import { URLS } from '@/lib/const';
import { http } from './http';
import { generatePassword } from '../utils';

const CONNECT_API =
	process.env.CONNECT_API_URL || process.env.NEXT_PUBLIC_CONNECT_API_URL;
const AUTH_API =
	process.env.AUTH_API_URL || process.env.NEXT_PUBLIC_AUTH_API_URL;

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
		// 1. Leave the contact on the profile
		await http.post(`${CONNECT_API}${URLS.contact.leave}`, {
			profileId,
			firstName,
			lastName,
			email,
			phone,
			note,
		});

		// 2. Try to register the person — ignore if they already exist
		let password: string | undefined;
		try {
			password = generatePassword();
			await http.post(`${AUTH_API}${URLS.auth.quick_register}`, {
				firstName,
				lastName,
				email,
				phone,
				password,
			});
		} catch {
			// User already exists — that's fine, contact was still saved
			password = undefined;
		}

		return {
			success: true,
			...(password ? { password } : {}),
		};
	} catch (err: any) {
		return {
			success: false,
			error: err?.message || 'Something went wrong',
		};
	}
}

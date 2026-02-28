import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const AUTH_API =
	process.env.AUTH_API_URL || process.env.NEXT_PUBLIC_AUTH_API_URL;

export async function PATCH() {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get('accessToken')?.value;

	if (!accessToken) {
		return NextResponse.json(
			{ error: 'Not authenticated' },
			{ status: 401 },
		);
	}

	try {
		const res = await fetch(`${AUTH_API}/user/delete-my-account`, {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
		});

		if (!res.ok) {
			const data = await res.json().catch(() => ({}));
			return NextResponse.json(
				{ error: data.message || 'Failed to delete account' },
				{ status: res.status },
			);
		}

		const data = await res.json();

		// Clear auth cookies after successful deletion
		const response = NextResponse.json({
			success: true,
			message: 'Account deleted successfully',
			data: data.data,
		});

		const cookieOpts = {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax' as const,
			path: '/',
			maxAge: 0,
		};

		response.cookies.set('accessToken', '', cookieOpts);
		response.cookies.set('refreshToken', '', cookieOpts);

		return response;
	} catch {
		return NextResponse.json(
			{ error: 'Failed to delete account' },
			{ status: 500 },
		);
	}
}

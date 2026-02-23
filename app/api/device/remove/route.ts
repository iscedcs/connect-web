import { URLS } from '@/lib/const';
import { NextResponse } from 'next/server';

export async function DELETE(req: Request) {
	try {
		const body = await req.json();
		const { id, accessToken } = body;

		if (!id || !accessToken)
			return NextResponse.json(
				{ message: 'Missing id or token' },
				{ status: 400 },
			);

		const BASE_URL = process.env.NEXT_PUBLIC_AUTH_API_URL;
		const target = `${BASE_URL}${URLS.device.remove.replace('{id}', id)}`;

		const res = await fetch(target, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
		});

		let text = await res.text();

		let json: any;
		try {
			json = JSON.parse(text);
		} catch {
			json = { message: text };
		}

		return NextResponse.json(json, { status: res.status });
	} catch (error) {
		console.error('❌ Device remove error:', error);
		return NextResponse.json(
			{ message: 'Internal server error' },
			{ status: 500 },
		);
	}
}

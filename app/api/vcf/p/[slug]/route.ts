import { BASE_URLS, URLS } from '@/lib/const';
import { NextRequest } from 'next/server';

function buildVCard(data: any, slug: string): string {
	const profile = data?.profile ?? {};
	const contact = data?.contact?.primary ?? {};
	const fullName = (profile?.name as string | undefined) ?? 'Connect User';
	const email = (contact?.email as string | undefined) ?? '';
	const phone = (contact?.phone_number as string | undefined) ?? '';
	const title = (profile?.position as string | undefined) ?? '';
	const appUrl = process.env.NEXT_PUBLIC_URL ?? '';
	const profileUrl = `${appUrl}/p/${slug}`;

	const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${fullName}`];
	if (title) lines.push(`TITLE:${title}`);
	if (email) lines.push(`EMAIL;TYPE=INTERNET:${email}`);
	if (phone) lines.push(`TEL;TYPE=CELL:${phone}`);
	lines.push(`URL:${profileUrl}`);
	lines.push('END:VCARD');
	return lines.join('\r\n');
}

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> },
) {
	const { slug } = await params;

	const base = BASE_URLS.CONNECT_API;
	if (!base) {
		return new Response('API not configured', { status: 503 });
	}

	const url = `${base}${URLS.profile.public_by_slug.replace('{slug}', slug)}`;

	let data: any = null;
	try {
		const res = await fetch(url, {
			headers: { Accept: 'application/json' },
			cache: 'no-store',
		});
		if (!res.ok) {
			return new Response('Profile not found', { status: 404 });
		}
		const json = await res.json();
		data = json?.data ?? null;
	} catch {
		return new Response('Failed to fetch profile', { status: 502 });
	}

	if (!data) {
		return new Response('Profile not found', { status: 404 });
	}

	const vcf = buildVCard(data, slug);
	const safeName =
		((data?.profile?.name as string | undefined) ?? 'contact')
			.replace(/[^a-zA-Z0-9-_ ]/g, '')
			.trim()
			.replace(/\s+/g, '-') || 'contact';

	return new Response(vcf, {
		status: 200,
		headers: {
			'Content-Type': 'text/vcard; charset=utf-8',
			'Content-Disposition': `attachment; filename="${safeName}.vcf"`,
			'Cache-Control': 'no-store',
		},
	});
}

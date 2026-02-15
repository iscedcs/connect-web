import { http } from '@/lib/services/http';
import { URLS } from '@/lib/const';

const BASE =
	process.env.CONNECT_API_URL || process.env.NEXT_PUBLIC_CONNECT_API_URL;

export async function fetchPublicForm({
	profileId,
	formId,
}: {
	profileId: string;
	formId: string;
}) {
	const res = await http.get(
		`${BASE}${URLS.forms.public_form
			.replace('{profileId}', profileId)
			.replace('{id}', formId)}`,
	);

	return res.data.data;
}

export async function submitPublicForm({
	profileId,
	formId,
	responses,
}: {
	profileId: string;
	formId: string;
	responses: Record<string, any>;
}) {
	const res = await http.post(
		`${BASE}${URLS.forms.submit_one
			.replace('{profileId}', profileId)
			.replace('{id}', formId)}`,
		{ responses },
	);

	return res.data;
}

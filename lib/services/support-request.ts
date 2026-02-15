import { http } from '@/lib/services/http';
import { URLS } from '@/lib/const';

const BASE =
	process.env.CONNECT_API_URL || process.env.NEXT_PUBLIC_CONNECT_API_URL;

export interface SupportRequest {
	id: string;
	userId: string;
	subject: string;
	message: string;
	createdAt: string;
	updatedAt: string;
}

export interface SupportRequestStats {
	totalRequests: number;
	todayRequests: number;
	thisWeekRequests: number;
	thisMonthRequests: number;
}

export interface PaginatedSupportRequests {
	supportRequests: SupportRequest[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		pages: number;
	};
}

export async function submitSupportRequest({
	accessToken,
	subject,
	message,
}: {
	accessToken: string;
	subject: string;
	message: string;
}): Promise<SupportRequest> {
	const res = await http.post(
		`${BASE}${URLS.support.submit}`,
		{ subject, message },
		{ headers: { Authorization: `Bearer ${accessToken}` } },
	);
	return res.data?.data?.supportRequest;
}

export async function fetchSupportRequests({
	accessToken,
	page = 1,
	limit = 10,
}: {
	accessToken: string;
	page?: number;
	limit?: number;
}): Promise<PaginatedSupportRequests> {
	const res = await http.get(`${BASE}${URLS.support.all}`, {
		params: { page, limit },
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	return res.data?.data;
}

export async function fetchSupportRequest({
	accessToken,
	id,
}: {
	accessToken: string;
	id: string;
}): Promise<SupportRequest> {
	const url = URLS.support.one.replace('{id}', id);
	const res = await http.get(`${BASE}${url}`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	return res.data?.data?.supportRequest;
}

export async function updateSupportRequest({
	accessToken,
	id,
	subject,
	message,
}: {
	accessToken: string;
	id: string;
	subject?: string;
	message?: string;
}): Promise<SupportRequest> {
	const url = URLS.support.update.replace('{id}', id);
	const res = await http.patch(
		`${BASE}${url}`,
		{ subject, message },
		{ headers: { Authorization: `Bearer ${accessToken}` } },
	);
	return res.data?.data?.supportRequest;
}

export async function deleteSupportRequest({
	accessToken,
	id,
}: {
	accessToken: string;
	id: string;
}): Promise<void> {
	const url = URLS.support.delete.replace('{id}', id);
	await http.patch(`${BASE}${url}`, null, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
}

export async function searchSupportRequests({
	accessToken,
	query,
	page = 1,
	limit = 10,
}: {
	accessToken: string;
	query: string;
	page?: number;
	limit?: number;
}): Promise<PaginatedSupportRequests> {
	const res = await http.get(`${BASE}${URLS.support.search}`, {
		params: { query, page, limit },
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	return res.data?.data;
}

export async function fetchSupportRequestStats({
	accessToken,
}: {
	accessToken: string;
}): Promise<SupportRequestStats> {
	const res = await http.get(`${BASE}${URLS.support.stats}`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	return res.data?.data?.stats;
}

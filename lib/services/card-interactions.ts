import { http } from '@/lib/services/http';
import { URLS } from '@/lib/const';

const BASE =
	process.env.CONNECT_API_URL || process.env.NEXT_PUBLIC_CONNECT_API_URL;

export type ScanType = 'TAP' | 'SCAN';

export interface CardInteraction {
	id: string;
	userId: string;
	deviceId: string;
	method: ScanType;
	deviceType?: string | null;
	referrer?: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface CardInteractionStats {
	totalInteractions: number;
	tapInteractions: number;
	scanInteractions: number;
	todayInteractions: number;
	thisWeekInteractions: number;
	thisMonthInteractions: number;
	uniqueDevices: number;
	tapPercentage: number;
	scanPercentage: number;
}

export interface PaginatedCardInteractions {
	cardInteractions: CardInteraction[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		pages: number;
	};
}

export async function fetchCardInteractions({
	accessToken,
	page = 1,
	limit = 20,
}: {
	accessToken: string;
	page?: number;
	limit?: number;
}): Promise<PaginatedCardInteractions> {
	const res = await http.get(`${BASE}${URLS.card.all}`, {
		params: { page, limit },
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	return res.data?.data;
}

export async function fetchCardInteractionsByMethod({
	accessToken,
	method,
	page = 1,
	limit = 20,
}: {
	accessToken: string;
	method: ScanType;
	page?: number;
	limit?: number;
}): Promise<PaginatedCardInteractions> {
	const url = URLS.card.method.replace('{method}', method);
	const res = await http.get(`${BASE}${url}`, {
		params: { page, limit },
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	return res.data?.data;
}

export async function fetchCardInteractionsByDevice({
	accessToken,
	deviceId,
	page = 1,
	limit = 20,
}: {
	accessToken: string;
	deviceId: string;
	page?: number;
	limit?: number;
}): Promise<PaginatedCardInteractions> {
	const url = URLS.card.device.replace('{deviceId}', deviceId);
	const res = await http.get(`${BASE}${url}`, {
		params: { page, limit },
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	return res.data?.data;
}

export async function fetchCardInteractionsByDateRange({
	accessToken,
	startDate,
	endDate,
	page = 1,
	limit = 20,
}: {
	accessToken: string;
	startDate: string;
	endDate: string;
	page?: number;
	limit?: number;
}): Promise<PaginatedCardInteractions> {
	const res = await http.get(`${BASE}${URLS.card.date_range}`, {
		params: { startDate, endDate, page, limit },
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	return res.data?.data;
}

export async function fetchRecentCardInteractions({
	accessToken,
	limit = 5,
}: {
	accessToken: string;
	limit?: number;
}): Promise<CardInteraction[]> {
	const res = await http.get(`${BASE}${URLS.card.recent}`, {
		params: { limit },
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	return res.data?.data?.cardInteractions ?? [];
}

export async function fetchCardInteractionStats({
	accessToken,
}: {
	accessToken: string;
}): Promise<CardInteractionStats> {
	const res = await http.get(`${BASE}${URLS.card.stats}`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	return res.data?.data?.stats;
}

export async function deleteCardInteraction({
	accessToken,
	id,
}: {
	accessToken: string;
	id: string;
}): Promise<void> {
	const url = URLS.card.delete.replace('{id}', id);
	await http.patch(`${BASE}${url}`, null, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
}

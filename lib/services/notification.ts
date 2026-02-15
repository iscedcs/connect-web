import { http } from '@/lib/services/http';
import { URLS } from '@/lib/const';

const BASE =
	process.env.CONNECT_API_URL || process.env.NEXT_PUBLIC_CONNECT_API_URL;

export type NotificationType = 'CARD_INTERACTION' | 'CONTACT_SHARED';

export interface Notification {
	id: string;
	userId: string;
	title: string;
	message: string;
	type: NotificationType;
	isRead: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface NotificationStats {
	totalNotifications: number;
	unreadNotifications: number;
	cardInteractionNotifications: number;
	contactSharedNotifications: number;
	todayNotifications: number;
	thisWeekNotifications: number;
	readRate: number;
}

export interface PaginatedNotifications {
	notifications: Notification[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		pages: number;
	};
}

export async function fetchNotifications({
	accessToken,
	page = 1,
	limit = 20,
}: {
	accessToken: string;
	page?: number;
	limit?: number;
}): Promise<PaginatedNotifications> {
	const res = await http.get(`${BASE}${URLS.notification.all}`, {
		params: { page, limit },
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	return res.data?.data;
}

export async function fetchUnreadNotifications({
	accessToken,
	page = 1,
	limit = 20,
}: {
	accessToken: string;
	page?: number;
	limit?: number;
}): Promise<PaginatedNotifications> {
	const res = await http.get(`${BASE}${URLS.notification.unread}`, {
		params: { page, limit },
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	return res.data?.data;
}

export async function fetchNotificationsByType({
	accessToken,
	type,
	page = 1,
	limit = 20,
}: {
	accessToken: string;
	type: NotificationType;
	page?: number;
	limit?: number;
}): Promise<PaginatedNotifications> {
	const url = URLS.notification.type.replace('{type}', type);
	const res = await http.get(`${BASE}${url}`, {
		params: { page, limit },
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	return res.data?.data;
}

export async function fetchRecentNotifications({
	accessToken,
	limit = 5,
}: {
	accessToken: string;
	limit?: number;
}): Promise<Notification[]> {
	const res = await http.get(`${BASE}${URLS.notification.recent}`, {
		params: { limit },
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	return res.data?.data?.notifications ?? [];
}

export async function fetchNotificationStats({
	accessToken,
}: {
	accessToken: string;
}): Promise<NotificationStats> {
	const res = await http.get(`${BASE}${URLS.notification.stats}`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	return res.data?.data?.stats;
}

export async function markNotificationRead({
	accessToken,
	id,
}: {
	accessToken: string;
	id: string;
}): Promise<void> {
	const url = URLS.notification.read_one.replace('{id}', id);
	await http.patch(`${BASE}${url}`, null, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
}

export async function markAllNotificationsRead({
	accessToken,
}: {
	accessToken: string;
}): Promise<void> {
	await http.patch(`${BASE}${URLS.notification.read_all}`, null, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
}

export async function deleteNotification({
	accessToken,
	id,
}: {
	accessToken: string;
	id: string;
}): Promise<void> {
	const url = URLS.notification.delete.replace('{id}', id);
	await http.patch(`${BASE}${url}`, null, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
}

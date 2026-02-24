'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Notification } from '@/lib/services/notification';

// ─── Hook options ─────────────────────────────────────

interface UseNotificationSocketOptions {
	/** JWT access token for WebSocket authentication */
	accessToken: string;
	/** Called when a new notification arrives */
	onNotification?: (notification: Notification) => void;
	/** Called when the unread count changes */
	onUnreadCount?: (count: number) => void;
	/** Enable / disable the connection (default: true) */
	enabled?: boolean;
}

/**
 * Custom hook that subscribes to real-time notification events via WebSocket.
 *
 * Connects to connect-nest's Socket.IO `/notifications` namespace,
 * authenticates with the JWT token, and auto-joins the user's room
 * (handled server-side on connection — no manual join needed).
 *
 * Events:
 * - `new_notification`: A new notification was created for this user
 * - `unread_count`: Updated unread count after a notification arrives
 */
export function useNotificationSocket({
	accessToken,
	onNotification,
	onUnreadCount,
	enabled = true,
}: UseNotificationSocketOptions) {
	const [unreadCount, setUnreadCount] = useState(0);
	const [connected, setConnected] = useState(false);

	// Keep callback refs stable to avoid reconnecting on every render
	const onNotificationRef = useRef(onNotification);
	const onUnreadCountRef = useRef(onUnreadCount);

	useEffect(() => {
		onNotificationRef.current = onNotification;
	}, [onNotification]);
	useEffect(() => {
		onUnreadCountRef.current = onUnreadCount;
	}, [onUnreadCount]);

	useEffect(() => {
		if (!enabled || !accessToken) return;

		const baseUrl = process.env.NEXT_PUBLIC_CONNECT_API_URL || '';
		const socket: Socket = io(`${baseUrl}/notifications`, {
			auth: { token: accessToken },
			transports: ['websocket', 'polling'],
			reconnection: true,
			reconnectionAttempts: Infinity,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 5000,
		});

		socket.on('connect', () => {
			setConnected(true);
			// Server auto-joins user to their room on connection — no manual join needed
		});

		socket.on('disconnect', () => {
			setConnected(false);
		});

		// ─── Event listeners ──────────────────────────

		socket.on('new_notification', (notification: Notification) => {
			onNotificationRef.current?.(notification);
		});

		socket.on('unread_count', (data: { count: number }) => {
			setUnreadCount(data.count);
			onUnreadCountRef.current?.(data.count);
		});

		socket.on('error', (err: { message: string }) => {
			console.warn('[NotificationSocket] Server error:', err.message);
		});

		return () => {
			socket.disconnect();
		};
	}, [accessToken, enabled]);

	/** Manually reset unread count (e.g. after marking all read) */
	const resetUnreadCount = useCallback((count = 0) => {
		setUnreadCount(count);
	}, []);

	return { unreadCount, connected, resetUnreadCount };
}

'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ThreadMessage, ThreadStatus } from '@/lib/types/artisan';

// ─── Event types ──────────────────────────────────────

type ThreadSocketEventType =
	| 'new_message'
	| 'status_changed'
	| 'payment_update'
	| 'thread_closed';

// ─── Hook options ─────────────────────────────────────

interface UseThreadSocketOptions {
	/** Thread ID to subscribe to */
	threadId: string;
	/** Current user's ID — used to ignore own messages */
	currentUserId: string;
	/** JWT access token for WebSocket authentication */
	accessToken: string;
	/** Called when a new message arrives from the other participant */
	onMessage: (message: ThreadMessage) => void;
	/** Called when the thread status changes */
	onStatusChange: (
		status: ThreadStatus,
		data?: Record<string, unknown>,
	) => void;
	/** Called when a payment update arrives */
	onPaymentUpdate: (data: Record<string, unknown>) => void;
	/** Called when the thread is closed by the other participant */
	onThreadClosed: (data: { closedBy: string }) => void;
	/** Enable / disable the connection (default: true) */
	enabled?: boolean;
}

/**
 * Custom hook that subscribes to real-time thread events via WebSocket.
 *
 * Connects to connect-nest's Socket.IO `/threads` namespace,
 * authenticates with the JWT token, joins the thread room,
 * and dispatches incoming events to the provided callbacks.
 */
export function useThreadSocket({
	threadId,
	currentUserId,
	accessToken,
	onMessage,
	onStatusChange,
	onPaymentUpdate,
	onThreadClosed,
	enabled = true,
}: UseThreadSocketOptions) {
	// Keep callback refs stable to avoid reconnecting on every render
	const onMessageRef = useRef(onMessage);
	const onStatusChangeRef = useRef(onStatusChange);
	const onPaymentUpdateRef = useRef(onPaymentUpdate);
	const onThreadClosedRef = useRef(onThreadClosed);

	useEffect(() => {
		onMessageRef.current = onMessage;
	}, [onMessage]);
	useEffect(() => {
		onStatusChangeRef.current = onStatusChange;
	}, [onStatusChange]);
	useEffect(() => {
		onPaymentUpdateRef.current = onPaymentUpdate;
	}, [onPaymentUpdate]);
	useEffect(() => {
		onThreadClosedRef.current = onThreadClosed;
	}, [onThreadClosed]);

	useEffect(() => {
		if (!enabled || !threadId || !accessToken) return;

		const baseUrl = process.env.NEXT_PUBLIC_CONNECT_API_URL || '';
		const socket: Socket = io(`${baseUrl}/threads`, {
			auth: { token: accessToken },
			transports: ['websocket', 'polling'],
			reconnection: true,
			reconnectionAttempts: Infinity,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 5000,
		});

		socket.on('connect', () => {
			// Join the thread room once connected
			socket.emit('join_thread', { threadId });
		});

		socket.on('joined_thread', () => {
			// Successfully joined — ready to receive events
		});

		// ─── Event listeners ──────────────────────────

		socket.on('new_message', (payload: Record<string, unknown>) => {
			const msg = payload.message as ThreadMessage | undefined;
			// Ignore our own messages — we already have them in local state
			if (msg && msg.senderUserId !== currentUserId) {
				onMessageRef.current(msg);
			}
		});

		socket.on('status_changed', (payload: Record<string, unknown>) => {
			const status = payload.status as ThreadStatus;
			onStatusChangeRef.current(status, payload);
		});

		socket.on('payment_update', (payload: Record<string, unknown>) => {
			onPaymentUpdateRef.current(payload);
		});

		socket.on('thread_closed', (payload: Record<string, unknown>) => {
			onThreadClosedRef.current({
				closedBy: (payload.closedBy as string) || 'unknown',
			});
		});

		socket.on('error', (err: { message: string }) => {
			console.warn('[ThreadSocket] Server error:', err.message);
		});

		return () => {
			socket.emit('leave_thread', { threadId });
			socket.disconnect();
		};
	}, [threadId, currentUserId, accessToken, enabled]);
}

'use client';

import { useEffect, useRef } from 'react';
import type {
    ThreadMessage,
    ThreadStatus
} from '@/lib/types/artisan';

// ─── SSE event payload shapes ─────────────────────────

type ThreadSSEEventType =
	| 'new_message'
	| 'status_changed'
	| 'payment_update'
	| 'thread_closed';

interface SSEPayload {
	type: ThreadSSEEventType;
	[key: string]: unknown;
}

// ─── Hook options ─────────────────────────────────────

interface UseThreadSSEOptions {
	/** Thread ID to subscribe to */
	threadId: string;
	/** Current user's ID — used to ignore own messages */
	currentUserId: string;
	/** Called when a new message arrives from the other participant */
	onMessage: (message: ThreadMessage) => void;
	/** Called when the thread status changes */
	onStatusChange: (status: ThreadStatus, data?: Record<string, unknown>) => void;
	/** Called when a payment update arrives */
	onPaymentUpdate: (data: Record<string, unknown>) => void;
	/** Called when the thread is closed by the other participant */
	onThreadClosed: (data: { closedBy: string }) => void;
	/** Enable / disable the connection (default: true) */
	enabled?: boolean;
}

/**
 * Custom hook that subscribes to real-time thread events via SSE.
 *
 * The EventSource connects to the Next.js proxy route which forwards
 * to connect-nest's `@Sse` endpoint. Cookies are sent automatically
 * (same-origin), and the proxy attaches the Bearer token server-side.
 */
export function useThreadSSE({
	threadId,
	currentUserId,
	onMessage,
	onStatusChange,
	onPaymentUpdate,
	onThreadClosed,
	enabled = true,
}: UseThreadSSEOptions) {
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
		if (!enabled || !threadId) return;

		const url = `/api/connect/threads/${encodeURIComponent(threadId)}/events`;
		const source = new EventSource(url, { withCredentials: true });

		source.onmessage = (event) => {
			try {
				const payload: SSEPayload = JSON.parse(event.data);

				switch (payload.type) {
					case 'new_message': {
						const msg = payload.message as ThreadMessage | undefined;
						// Ignore our own messages — we already have them in local state
						if (msg && msg.senderUserId !== currentUserId) {
							onMessageRef.current(msg);
						}
						break;
					}

					case 'status_changed': {
						const status = payload.status as ThreadStatus;
						onStatusChangeRef.current(status, payload as Record<string, unknown>);
						break;
					}

					case 'payment_update': {
						onPaymentUpdateRef.current(payload as Record<string, unknown>);
						break;
					}

					case 'thread_closed': {
						onThreadClosedRef.current({
							closedBy: (payload.closedBy as string) || 'unknown',
						});
						break;
					}
				}
			} catch {
				// Ignore malformed events
			}
		};

		source.onerror = () => {
			// EventSource auto-reconnects on error.
			// We don't need to do anything special here —
			// the browser will re-establish the connection.
		};

		return () => {
			source.close();
		};
	}, [threadId, currentUserId, enabled]);
}

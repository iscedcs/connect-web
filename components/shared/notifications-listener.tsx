'use client';

import { useEffect, useRef } from 'react';
import { onForegroundMessage } from '@/lib/firebase';
import { useRegisterPushDevice } from '@/hooks/useRegisterPushDevice';
import { toast } from 'sonner';

/**
 * Invisible component that:
 * 1. Registers the browser for web push on mount (requests permission)
 * 2. Listens for foreground FCM messages and surfaces them as toasts
 *
 * Mount once in the authenticated layout.
 */
export function NotificationsListener() {
	const { register } = useRegisterPushDevice();
	const registered = useRef(false);

	// Register for push on first mount
	useEffect(() => {
		if (registered.current) return;
		registered.current = true;
		register();
	}, [register]);

	// Listen for foreground FCM push messages
	useEffect(() => {
		const cleanup = onForegroundMessage((payload) => {
			const title = payload.notification?.title || 'New notification';
			const body = payload.notification?.body || '';

			// Show in-app toast
			toast(title, { description: body });

			// Also show native browser notification if permitted
			if (Notification.permission === 'granted') {
				new Notification(title, {
					body,
					icon: '/assets/isce-icon.png',
				});
			}
		});

		return () => {
			cleanup?.();
		};
	}, []);

	return null;
}

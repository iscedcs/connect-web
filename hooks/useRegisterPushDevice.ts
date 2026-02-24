'use client';

import { requestFcmToken } from '@/lib/firebase';
import { useCallback, useState } from 'react';
import { csrfFetch } from '@/lib/csrf-client';

const STORAGE_KEY = 'fcmToken';

export function useRegisterPushDevice() {
	const [token, setToken] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const register = useCallback(async () => {
		setError(null);
		setLoading(true);

		try {
			// 1. Browser support checks
			if (!('Notification' in window)) {
				throw new Error(
					'Notifications are not supported on this browser',
				);
			}

			if (!('serviceWorker' in navigator)) {
				throw new Error('Service workers are not supported');
			}

			// 2. Permission handling
			if (Notification.permission === 'default') {
				const permission = await Notification.requestPermission();
				if (permission !== 'granted') {
					throw new Error('Notification permission not granted');
				}
			}

			if (Notification.permission === 'denied') {
				throw new Error(
					'Notifications are blocked. Enable them in your browser settings.',
				);
			}

			// 3. Reuse token only if permission is still granted
			const existingToken = localStorage.getItem(STORAGE_KEY);
			if (existingToken && Notification.permission === 'granted') {
				setToken(existingToken);
				return;
			}

			// 4. Ensure service worker is registered and ready
			await navigator.serviceWorker.register('/firebase-messaging-sw.js');
			await navigator.serviceWorker.ready;

			// 5. Get VAPID key
			const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
			if (!vapidKey) {
				throw new Error('Missing Firebase VAPID key');
			}

			// 6. Request FCM token
			const fcmToken = await requestFcmToken(vapidKey);
			if (!fcmToken) {
				throw new Error('Failed to obtain FCM token');
			}

			// 7. Register device on backend (isce-auth)
			const res = await csrfFetch('/api/notifications/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					fcmToken,
					platform: 'web',
					deviceInfo: navigator.userAgent,
				}),
			});

			if (!res.ok) {
				throw new Error('Failed to register device on server');
			}

			// 8. Persist only after successful backend registration
			localStorage.setItem(STORAGE_KEY, fcmToken);
			setToken(fcmToken);
		} catch (err: unknown) {
			setError(
				err instanceof Error ? err.message : 'Something went wrong',
			);
		} finally {
			setLoading(false);
		}
	}, []);

	const unregister = useCallback(async () => {
		try {
			const storedToken = localStorage.getItem(STORAGE_KEY);
			if (!storedToken) return;

			await csrfFetch('/api/notifications/unregister', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ fcmToken: storedToken }),
			});

			localStorage.removeItem(STORAGE_KEY);
			setToken(null);
		} catch {
			// intentionally silent
		}
	}, []);

	return {
		register,
		unregister,
		fcmToken: token,
		error,
		loading,
	};
}

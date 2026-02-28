/* eslint-disable no-undef */
// Service worker for ISCE Connect PWA
// Handles: push notifications (Firebase), offline caching, install prompt

// ─── Cache configuration ────────────────────────────────────────────
const CACHE_NAME = 'isce-connect-v1';
const OFFLINE_URL = '/offline';
const PRECACHE_URLS = [
	'/',
	'/offline',
	'/android-chrome-192x192.png',
	'/android-chrome-512x512.png',
	'/favicon.ico',
	'/manifest.json',
];

// ─── Install: precache shell assets ─────────────────────────────────
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => cache.addAll(PRECACHE_URLS))
			.then(() => self.skipWaiting()),
	);
});

// ─── Activate: clean old caches ─────────────────────────────────────
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys
						.filter((key) => key !== CACHE_NAME)
						.map((key) => caches.delete(key)),
				),
			)
			.then(() => self.clients.claim()),
	);
});

// ─── Fetch: network-first with offline fallback ─────────────────────
self.addEventListener('fetch', (event) => {
	// Only handle GET requests and same-origin
	if (
		event.request.method !== 'GET' ||
		!event.request.url.startsWith(self.location.origin)
	) {
		return;
	}

	// Skip API routes and auth routes — they must always be live
	const url = new URL(event.request.url);
	if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) {
		return;
	}

	event.respondWith(
		fetch(event.request)
			.then((response) => {
				// Cache successful page/asset responses
				if (response.ok) {
					const clone = response.clone();
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(event.request, clone);
					});
				}
				return response;
			})
			.catch(() => {
				// Serve from cache, or show offline page for navigation requests
				return caches.match(event.request).then((cached) => {
					if (cached) return cached;
					if (event.request.mode === 'navigate') {
						return caches.match(OFFLINE_URL);
					}
					return new Response('Offline', {
						status: 503,
						statusText: 'Service Unavailable',
					});
				});
			}),
	);
});

// ─── Firebase Cloud Messaging ───────────────────────────────────────
// The Firebase config values below are injected at build time or can be
// replaced by a CI/CD pipeline. They are NOT secrets — they are the same
// public keys shipped to every browser that loads the app.

importScripts(
	'https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js',
);
importScripts(
	'https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js',
);

firebase.initializeApp({
	apiKey: 'YOUR_FIREBASE_API_KEY',
	authDomain: 'YOUR_FIREBASE_AUTH_DOMAIN',
	projectId: 'YOUR_FIREBASE_PROJECT_ID',
	storageBucket: 'YOUR_FIREBASE_STORAGE_BUCKET',
	messagingSenderId: 'YOUR_FIREBASE_MESSAGING_SENDER_ID',
	appId: 'YOUR_FIREBASE_APP_ID',
});

const messaging = firebase.messaging();

// Handle background messages (when the app tab is not focused)
messaging.onBackgroundMessage((payload) => {
	const title = payload.notification?.title || 'ISCE Connect';
	const options = {
		body: payload.notification?.body || '',
		icon: '/android-chrome-192x192.png',
		badge: '/android-chrome-192x192.png',
		data: payload.data,
	};

	self.registration.showNotification(title, options);
});

// Open the app when the user clicks a notification
self.addEventListener('notificationclick', (event) => {
	event.notification.close();

	const actionUrl = event.notification?.data?.actionUrl || '/';

	event.waitUntil(
		clients
			.matchAll({ type: 'window', includeUncontrolled: true })
			.then((windowClients) => {
				// Focus an existing tab if one is already open
				for (const client of windowClients) {
					if (client.url.includes(self.location.origin)) {
						client.navigate(actionUrl);
						return client.focus();
					}
				}
				// Otherwise open a new tab
				return clients.openWindow(actionUrl);
			}),
	);
});

/* eslint-disable no-undef */
// Firebase Cloud Messaging service worker for background notifications.
// The Firebase config values below are injected at build time or can be
// replaced by a CI/CD pipeline.  They are NOT secrets — they are the same
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
		icon: '/assets/isce-icon.png',
		badge: '/assets/isce-icon.png',
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

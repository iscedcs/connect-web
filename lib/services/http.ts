import axios from 'axios';
import {
	getFreshAccessToken,
	isAuthEndpoint,
	isBrowser,
	redirectToSignIn,
	refreshSession,
} from '@/lib/client-session';

export const http = axios.create({
	timeout: 10000,
});

http.interceptors.response.use(
	(res) => res,
	async (err) => {
		const config = err?.config as
			| (typeof err.config & { __isRetry?: boolean })
			| undefined;

		// Callers of this instance talk to the Connect API cross-origin and
		// pass an explicit `Authorization` header, usually from an
		// `accessToken` prop handed down by a server component. That prop is
		// stale by the time we get a 401, so refreshing the cookie is not
		// enough — the retry has to carry the new token too.
		//
		// Server-side callers fall straight through: there is no browser
		// session to refresh, and `window` does not exist to redirect.
		if (
			isBrowser() &&
			err?.response?.status === 401 &&
			config &&
			!config.__isRetry &&
			!isAuthEndpoint(config.url)
		) {
			config.__isRetry = true;

			if (await refreshSession()) {
				const token = await getFreshAccessToken();
				if (token && config.headers) {
					config.headers.Authorization = `Bearer ${token}`;
				}
				return http.request(config);
			}

			redirectToSignIn();
		}

		return Promise.reject(
			new Error(
				err?.response?.data?.message || 'Network or server error',
			),
		);
	},
);

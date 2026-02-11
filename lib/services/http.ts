import axios from 'axios';

export const http = axios.create({
	timeout: 10000,
});

http.interceptors.response.use(
	(res) => res,
	(err) => {
		return Promise.reject(
			new Error(
				err?.response?.data?.message || 'Network or server error',
			),
		);
	},
);

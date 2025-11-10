import axios from 'axios';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
const api = axios.create({
	baseURL: backendUrl,
	withCredentials: false
});

const TOKEN_KEY = 'muselab_token';
const USER_KEY = 'muselab_user';

function resolveToken(explicitToken) {
	if (explicitToken) return explicitToken;
	if (typeof window === 'undefined') return null;
	return localStorage.getItem(TOKEN_KEY);
}

function authHeader({ token, headers } = {}) {
	const resolved = resolveToken(token);
	return resolved
		? {
				Authorization: `Bearer ${resolved}`,
				...(headers || {})
			}
		: { ...(headers || {}) };
}

function handleError(error) {
	if (error?.response?.data) {
		throw error.response;
	}
	throw error;
}

export async function get(path, { auth, token, params, headers } = {}) {
	try {
		const res = await api.get(path, {
			params,
			headers: auth ? authHeader({ token, headers }) : headers
		});
		return res.data;
	} catch (error) {
		handleError(error);
	}
}

export async function post(path, data, { auth, token, headers } = {}) {
	try {
		const res = await api.post(path, data, {
			headers: auth ? authHeader({ token, headers }) : headers
		});
		return res.data;
	} catch (error) {
		handleError(error);
	}
}

export async function patch(path, data, { auth, token, headers } = {}) {
	try {
		const res = await api.patch(path, data, {
			headers: auth ? authHeader({ token, headers }) : headers
		});
		return res.data;
	} catch (error) {
		handleError(error);
	}
}

export async function put(path, data, { auth, token, headers } = {}) {
	try {
		const res = await api.put(path, data, {
			headers: auth ? authHeader({ token, headers }) : headers
		});
		return res.data;
	} catch (error) {
		handleError(error);
	}
}

export async function del(path, { auth, token, headers } = {}) {
	try {
		const res = await api.delete(path, {
			headers: auth ? authHeader({ token, headers }) : headers
		});
		return res.data;
	} catch (error) {
		handleError(error);
	}
}

export async function postForm(path, formData, { auth, token, headers } = {}) {
	try {
		const res = await api.post(path, formData, {
			headers: auth
				? authHeader({
						token,
						headers: {
							'Content-Type': 'multipart/form-data',
							...(headers || {})
						}
					})
				: {
						'Content-Type': 'multipart/form-data',
						...(headers || {})
					}
		});
		return res.data;
	} catch (error) {
		handleError(error);
	}
}

export { backendUrl, TOKEN_KEY, USER_KEY };



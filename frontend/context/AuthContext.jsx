'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { TOKEN_KEY, USER_KEY } from '../lib/api';

const AuthContext = createContext({
	token: null,
	user: null,
	isAuthenticated: false,
	loading: true,
	login: () => {},
	logout: () => {}
});

export function AuthProvider({ children }) {
	const [token, setToken] = useState(null);
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const storedToken = localStorage.getItem(TOKEN_KEY);
		const storedUser = localStorage.getItem(USER_KEY);
		if (storedToken) setToken(storedToken);
		if (storedUser) {
			try {
				setUser(JSON.parse(storedUser));
			} catch {
				setUser(null);
			}
		}
		setLoading(false);
	}, []);

	const login = (nextToken, nextUser) => {
		if (typeof window !== 'undefined') {
			localStorage.setItem(TOKEN_KEY, nextToken);
			localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
		}
		setToken(nextToken);
		setUser(nextUser);
	};

	const logout = () => {
		if (typeof window !== 'undefined') {
			localStorage.removeItem(TOKEN_KEY);
			localStorage.removeItem(USER_KEY);
		}
		setToken(null);
		setUser(null);
	};

	const value = useMemo(
		() => ({
			token,
			user,
			isAuthenticated: Boolean(token),
			loading,
			login,
			logout
		}),
		[token, user, loading]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	return useContext(AuthContext);
}

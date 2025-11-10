'use client';

import { createContext, useContext, useMemo, useState, useCallback } from 'react';

const ToastContext = createContext({
	pushToast: () => {},
	removeToast: () => {}
});

let toastIdCounter = 0;

export function ToastProvider({ children }) {
	const [toasts, setToasts] = useState([]);

	const removeToast = useCallback((id) => {
		setToasts((prev) => prev.filter((toast) => toast.id !== id));
	}, []);

	const pushToast = useCallback(({ title, description, variant = 'default', duration = 4000 }) => {
		const id = ++toastIdCounter;
		setToasts((prev) => [...prev, { id, title, description, variant }]);
		if (duration > 0) {
			setTimeout(() => removeToast(id), duration);
		}
	}, [removeToast]);

	const value = useMemo(() => ({ toasts, pushToast, removeToast }), [toasts, pushToast, removeToast]);

	return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
	return useContext(ToastContext);
}



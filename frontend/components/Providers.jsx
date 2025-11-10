'use client';

import { AuthProvider } from '../context/AuthContext.jsx';
import { ToastProvider } from '../context/ToastContext.jsx';
import ToastViewport from './ToastViewport.jsx';

export default function Providers({ children }) {
	return (
		<AuthProvider>
			<ToastProvider>
				{children}
				<ToastViewport />
			</ToastProvider>
		</AuthProvider>
	);
}



'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { post } from '../../../../lib/api';
import { useAuth } from '../../../../context/AuthContext.jsx';
import { useToast } from '../../../../context/ToastContext.jsx';

function GitHubCallbackContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { login } = useAuth();
	const { pushToast } = useToast();
	const [status, setStatus] = useState('Memproses...');

	useEffect(() => {
		async function handleCallback() {
			const code = searchParams.get('code');
			const error = searchParams.get('error');

			if (error) {
				setStatus('Gagal: ' + error);
				pushToast({
					title: 'GitHub OAuth gagal',
					description: error,
					variant: 'error'
				});
				setTimeout(() => router.push('/auth'), 2000);
				return;
			}

			if (!code) {
				setStatus('Kode OAuth tidak ditemukan');
				setTimeout(() => router.push('/auth'), 2000);
				return;
			}

			try {
				// Exchange code dengan backend untuk mendapatkan user data dari GitHub
				const response = await fetch(`/api/auth/github/callback?code=${code}`, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json'
					}
				});

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({}));
					throw new Error(errorData.message || 'Gagal mendapatkan data dari GitHub');
				}

				const data = await response.json();
				
				// Gunakan data GitHub untuk login
				const oauthData = {
					provider: 'github',
					providerId: data.id.toString(),
					email: data.email,
					name: data.name || data.login,
					avatar: data.avatar_url
				};

				const res = await post('/api/auth/oauth', oauthData);
				login(res.token, res.user);
				setStatus('Login berhasil! Mengarahkan...');
				pushToast({
					title: 'Login berhasil',
					description: `Selamat datang, ${res.user.name}!`,
					variant: 'success'
				});
				setTimeout(() => router.push('/studios'), 1000);
			} catch (err) {
				setStatus('Gagal: ' + (err.message || 'Terjadi kesalahan'));
				pushToast({
					title: 'GitHub OAuth gagal',
					description: err.message || 'Terjadi kesalahan saat login dengan GitHub',
					variant: 'error'
				});
				setTimeout(() => router.push('/auth'), 2000);
			}
		}

		handleCallback();
	}, [searchParams, router, login, pushToast]);

	return (
		<div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
			<div className="text-center space-y-4">
				<svg className="animate-spin h-8 w-8 mx-auto text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
					<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
					<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
				<p className="text-neutral-300">{status}</p>
			</div>
		</div>
	);
}

export default function GitHubCallback() {
	return (
		<Suspense fallback={
			<div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
				<div className="text-center space-y-4">
					<svg className="animate-spin h-8 w-8 mx-auto text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
						<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					<p className="text-neutral-300">Memuat...</p>
				</div>
			</div>
		}>
			<GitHubCallbackContent />
		</Suspense>
	);
}


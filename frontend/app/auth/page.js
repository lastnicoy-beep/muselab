'use client';
import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { post } from '../../lib/api';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

function AuthContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { login } = useAuth();
	const { pushToast } = useToast();
	const [mode, setMode] = useState('login');
	const [email, setEmail] = useState('');
	const [name, setName] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [oauthLoading, setOauthLoading] = useState(null);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	useEffect(() => {
		const paramMode = searchParams.get('mode');
		if (paramMode === 'register' || paramMode === 'login') {
			setMode(paramMode);
		}
	}, [searchParams]);

	const isRegister = useMemo(() => mode === 'register', [mode]);

	async function handleSubmit(event) {
		event.preventDefault();
		setLoading(true);
		setError('');
		setSuccess('');
		try {
			const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
			const payload = isRegister ? { email, name, password } : { email, password };
			const res = await post(endpoint, payload);
			login(res.token, res.user);
			setSuccess(isRegister ? 'Registrasi berhasil! Mengarahkan ke dashboard…' : 'Login sukses! Mengarahkan ke dashboard…');
			pushToast({
				title: isRegister ? 'Registrasi berhasil' : 'Login berhasil',
				description: `Selamat datang, ${res.user.name}!`,
				variant: 'success'
			});
			setTimeout(() => router.push('/studios'), 800);
		} catch (err) {
			const message = err?.data?.message || err?.message || 'Terjadi kesalahan. Coba lagi.';
			setError(message);
			pushToast({
				title: 'Autentikasi gagal',
				description: typeof message === 'string' ? message : 'Periksa email dan password Anda.',
				variant: 'error'
			});
		} finally {
			setLoading(false);
		}
	}

	async function handleOAuth(provider, data) {
		setOauthLoading(provider);
		setError('');
		setSuccess('');
		try {
			const oauthData = {
				provider,
				providerId: data.id || data.sub,
				email: data.email,
				name: data.name,
				avatar: data.picture || data.avatar_url
			};
			const res = await post('/api/auth/oauth', oauthData);
			login(res.token, res.user);
			setSuccess('Login berhasil! Mengarahkan ke dashboard…');
			pushToast({
				title: 'Login berhasil',
				description: `Selamat datang, ${res.user.name}!`,
				variant: 'success'
			});
			setTimeout(() => router.push('/studios'), 800);
		} catch (err) {
			const message = err?.data?.message || err?.message || 'Terjadi kesalahan saat login dengan OAuth.';
			setError(message);
			pushToast({
				title: 'OAuth login gagal',
				description: message,
				variant: 'error'
			});
		} finally {
			setOauthLoading(null);
		}
	}

	const googleLogin = useGoogleLogin({
		onSuccess: async (tokenResponse) => {
			try {
				const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
					headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
				}).then(res => res.json());
				await handleOAuth('google', userInfo);
			} catch (err) {
				setError('Gagal mengambil data dari Google');
				setOauthLoading(null);
			}
		},
		onError: () => {
			setError('Gagal login dengan Google');
			setOauthLoading(null);
		}
	});

	async function handleGitHubLogin() {
		setOauthLoading('github');
		setError('');
		try {
			const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
			if (!clientId) {
				setError('GitHub OAuth belum dikonfigurasi. Silakan gunakan metode login lain atau hubungi administrator.');
				setOauthLoading(null);
				return;
			}
			
			// Redirect ke GitHub OAuth
			const redirectUri = encodeURIComponent(`${window.location.origin}/auth/github/callback`);
			const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user:email&redirect_uri=${redirectUri}`;
			window.location.href = githubAuthUrl;
		} catch (err) {
			setError('Gagal membuka GitHub OAuth');
			setOauthLoading(null);
		}
	}

	function switchMode(target) {
		setMode(target);
		const href = target === 'login' ? '/auth?mode=login' : '/auth?mode=register';
		router.replace(href);
		setError('');
		setSuccess('');
	}

	return (
		<div className="min-h-screen bg-neutral-950 text-white">
			<div className="max-w-5xl mx-auto px-6 py-12">
				<div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] items-center">
					<div className="space-y-6">
						<Link href="/" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition">
							<span>←</span> Kembali ke beranda
						</Link>
						<h1 className="text-4xl font-semibold tracking-tight">
							{isRegister ? 'Bangun Studio kreatif pertamamu.' : 'Selamat datang kembali di Studio kreatifmu.'}
						</h1>
						<p className="text-neutral-300">
							Bergabunglah dengan ribuan kreator yang memadukan musik, visual, dan storytelling di satu kanvas real-time.
							Akses gratis 1 Studio aktif, komentar realtime, dan histori versi otomatis.
						</p>
						<ul className="space-y-3 text-sm text-neutral-400">
							<li className="flex items-start gap-3">
								<span className="mt-1 h-2 w-2 rounded-full bg-orange-500" />
								Realtime pointer, komentar inline, dan aktivitas kolaborator.
							</li>
							<li className="flex items-start gap-3">
								<span className="mt-1 h-2 w-2 rounded-full bg-orange-500" />
								Version control otomatis + export aset untuk portofolio.
							</li>
							<li className="flex items-start gap-3">
								<span className="mt-1 h-2 w-2 rounded-full bg-orange-500" />
								Upgrade ke Pro kapan saja untuk Studio tanpa batas & storage 5GB.
							</li>
						</ul>
					</div>
					<div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
						<div className="flex items-center gap-3 rounded-full bg-white/10 p-1">
							<button
								type="button"
								onClick={() => switchMode('login')}
								className={`flex-1 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
									!isRegister ? 'bg-white text-neutral-900' : 'text-neutral-300'
								}`}
							>
								Login
							</button>
							<button
								type="button"
								onClick={() => switchMode('register')}
								className={`flex-1 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
									isRegister ? 'bg-white text-neutral-900' : 'text-neutral-300'
								}`}
							>
								Register
							</button>
						</div>
						<h2 className="mt-6 text-xl font-semibold text-white">
							{isRegister ? 'Buat akun MuseLab' : 'Masuk ke MuseLab'}
						</h2>
						<p className="mt-2 text-sm text-neutral-400">
							{isRegister ? 'Lengkapi data dirimu untuk membuat Studio baru.' : 'Masukkan kredensial untuk melanjutkan kolaborasi.'}
						</p>

						{/* OAuth Buttons */}
						<div className="mt-6 space-y-3">
							<button
								type="button"
								onClick={() => googleLogin()}
								disabled={oauthLoading === 'google' || loading}
								className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
							>
								{oauthLoading === 'google' ? (
									<>
										<svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg>
										<span>Memproses...</span>
									</>
								) : (
									<>
										<svg className="h-5 w-5" viewBox="0 0 24 24">
											<path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
											<path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
											<path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
											<path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
										</svg>
										<span>Lanjutkan dengan Google</span>
									</>
								)}
							</button>
							<button
								type="button"
								onClick={handleGitHubLogin}
								disabled={oauthLoading === 'github' || loading}
								className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
							>
								{oauthLoading === 'github' ? (
									<>
										<svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg>
										<span>Memproses...</span>
									</>
								) : (
									<>
										<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
											<path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 5.425 3.865 9.98 9.039 11.04.593.12.809-.258.809-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.645 1.653.24 2.873.12 3.176.77.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.017 24 6.484 19.522 2 12 2z" clipRule="evenodd"/>
										</svg>
										<span>Lanjutkan dengan GitHub</span>
									</>
								)}
							</button>
						</div>

						<div className="mt-6 flex items-center gap-4">
							<div className="flex-1 h-px bg-white/10"></div>
							<span className="text-xs text-neutral-500 uppercase tracking-wider">atau</span>
							<div className="flex-1 h-px bg-white/10"></div>
						</div>

						<form className="mt-6 space-y-4" onSubmit={handleSubmit}>
							{isRegister && (
								<label className="block text-sm">
									<span className="text-neutral-300">Nama Lengkap</span>
									<input
										className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-white placeholder:text-neutral-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
										type="text"
										name="name"
										placeholder="Misal: Aiko Nakamura"
										value={name}
										onChange={(event) => setName(event.target.value)}
										required
									/>
								</label>
							)}
							<label className="block text-sm">
								<span className="text-neutral-300">Email</span>
								<input
									className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-white placeholder:text-neutral-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
									type="email"
									name="email"
									autoComplete="email"
									placeholder="kamu@studio.com"
									value={email}
									onChange={(event) => setEmail(event.target.value)}
									required
								/>
							</label>
							<label className="block text-sm">
								<span className="text-neutral-300">Password</span>
								<input
									className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-white placeholder:text-neutral-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
									type="password"
									name="password"
									autoComplete={isRegister ? 'new-password' : 'current-password'}
									placeholder="Minimal 6 karakter"
									value={password}
									onChange={(event) => setPassword(event.target.value)}
									minLength={6}
									required
								/>
							</label>
							{error ? <p className="text-xs text-red-400">{error}</p> : null}
							{success ? <p className="text-xs text-green-400">{success}</p> : null}
							<button
								type="submit"
								disabled={loading || oauthLoading}
								className="w-full rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
							>
								{loading ? 'Memproses…' : isRegister ? 'Registrasi & Masuk' : 'Masuk ke MuseLab'}
							</button>
						</form>

						<div className="mt-6 text-xs text-neutral-500">
							Dengan melanjutkan, kamu menyetujui{' '}
							<Link href="/" className="text-neutral-300 underline underline-offset-4 hover:text-white">
								Syarat Layanan
							</Link>{' '}
							dan{' '}
							<Link href="/" className="text-neutral-300 underline underline-offset-4 hover:text-white">
								Kebijakan Privasi
							</Link>
							.
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function AuthPage() {
	const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
	
	return (
		<GoogleOAuthProvider clientId={googleClientId}>
			<Suspense fallback={<div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">Memuat…</div>}>
				<AuthContent />
			</Suspense>
		</GoogleOAuthProvider>
	);
}

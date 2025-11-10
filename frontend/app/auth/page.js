'use client';
import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
								disabled={loading}
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
	return (
		<Suspense fallback={<div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">Memuat…</div>}>
			<AuthContent />
		</Suspense>
	);
}



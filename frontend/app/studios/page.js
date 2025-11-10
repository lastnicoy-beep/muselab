'use client';

import { useEffect, useMemo, useState } from 'react';
import Navbar from '../../components/Navbar.jsx';
import StudioCard from '../../components/StudioCard.jsx';
import Loader from '../../components/Loader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import CreateStudioDialog from '../../components/CreateStudioDialog.jsx';
import { get } from '../../lib/api';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRouter } from 'next/navigation';

const filters = [
	{ value: 'ALL', label: 'Semua studio' },
	{ value: 'PUBLIC', label: 'Publik' },
	{ value: 'PRIVATE', label: 'Privat' },
	{ value: 'INVITE', label: 'Undangan' }
];

const sortOptions = [
	{ value: 'recent', label: 'Terbaru' },
	{ value: 'alpha', label: 'A-Z' },
	{ value: 'activity', label: 'Aktivitas tertinggi' }
];

export default function StudiosPage() {
	const router = useRouter();
	const { loading: authLoading, isAuthenticated, user, token } = useAuth();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [studios, setStudios] = useState([]);
	const [filter, setFilter] = useState('ALL');
	const [search, setSearch] = useState('');
	const [sort, setSort] = useState('recent');
	const [showCreate, setShowCreate] = useState(false);
	const [insights, setInsights] = useState(null);

	useEffect(() => {
		if (authLoading || !isAuthenticated) return;
		async function loadStudios() {
			setLoading(true);
			setError('');
			try {
				const res = await get('/api/studios', { auth: true, token });
				setStudios(res);
			} catch (err) {
				const message = err?.data?.message || 'Gagal memuat studio.';
				setError(typeof message === 'string' ? message : 'Gagal memuat studio.');
			} finally {
				setLoading(false);
			}
		}
		loadStudios();
	}, [authLoading, isAuthenticated, token]);

	useEffect(() => {
		if (authLoading || !isAuthenticated) return;
		async function loadInsights() {
			try {
				const summary = await get('/api/studios/insights/summary', { auth: true, token });
				setInsights(summary);
			} catch {
				// silently ignore, fallback to local calculations
			}
		}
		loadInsights();
	}, [authLoading, isAuthenticated, token]);

	const totals = useMemo(() => ({
		assets: studios.reduce((acc, studio) => acc + (studio._count?.assets ?? 0), 0),
		comments: studios.reduce((acc, studio) => acc + (studio._count?.comments ?? 0), 0)
	}), [studios]);

	const filteredStudios = useMemo(() => {
		const query = search.trim().toLowerCase();
		let data = studios;
		if (filter !== 'ALL') {
			data = data.filter((studio) => studio.visibility === filter);
		}
		if (query) {
			data = data.filter((studio) => {
				return (
					studio.name.toLowerCase().includes(query) ||
					studio.description?.toLowerCase().includes(query) ||
					studio.owner?.name?.toLowerCase().includes(query)
				);
			});
		}
		if (sort === 'alpha') {
			return [...data].sort((a, b) => a.name.localeCompare(b.name));
		}
		if (sort === 'activity') {
			return [...data].sort(
				(a, b) => (b._count?.assets || 0) + (b._count?.comments || 0) - ((a._count?.assets || 0) + (a._count?.comments || 0))
			);
		}
		return [...data].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
	}, [studios, filter, search, sort]);

	const metrics = useMemo(() => ({
		studioCount: insights ? (insights.ownedStudios ?? 0) + (insights.membershipStudios ?? 0) : studios.length,
		totalAssets: insights?.totalAssets ?? totals.assets,
		totalComments: insights?.totalComments ?? totals.comments
	}), [insights, studios.length, totals]);

	if (!authLoading && !isAuthenticated) {
		return (
			<div className="min-h-screen bg-neutral-950 text-white">
				<Navbar />
				<div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6 px-6 text-center">
					<h1 className="text-3xl font-semibold tracking-tight">Masuk untuk melihat Studio kamu</h1>
					<p className="max-w-md text-sm text-neutral-300">
						Dengan akun MuseLab kamu dapat mengelola studio, membangun moodboard, dan berkarya bareng tim secara realtime.
					</p>
					<div className="flex gap-3">
						<a href="/auth?mode=login" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-200 transition">
							Login
						</a>
						<a href="/auth?mode=register" className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:border-white hover:bg-white/10 transition">
							Buat akun gratis
						</a>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-neutral-950 text-white">
			<Navbar />
			<main className="max-w-6xl mx-auto px-6 py-14">
				<header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Dashboard studio</p>
						<h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
							Halo, {user?.name?.split(' ')[0] || 'Kreator'} — ayo lanjutkan kolaborasi
						</h1>
						<p className="mt-3 max-w-xl text-sm text-neutral-300">
							Atur semua Studio yang kamu miliki maupun yang kamu ikuti. Buat ruang baru untuk kolaborasi lintas disiplin kapan pun inspirasi datang.
						</p>
					</div>
					<button
						type="button"
						onClick={() => setShowCreate(true)}
						className="self-start rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
					>
						+ Studio baru
					</button>
				</header>

				{(user?.plan === 'FREE' || !user?.plan) && (
					<div className="mt-12 rounded-3xl border border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-orange-600/10 p-6">
						<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
							<div>
								<h3 className="text-lg font-semibold text-white">Upgrade ke Pro atau Enterprise</h3>
								<p className="mt-1 text-sm text-neutral-300">
									Dapatkan akses unlimited studios, storage lebih besar, dan fitur kolaborasi premium.
								</p>
							</div>
							<button
								type="button"
								onClick={() => router.push('/payment')}
								className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 whitespace-nowrap"
							>
								Upgrade Sekarang
							</button>
						</div>
					</div>
				)}

				<section className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-6">
					<div className="grid gap-6 md:grid-cols-3 text-sm text-neutral-300">
						<div>
							<p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Studio aktif</p>
							<p className="mt-2 text-2xl font-semibold text-white">{metrics.studioCount}</p>
							<p className="mt-1 text-xs text-neutral-500">Studio yang kamu miliki atau menjadi kolaborator di dalamnya.</p>
						</div>
						<div>
							<p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Total aset kreatif</p>
							<p className="mt-2 text-2xl font-semibold text-white">{metrics.totalAssets}</p>
							<p className="mt-1 text-xs text-neutral-500">Audio, visual, dan catatan yang sudah kamu unggah dan bagikan.</p>
						</div>
						<div>
							<p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Komentar & diskusi</p>
							<p className="mt-2 text-2xl font-semibold text-white">{metrics.totalComments}</p>
							<p className="mt-1 text-xs text-neutral-500">Percakapan yang menjaga setiap revisi tetap terorganisir.</p>
						</div>
					</div>
				</section>

				<section className="mt-12">
					<div className="flex flex-wrap items-center gap-3">
						<div className="flex flex-wrap gap-2">
							{filters.map((item) => (
								<button
									key={item.value}
									type="button"
									onClick={() => setFilter(item.value)}
									className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
										filter === item.value ? 'border-white bg-white text-neutral-900' : 'border-white/20 text-neutral-300 hover:border-white/40 hover:text-white'
									}`}
								>
									{item.label}
								</button>
							))}
						</div>
						<div className="flex flex-wrap gap-3">
							<input
								className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white placeholder:text-neutral-400 focus:border-white/30 focus:outline-none"
								placeholder="Cari studio atau anggota..."
								value={search}
								onChange={(event) => setSearch(event.target.value)}
							/>
							<select
								value={sort}
								onChange={(event) => setSort(event.target.value)}
								className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-neutral-300 focus:border-white/30 focus:outline-none"
							>
								{sortOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</div>
					</div>

					{loading ? (
						<Loader label="Memuat studio..." />
					) : error ? (
						<div className="mt-12 rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-center text-sm text-red-200">
							{error}
						</div>
					) : filteredStudios.length === 0 ? (
						<div className="mt-12">
							<EmptyState
								title="Belum ada studio"
								description="Buat studio pertamamu atau minta undangan dari kolaborator untuk mulai berkarya bersama."
								actionLabel="Buat Studio"
								onAction={() => setShowCreate(true)}
							/>
						</div>
					) : (
						<div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
							{filteredStudios.map((studio) => (
								<StudioCard key={studio.id} studio={studio} />
							))}
						</div>
					)}
				</section>
			</main>
			<CreateStudioDialog
				open={showCreate}
				onClose={() => setShowCreate(false)}
				token={token}
				onCreated={(studio) => {
					setStudios((prev) => [studio, ...prev]);
					setShowCreate(false);
				}}
			/>
		</div>
	);
}



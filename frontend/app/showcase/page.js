'use client';

import { useEffect, useMemo, useState } from 'react';
import Navbar from '../../components/Navbar.jsx';
import StudioCard from '../../components/StudioCard.jsx';
import Loader from '../../components/Loader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { get } from '../../lib/api';

const sortOptions = [
	{ value: 'recent', label: 'Terbaru' },
	{ value: 'popular', label: 'Terpopuler' }
];

export default function ShowcasePage() {
	const [loading, setLoading] = useState(true);
	const [studios, setStudios] = useState([]);
	const [error, setError] = useState('');
	const [search, setSearch] = useState('');
	const [sort, setSort] = useState('recent');

	useEffect(() => {
		async function load() {
			setLoading(true);
			setError('');
			try {
				const result = await get('/api/studios/public');
				setStudios(result);
			} catch (err) {
				const message = err?.data?.message || 'Gagal memuat showcase.';
				setError(message);
			} finally {
				setLoading(false);
			}
		}
		load();
	}, []);

	const filteredStudios = useMemo(() => {
		const query = search.toLowerCase();
		const filtered = studios.filter((studio) => {
			return studio.name.toLowerCase().includes(query) || studio.description?.toLowerCase().includes(query);
		});
		if (sort === 'popular') {
			return [...filtered].sort(
				(a, b) => (b._count?.assets || 0) + (b._count?.comments || 0) - ((a._count?.assets || 0) + (a._count?.comments || 0))
			);
		} else {
			return [...filtered].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
		}
	}, [studios, search, sort]);

	return (
		<div className="min-h-screen bg-neutral-950 text-white">
			<Navbar />
			<main className="max-w-6xl mx-auto px-6 py-14">
				<header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Showcase publik</p>
						<h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">Eksplorasi Studio inspiratif</h1>
						<p className="mt-3 max-w-xl text-sm text-neutral-300">
							Temukan proyek lintas disiplin dari komunitas MuseLab. Like, fork, atau jadikan referensi untuk Studio kamu sendiri.
						</p>
					</div>
					<div className="flex flex-wrap gap-3">
						<input
							className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-white/30 focus:outline-none"
							placeholder="Cari studio publik…"
							value={search}
							onChange={(event) => setSearch(event.target.value)}
						/>
						<select
							value={sort}
							onChange={(event) => setSort(event.target.value)}
							className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-300 focus:border-white/30 focus:outline-none"
						>
							{sortOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</div>
				</header>

				<section className="mt-12">
					{loading ? (
						<Loader label="Memuat showcase..." />
					) : error ? (
						<div className="rounded-3xl border border-red-500/40 bg-red-500/10 px-6 py-4 text-sm text-red-200">
							{error}
						</div>
					) : filteredStudios.length === 0 ? (
						<EmptyState
							title="Belum ada karya yang cocok"
							description="Coba kata kunci lain atau bagikan Studio kamu agar tampil di sini."
							actionLabel="Buat Studio"
							actionHref="/studios"
						/>
					) : (
						<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
							{filteredStudios.map((studio) => (
								<StudioCard key={studio.id} studio={studio} />
							))}
						</div>
					)}
				</section>
			</main>
		</div>
	);
}



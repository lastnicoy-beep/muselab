'use client';

import { useState } from 'react';
import { post } from '../lib/api';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const visibilityOptions = [
	{ value: 'PUBLIC', label: 'Publik — tampil di Showcase dan bisa di-fork' },
	{ value: 'PRIVATE', label: 'Privat — hanya tim yang diundang' },
	{ value: 'INVITE', label: 'Undangan — terlihat publik, tetapi akses atas persetujuan' }
];

export default function CreateStudioDialog({ open, onClose, onCreated, token }) {
	const { token: contextToken } = useAuth();
	const { pushToast } = useToast();
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [visibility, setVisibility] = useState('PRIVATE');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	if (!open) return null;

	async function handleSubmit(event) {
		event.preventDefault();
		setLoading(true);
		setError('');
		try {
			const studio = await post(
				'/api/studios',
				{ name, description, visibility },
				{ auth: true, token: token || contextToken }
			);
			onCreated?.(studio);
			pushToast({
				title: 'Studio berhasil dibuat',
				description: `"${studio.name}" siap untuk kolaborasi.`,
				variant: 'success'
			});
			setName('');
			setDescription('');
			setVisibility('PRIVATE');
		} catch (err) {
			const message = err?.data?.message || 'Gagal membuat studio. Coba lagi.';
			setError(typeof message === 'string' ? message : 'Gagal membuat studio.');
			pushToast({
				title: 'Gagal membuat studio',
				description: typeof message === 'string' ? message : 'Periksa koneksi atau coba ulang.',
				variant: 'error'
			});
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
			<div className="w-full max-w-lg rounded-3xl border border-white/10 bg-neutral-950 p-8 text-white shadow-2xl">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Studio baru</p>
						<h3 className="mt-2 text-2xl font-semibold">Bangun ruang kolaborasi</h3>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.3em] text-neutral-300 hover:border-white/40 hover:text-white transition"
					>
						Tutup
					</button>
				</div>
				<form className="mt-6 space-y-6" onSubmit={handleSubmit}>
					<label className="block text-sm">
						<span className="text-neutral-300">Nama studio</span>
						<input
							className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-neutral-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
							placeholder="Misal: Aurora Collective"
							value={name}
							onChange={(event) => setName(event.target.value)}
							required
						/>
					</label>
					<label className="block text-sm">
						<span className="text-neutral-300">Deskripsi</span>
						<textarea
							className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-neutral-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
							rows={4}
							placeholder="Ceritakan tujuan studio ini, genre, atau inspirasi moodboard."
							value={description}
							onChange={(event) => setDescription(event.target.value)}
						/>
					</label>
					<div className="space-y-2 text-sm">
						<span className="text-neutral-300">Visibilitas</span>
						<div className="grid gap-2">
							{visibilityOptions.map((option) => (
								<label
									key={option.value}
									className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${
										visibility === option.value ? 'border-orange-500 bg-white/10' : 'border-white/10 bg-white/5 hover:border-white/20'
									}`}
								>
									<input
										type="radio"
										name="visibility"
										value={option.value}
										checked={visibility === option.value}
										onChange={() => setVisibility(option.value)}
										className="mt-1"
									/>
									<span>
										<span className="block text-sm font-semibold text-white">{option.label.split(' — ')[0]}</span>
										<span className="text-xs text-neutral-400">{option.label.split(' — ')[1]}</span>
									</span>
								</label>
							))}
						</div>
					</div>
					{error ? <p className="text-xs text-red-400">{error}</p> : null}
					<div className="flex items-center justify-end gap-3">
						<button
							type="button"
							onClick={onClose}
							className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-neutral-300 hover:border-white/40 hover:text-white transition"
						>
							Batal
						</button>
						<button
							type="submit"
							disabled={loading}
							className="rounded-full bg-orange-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{loading ? 'Membuat…' : 'Buat Studio'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}



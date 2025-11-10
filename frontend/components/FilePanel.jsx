'use client';

import { useState } from 'react';
import { postForm, backendUrl } from '../lib/api';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const assetTypeOptions = [
	{ value: 'IMAGE', label: 'Visual' },
	{ value: 'AUDIO', label: 'Audio' },
	{ value: 'TEXT', label: 'Dokumen' }
];

export default function FilePanel({ studioId, assets, onAssetUploaded, onAssetRemoved }) {
	const { token } = useAuth();
	const { pushToast } = useToast();
	const [uploading, setUploading] = useState(false);
	const [type, setType] = useState('IMAGE');
	const [error, setError] = useState('');

	async function handleUpload(event) {
		const file = event.target.files?.[0];
		if (!file) return;
		const form = new FormData();
		form.append('studioId', studioId);
		form.append('type', type);
		form.append('file', file);
		setUploading(true);
		setError('');
		try {
			const uploaded = await postForm('/api/assets/upload', form, { auth: true, token });
			onAssetUploaded?.(uploaded);
			pushToast({
				title: 'Asset berhasil diunggah',
				description: uploaded.filename,
				variant: 'success'
			});
		} catch (err) {
			const message = err?.data?.message || 'Upload gagal. Pastikan format file valid.';
			setError(message);
			pushToast({
				title: 'Upload gagal',
				description: typeof message === 'string' ? message : 'Periksa koneksi atau format file.',
				variant: 'error'
			});
		} finally {
			setUploading(false);
			event.target.value = '';
		}
	}

	return (
		<div className="flex h-full flex-col bg-white text-neutral-900">
			<div className="flex items-center justify-between border-b px-4 py-3">
				<div>
					<h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-600">Asset Panel</h3>
					<p className="text-xs text-neutral-400">Koleksi audio, visual, dan dokumen studio ini.</p>
				</div>
				<div className="flex items-center gap-2 text-xs">
					<select
						value={type}
						onChange={(event) => setType(event.target.value)}
						className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-neutral-600 focus:outline-none"
					>
						{assetTypeOptions.map((option) => (
							<option key={option.value} value={option.value}>{option.label}</option>
						))}
					</select>
					<label className="cursor-pointer rounded-full bg-neutral-900 px-3 py-1 font-semibold text-white transition hover:bg-neutral-700">
						{uploading ? 'Mengunggah…' : 'Upload'}
						<input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
					</label>
				</div>
			</div>
			{error ? (
				<div className="border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-500">
					{error}
				</div>
			) : null}
			<div className="flex-1 overflow-auto">
				{assets.length === 0 ? (
					<div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center text-sm text-neutral-400">
						<p>Belum ada asset yang diunggah.</p>
						<p className="text-xs">Unggah audio, referensi visual, atau catatan untuk memulai.</p>
					</div>
				) : (
					<ul className="divide-y divide-neutral-200">
						{assets.map((asset) => (
							<li key={asset.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
								<div className="min-w-0">
									<p className="truncate font-semibold text-neutral-700">{asset.filename}</p>
									<p className="text-xs text-neutral-400">{asset.mime}</p>
									<p className="text-[11px] text-neutral-400">{Math.round(asset.size / 1024)} KB</p>
								</div>
								<div className="flex items-center gap-2">
									<span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.25em] text-neutral-500">
										{asset.type}
									</span>
									<a
										href={`${backendUrl}${asset.url}`}
										target="_blank"
										rel="noreferrer"
										className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 transition"
									>
										Buka
									</a>
									<button
										type="button"
										onClick={() => onAssetRemoved?.(asset)}
										className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 transition"
									>
										Hapus
									</button>
								</div>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}


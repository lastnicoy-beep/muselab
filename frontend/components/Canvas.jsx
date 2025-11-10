'use client';

import { useMemo, useState } from 'react';
import AudioPlayer from './AudioPlayer.jsx';
import { backendUrl } from '../lib/api';

const tabs = [
	{ id: 'NOTES', label: 'Notes' },
	{ id: 'VISUALS', label: 'Visual board' },
	{ id: 'AUDIO', label: 'Audio mixer' }
];

export default function Canvas({ studio, assets, notes, onNotesChange, presence }) {
	const [activeTab, setActiveTab] = useState('NOTES');

	const images = useMemo(() => assets.filter((asset) => asset.type === 'IMAGE'), [assets]);
	const audios = useMemo(() => assets.filter((asset) => asset.type === 'AUDIO'), [assets]);
	const documents = useMemo(() => assets.filter((asset) => asset.type === 'TEXT'), [assets]);

	return (
		<div className="flex h-full flex-col bg-neutral-900 text-neutral-50">
			<header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-4">
				<div>
					<p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Studio Canvas</p>
					<h2 className="mt-1 text-xl font-semibold text-white">{studio.name}</h2>
					<p className="mt-1 text-xs text-neutral-400">Owner: {studio.owner?.name || 'Tidak diketahui'}</p>
				</div>
				<div className="flex items-center gap-4 text-xs text-neutral-300">
					<div className="flex -space-x-2">
						{presence.map((member) => (
							<div
								key={member.userId}
								className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[11px] font-semibold text-white shadow"
								style={{ background: member.color }}
								title={member.name}
							>
								{member.initials}
							</div>
						))}
					</div>
					<div className="text-right">
						<p className="font-semibold text-white">{presence.length} kolaborator</p>
						<p className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">Realtime presence</p>
					</div>
				</div>
			</header>
			<nav className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-3 text-xs uppercase tracking-[0.3em]">
				<div className="flex flex-wrap items-center gap-2">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							type="button"
							onClick={() => setActiveTab(tab.id)}
							className={`rounded-full px-4 py-2 transition ${
								activeTab === tab.id ? 'bg-white text-neutral-900' : 'bg-white/10 text-neutral-300 hover:bg-white/20'
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>
				<p className="hidden text-[11px] text-neutral-500 md:block">Semua perubahan tersinkron otomatis untuk kolaborator aktif.</p>
			</nav>
			<section className="flex-1 overflow-auto px-6 py-6 text-sm">
				{activeTab === 'NOTES' ? (
					<div className="space-y-4">
						<div className="rounded-3xl border border-white/10 bg-white/5 p-4">
							<p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Central notes</p>
							<p className="mt-2 text-neutral-200">
								Tuliskan ide, struktur lagu, script, atau daftar tugas untuk menjaga tim tetap sinkron. Setiap karakter yang kamu ketik akan terlihat oleh semua kolaborator secara langsung.
							</p>
						</div>
						<textarea
							className="h-[420px] w-full rounded-3xl border border-white/10 bg-white/10 p-6 text-base text-white placeholder:text-neutral-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
							value={notes}
							placeholder="Tulis catatan, lirik, atau storyboard..."
							onChange={(event) => onNotesChange?.(event.target.value)}
						/>
						{documents.length ? (
							<div className="rounded-3xl border border-white/10 bg-white/5 p-5">
								<p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Dokumen terlampir</p>
								<ul className="mt-4 space-y-2 text-sm text-neutral-200">
									{documents.map((doc) => (
										<li key={doc.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
											<div className="min-w-0 pr-4">
												<p className="truncate font-medium text-white">{doc.filename}</p>
												<p className="text-[11px] text-neutral-400">{doc.mime}</p>
											</div>
											<a
												className="rounded-full border border-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:border-white/40"
												href={`${backendUrl}${doc.url}`}
												target="_blank"
												rel="noreferrer"
											>
												Buka
											</a>
										</li>
									))}
								</ul>
							</div>
						) : null}
					</div>
				) : null}
				{activeTab === 'VISUALS' ? (
					<div className="space-y-4">
						<div className="rounded-3xl border border-white/10 bg-white/5 p-4">
							<p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Moodboard</p>
							<p className="mt-2 text-neutral-200">
								Kurasi referensi visual, palet warna, dan inspirasimu di sini. Kolaborator dapat memberikan komentar langsung pada setiap visual.
							</p>
						</div>
						{images.length === 0 ? (
							<p className="text-xs text-neutral-500">Belum ada visual. Unggah file gambar dari panel kiri.</p>
						) : (
							<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
								{images.map((image) => (
									<div key={image.id} className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
										<img
											src={`${backendUrl}${image.url}`}
											alt={image.filename}
											className="h-48 w-full object-cover"
										/>
										<div className="flex items-center justify-between px-4 py-3 text-xs text-neutral-300">
											<p className="truncate">{image.filename}</p>
											<p className="text-[11px] text-neutral-500">{Math.round(image.size / 1024)} KB</p>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				) : null}
				{activeTab === 'AUDIO' ? (
					<div className="space-y-4">
						<div className="rounded-3xl border border-white/10 bg-white/5 p-4">
							<p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Audio mixer</p>
							<p className="mt-2 text-neutral-200">
								Dengarkan track, tandai bagian penting, dan diskusikan aransemen. Kombinasikan dengan komentar untuk menyelaraskan proses mixing/mastering.
							</p>
						</div>
						{audios.length === 0 ? (
							<p className="text-xs text-neutral-500">Belum ada audio. Unggah file format mp3/wav dari panel kiri.</p>
						) : (
							<div className="space-y-3">
								{audios.map((audio) => (
									<div key={audio.id} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3">
										<div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-neutral-400">
											<span>{audio.filename}</span>
											<span>{Math.round(audio.size / 1024)} KB</span>
										</div>
										<div className="mt-2">
											<AudioPlayer src={`${backendUrl}${audio.url}`} />
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				) : null}
			</section>
		</div>
	);
}


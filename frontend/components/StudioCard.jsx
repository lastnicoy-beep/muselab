'use client';

import Link from 'next/link';
import { useMemo } from 'react';

const visibilityCopy = {
	PUBLIC: 'Publik',
	PRIVATE: 'Privat',
	INVITE: 'Undangan'
};

const formatter = new Intl.RelativeTimeFormat('id-ID', { numeric: 'auto' });

function formatTimeAgo(dateString) {
	if (!dateString) return '';
	const date = new Date(dateString);
	const diff = date.getTime() - Date.now();
	const diffMinutes = Math.round(diff / (1000 * 60));
	if (Math.abs(diffMinutes) < 60) {
		return formatter.format(diffMinutes, 'minute');
	}
	const diffHours = Math.round(diffMinutes / 60);
	if (Math.abs(diffHours) < 24) {
		return formatter.format(diffHours, 'hour');
	}
	const diffDays = Math.round(diffHours / 24);
	return formatter.format(diffDays, 'day');
}

export default function StudioCard({ studio }) {
	const memberInitials = useMemo(() => {
		if (!studio?.members?.length) return [];
		return studio.members.map(({ user }) => ({
			id: user.id,
			name: user.name,
			initials: user.name
				.split(' ')
				.map((part) => part[0])
				.join('')
				.slice(0, 2)
				.toUpperCase()
		}));
	}, [studio]);

	const assetsCount = studio._count?.assets ?? 0;
	const commentsCount = studio._count?.comments ?? 0;

	return (
		<Link
			href={`/studios/${studio.id}`}
			className="group block rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-neutral-300 hover:shadow-2xl"
		>
			<div className="flex items-start justify-between gap-3">
				<div>
					<span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.3em] text-neutral-500">
						<span className="h-2 w-2 rounded-full bg-green-500" />
						{visibilityCopy[studio.visibility] || studio.visibility}
					</span>
					<h3 className="mt-3 text-lg font-semibold text-neutral-900 group-hover:text-neutral-700">{studio.name}</h3>
					<p className="mt-3 text-sm text-neutral-600 line-clamp-3">{studio.description || 'Belum ada deskripsi ditambahkan.'}</p>
				</div>
				<div className="flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.3em] text-neutral-600">
					{studio._count?.members ?? 1} anggota
				</div>
			</div>
			<div className="mt-5 flex items-center justify-between text-xs text-neutral-500">
				<div className="flex items-center gap-3">
					<div className="flex -space-x-2">
						{memberInitials.slice(0, 3).map((member) => (
							<div
								key={member.id}
								className="flex h-7 w-7 items-center justify-center rounded-full border border-white bg-neutral-900 text-[11px] font-semibold text-white shadow-sm"
								title={member.name}
							>
								{member.initials}
							</div>
						))}
						{memberInitials.length === 0 && studio.owner ? (
							<div
								className="flex h-7 w-7 items-center justify-center rounded-full border border-white bg-neutral-200 text-[11px] font-semibold text-neutral-600"
								title={studio.owner.name}
							>
								{studio.owner.name.slice(0, 2).toUpperCase()}
							</div>
						) : null}
					</div>
					<div>
						<p className="font-semibold text-neutral-700">{studio.owner?.name || 'Owner tidak diketahui'}</p>
						<p className="text-[11px] text-neutral-400">Diperbarui {formatTimeAgo(studio.updatedAt)}</p>
					</div>
				</div>
				<div className="flex items-center gap-3 rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.3em] text-neutral-600">
					<span>{assetsCount} aset</span>
					<span>•</span>
					<span>{commentsCount} komentar</span>
				</div>
			</div>
		</Link>
	);
}


'use client';

import { useState } from 'react';
import { useToast } from '../context/ToastContext.jsx';

export default function CommentPanel({ comments, onSendComment }) {
	const [draft, setDraft] = useState('');
	const [sending, setSending] = useState(false);
	const [error, setError] = useState('');
	const { pushToast } = useToast();

	async function handleSubmit(event) {
		event.preventDefault();
		if (!draft) return;
		setSending(true);
		setError('');
		try {
			await onSendComment?.(draft);
			setDraft('');
			pushToast({
				title: 'Komentar terkirim',
				description: 'Diskusi tercatat di timeline.',
				variant: 'success'
			});
		} catch (err) {
			const message = err?.data?.message || 'Gagal mengirim komentar.';
			setError(typeof message === 'string' ? message : 'Gagal mengirim komentar.');
			pushToast({
				title: 'Komentar gagal dikirim',
				description: typeof message === 'string' ? message : 'Periksa koneksi atau coba ulang.',
				variant: 'error'
			});
		} finally {
			setSending(false);
		}
	}

	return (
		<div className="flex h-full flex-col bg-white text-neutral-900">
			<div className="border-b px-4 py-3">
				<h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-600">Diskusi</h3>
				<p className="text-xs text-neutral-400">Komentar akan membentuk histori revisi dan catatan produksi.</p>
			</div>
			<div className="flex-1 overflow-auto px-4 py-4">
				<div className="space-y-3">
					{comments.length === 0 ? (
						<p className="text-xs text-neutral-400">Belum ada komentar. Mulai diskusi dengan tim kamu.</p>
					) : (
						comments.map((comment) => (
							<div key={comment.id} className="rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm">
								<div className="text-xs font-semibold text-neutral-600">{comment.author?.name || 'Anonim'}</div>
								<p className="mt-1 text-neutral-700">{comment.content}</p>
							</div>
						))
					)}
				</div>
			</div>
			<form onSubmit={handleSubmit} className="border-t px-4 py-4">
				<div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2">
					<textarea
						className="h-20 w-full resize-none bg-transparent text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none"
						placeholder="Tinggalkan komentar atau catatan revisi..."
						value={draft}
						onChange={(event) => setDraft(event.target.value)}
					/>
				</div>
				{error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
				<div className="mt-3 flex justify-end">
					<button
						type="submit"
						disabled={sending}
						className="rounded-full bg-neutral-900 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{sending ? 'Mengirim…' : 'Post'}
					</button>
				</div>
			</form>
		</div>
	);
}


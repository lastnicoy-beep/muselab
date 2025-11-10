'use client';

import { useEffect, useState } from 'react';

const timeFormatter = new Intl.DateTimeFormat('id-ID', {
	hour: '2-digit',
	minute: '2-digit'
});

export default function ChatBox({ studioId, socket, currentUser }) {
	const [messages, setMessages] = useState([]);
	const [draft, setDraft] = useState('');

	useEffect(() => {
		if (!socket) return undefined;
		function handleIncoming(message) {
			setMessages((prev) => [...prev.slice(-99), message]);
		}
		socket.on('studio_chat', handleIncoming);
		return () => {
			socket.off('studio_chat', handleIncoming);
		};
	}, [socket]);

	function handleSubmit(event) {
		event.preventDefault();
		if (!draft.trim()) return;
		const payload = {
			id: crypto.randomUUID(),
			content: draft,
			user: currentUser?.name || 'Kolaborator',
			timestamp: new Date().toISOString()
		};
		setMessages((prev) => [...prev.slice(-99), payload]);
		socket?.emit('studio_chat', { studioId, payload });
		setDraft('');
	}

	return (
		<div className="border-t bg-white px-4 py-4 text-neutral-900">
			<h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">Chat realtime</h3>
			<div className="mt-3 h-40 overflow-auto rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
				{messages.length === 0 ? (
					<p className="text-xs text-neutral-400">Mulai percakapan untuk menyelaraskan ide secara cepat.</p>
				) : (
					messages.map((message) => (
						<div key={message.id} className="mb-2">
							<p className="text-xs font-semibold text-neutral-600">{message.user}</p>
							<p>{message.content}</p>
							<p className="text-[11px] text-neutral-400">{timeFormatter.format(new Date(message.timestamp))}</p>
						</div>
					))
				)}
			</div>
			<form className="mt-3 flex items-center gap-3" onSubmit={handleSubmit}>
				<input
					className="flex-1 rounded-full border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
					value={draft}
					onChange={(event) => setDraft(event.target.value)}
					placeholder="Kirim pesan singkat…"
				/>
				<button
					type="submit"
					className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-neutral-700"
				>
					Kirim
				</button>
			</form>
		</div>
	);
}


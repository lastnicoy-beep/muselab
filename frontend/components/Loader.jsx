'use client';

export default function Loader({ label = 'Memuat…' }) {
	return (
		<div className="flex flex-col items-center justify-center gap-2 py-12 text-neutral-400">
			<div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-700 border-t-orange-500" />
			<p className="text-sm uppercase tracking-[0.3em]">{label}</p>
		</div>
	);
}



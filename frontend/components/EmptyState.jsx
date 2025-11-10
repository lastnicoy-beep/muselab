'use client';

import Link from 'next/link';

export default function EmptyState({ title, description, actionLabel, actionHref, onAction }) {
	return (
		<div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-neutral-300 bg-white/60 py-14 text-center text-neutral-500">
			<h3 className="text-lg font-semibold text-neutral-800">{title}</h3>
			<p className="max-w-sm text-sm text-neutral-500">{description}</p>
			{actionHref ? (
				<Link href={actionHref} className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-700 transition">
					{actionLabel}
				</Link>
			) : null}
			{onAction ? (
				<button
					type="button"
					onClick={onAction}
					className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-semibold text-neutral-700 hover:border-neutral-500 transition"
				>
					{actionLabel}
				</button>
			) : null}
		</div>
	);
}



'use client';

import { useToast } from '../context/ToastContext.jsx';

const variantStyles = {
	default: 'bg-neutral-900/90 border-white/10 text-white',
	success: 'bg-emerald-500/90 border-emerald-300/60 text-white',
	error: 'bg-red-600/90 border-red-300/60 text-white',
	info: 'bg-blue-600/90 border-blue-300/60 text-white'
};

export default function ToastViewport() {
	const { toasts, removeToast } = useToast();

	return (
		<div className="fixed top-4 right-4 z-[9999] flex w-80 flex-col gap-3">
			{toasts.map((toast) => (
				<div
					key={toast.id}
					className={`rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur ${variantStyles[toast.variant] || variantStyles.default}`}
				>
					<div className="flex items-start justify-between gap-3">
						<div>
							{toast.title ? <p className="text-sm font-semibold leading-tight">{toast.title}</p> : null}
							{toast.description ? <p className="mt-1 text-xs leading-relaxed opacity-80">{toast.description}</p> : null}
						</div>
						<button
							type="button"
							onClick={() => removeToast(toast.id)}
							className="text-xs uppercase tracking-[0.3em] opacity-70 hover:opacity-100"
						>
							Close
						</button>
					</div>
				</div>
			))}
		</div>
	);
}



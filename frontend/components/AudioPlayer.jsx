'use client';

export default function AudioPlayer({ src }) {
	return (
		<div className="rounded-2xl border border-white/10 bg-neutral-900 px-3 py-3">
			<audio
				controls
				preload="metadata"
				className="w-full"
				src={src}
			/>
		</div>
	);
}



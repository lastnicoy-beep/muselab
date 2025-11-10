export default function Footer() {
	return (
		<footer className="bg-neutral-950 border-t border-white/5">
			<div className="max-w-6xl mx-auto px-6 py-10 text-neutral-400 text-sm">
				<div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
					<div>
						<p className="text-white font-semibold text-lg">MuseLab</p>
						<p className="mt-2 text-xs text-neutral-500">
							Platform kolaborasi kreatif real-time untuk seniman, musisi, penulis, dan desainer.
						</p>
					</div>
					<div className="flex gap-6 text-xs">
						<a href="https://muse.lab" className="hover:text-white transition" target="_blank" rel="noreferrer">
							Dokumentasi
						</a>
						<a href="mailto:team@muse.lab" className="hover:text-white transition">
							Dukungan
						</a>
						<a href="/showcase" className="hover:text-white transition">
							Showcase
						</a>
					</div>
				</div>
				<p className="mt-8 text-xs text-neutral-600">© {new Date().getFullYear()} MuseLab. All rights reserved.</p>
			</div>
		</footer>
	);
}



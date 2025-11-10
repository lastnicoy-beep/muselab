import Link from 'next/link';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const features = [
	{
		title: 'Kanvas Kolaboratif Real-Time',
		description:
			'Satu ruang kerja untuk menulis lirik, menempel moodboard, merekam ide audio, dan menggambar sketsa. Semua perubahan tersinkron otomatis.'
	},
	{
		title: 'Audio + Visual Mixer',
		description:
			'Layer audio, waveform marker, dan preview visual bekerja berdampingan. Tinggalkan komentar spesifik di timeline atau frame yang kamu pilih.'
	},
	{
		title: 'Komentar, Versi & Timeline',
		description:
			'Histori perubahan otomatis. Lacak siapa mengubah apa, rollback versi, dan diskusikan revisi tanpa harus keluar dari Studio.'
	}
];

const workflows = [
	{
		step: '1',
		title: 'Buat Studio',
		copy: 'Atur visibilitas (publik, privat, undangan) dan undang kolaborator utama. Tentukan peran Admin, Editor, dan Viewer.'
	},
	{
		step: '2',
		title: 'Bangun Kanvas',
		copy: 'Tambahkan track audio, catatan lirik, moodboard visual, atau embed referensi untuk menghasilkan karya lintas disiplin.'
	},
	{
		step: '3',
		title: 'Kolaborasi & Rilis',
		copy: 'Gunakan komentar realtime, versi otomatis, dan Showcase publik untuk merilis karya atau membuka remix/remake.'
	}
];

const highlights = [
	{
		title: 'Realtime Presence',
		description: 'Lihat kursor, avatar, dan aktivitas kolaborator secara langsung dengan Socket.io.',
		accent: '#FF6B00'
	},
	{
		title: 'AI Assist (Opsional)',
		description: 'Gunakan AI lyrics suggestor, color harmonizer, atau generator cover art untuk memicu inspirasi.',
		accent: '#3B82F6'
	},
	{
		title: 'Creative Credit',
		description: 'Integrasikan kredit kreator berbasis Web3 / NFT untuk menandai hak cipta digital.',
		accent: '#10B981'
	}
];

export default function HomePage() {
	return (
		<div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-50">
			<Navbar />
			<main className="flex-1">
				<section className="relative isolate overflow-hidden bg-neutral-950">
					<div className="absolute inset-0 -z-10 opacity-50 bg-[radial-gradient(circle_at_top,_#FF6B0066,_transparent_60%)]" />
					<div className="max-w-6xl mx-auto px-6 py-24">
						<div className="max-w-3xl">
							<span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-white/60">
								MuseLab
							</span>
							<h1 className="mt-6 text-5xl font-semibold leading-tight tracking-tight text-white">
								Web Kolaborasi Kreatif Real-Time untuk Seniman Multidisiplin
							</h1>
							<p className="mt-6 text-lg text-neutral-200">
								Pindah dari chat group, dokumen terpisah, dan revisi berantakan menuju satu Studio terpadu.
								MuseLab menghadirkan ruang kerja seperti Figma + SoundCloud + Notion untuk karya kreatif lintas media.
							</p>
							<div className="mt-10 flex flex-wrap items-center gap-4">
								<Link
									href="/auth?mode=register"
									className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/40 transition hover:bg-orange-400"
								>
									Daftar & Mulai Studio
								</Link>
								<Link
									href="/showcase"
									className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40"
								>
									Lihat Showcase Publik
								</Link>
								<p className="text-xs text-neutral-400">✨ Gratis 1 Studio aktif untuk tim hingga 3 orang.</p>
							</div>
						</div>
					</div>
				</section>

				<section id="features" className="bg-white text-neutral-900">
					<div className="max-w-6xl mx-auto px-6 py-20">
						<div className="text-center max-w-2xl mx-auto">
							<h2 className="text-3xl font-semibold tracking-tight">Dirancang untuk alur kreatif modern</h2>
							<p className="mt-4 text-neutral-600">
								Kolaborasi lintas disiplin jadi rapi dengan kombinasi workspace, chat, versioning, dan showcase dalam satu platform.
							</p>
						</div>
						<div className="mt-12 grid gap-8 md:grid-cols-3">
							{features.map((feature) => (
								<div key={feature.title} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm hover:shadow-md transition">
									<h3 className="text-lg font-semibold text-neutral-900">{feature.title}</h3>
									<p className="mt-3 text-sm leading-relaxed text-neutral-600">{feature.description}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				<section className="bg-neutral-100 text-neutral-900">
					<div className="max-w-6xl mx-auto px-6 py-20 grid gap-10 lg:grid-cols-2 items-center">
						<div className="space-y-6">
							<h2 className="text-3xl font-semibold tracking-tight">Studio MuseLab = Canvas + Mixer + Timeline</h2>
							<p className="text-neutral-600">
								Setiap Studio punya tiga panel utama: File & Asset, Canvas real-time, dan Percakapan & Timeline.
								Mode jam session memungkinkan audio sinkron, sementara mode penulisan membantu tim literasi kreatif.
							</p>
							<ul className="space-y-3 text-sm text-neutral-600">
								<li className="flex items-start gap-3">
									<span className="mt-1 h-2.5 w-2.5 rounded-full bg-orange-500" />
									Pengaturan hak akses granular (Admin, Editor, Viewer) per Studio.
								</li>
								<li className="flex items-start gap-3">
									<span className="mt-1 h-2.5 w-2.5 rounded-full bg-orange-500" />
									Upload audio, gambar, dan catatan teks dengan komentar inline.
								</li>
								<li className="flex items-start gap-3">
									<span className="mt-1 h-2.5 w-2.5 rounded-full bg-orange-500" />
									Version control otomatis dan histori perubahan transparan.
								</li>
							</ul>
							<div className="flex flex-wrap gap-3 pt-4">
								{highlights.map((item) => (
									<div key={item.title} className="rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
										<p className="text-xs font-medium uppercase tracking-wide" style={{ color: item.accent }}>
											{item.title}
										</p>
										<p className="mt-1 text-xs text-neutral-600">{item.description}</p>
									</div>
								))}
							</div>
						</div>
						<div className="relative">
							<div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-500/30 to-transparent blur-3xl" />
							<div className="relative rounded-3xl border border-white/10 bg-neutral-900/80 p-6 shadow-2xl backdrop-blur">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Live Studio</p>
										<h3 className="mt-2 text-xl font-semibold text-white">Jam Session — Aurora Collective</h3>
									</div>
									<span className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-200">● 5 online</span>
								</div>
								<div className="mt-6 grid gap-4 lg:grid-cols-2">
									<div className="rounded-xl bg-neutral-800 p-4">
										<p className="text-sm font-semibold text-white">Canvas</p>
										<div className="mt-3 h-32 rounded-lg border border-dashed border-neutral-700 bg-neutral-900/60" />
										<p className="mt-3 text-xs text-neutral-400">Edit teks, storyboard, atau moodboard secara bersama.</p>
									</div>
									<div className="rounded-xl bg-neutral-800 p-4">
										<p className="text-sm font-semibold text-white">Waveform</p>
										<div className="mt-3 h-32 rounded-lg bg-gradient-to-r from-orange-500/40 via-orange-400/20 to-orange-500/40" />
										<p className="mt-3 text-xs text-neutral-400">Marker komentar di setiap detik penting.</p>
									</div>
								</div>
								<div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
									<p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Timeline</p>
									<ul className="mt-3 space-y-2 text-xs text-neutral-400">
										<li>▹ Kayla menambahkan riff gitar &quot;Sunset Echo&quot;</li>
										<li>▹ Rafi memberi komentar di menit 1:42</li>
										<li>▹ Aiko memperbarui moodboard warna neon</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section id="workflow" className="bg-white text-neutral-900">
					<div className="max-w-6xl mx-auto px-6 py-20">
						<div className="grid gap-10 md:grid-cols-3">
							{workflows.map((item) => (
								<div key={item.step} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
									<span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-sm font-semibold text-white">
										{item.step}
									</span>
									<h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
									<p className="mt-3 text-sm text-neutral-600">{item.copy}</p>
								</div>
							))}
						</div>
						<div className="mt-16 rounded-3xl bg-neutral-900 px-8 py-12 text-center text-white">
							<h3 className="text-2xl font-semibold">Mulai gratis, upgrade saat Studio-mu tumbuh</h3>
							<p className="mt-3 text-neutral-300">
								Freemium dengan 10MB storage. Upgrade ke Pro untuk versioning audio tanpa batas dan Studio privat.
							</p>
							<div className="mt-6 flex justify-center gap-4">
								<Link href="/auth?mode=register" className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-400 transition">
									Register Sekarang
								</Link>
								<Link href="/studios" className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:border-white/40 transition">
									Dashboard Studio
								</Link>
							</div>
						</div>
					</div>
				</section>
			</main>
			<Footer />
		</div>
	);
}



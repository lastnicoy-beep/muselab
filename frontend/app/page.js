'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const features = [
	{
		title: 'Kanvas Kolaboratif Real-Time',
		description:
			'Satu ruang kerja untuk menulis lirik, menempel moodboard, merekam ide audio, dan menggambar sketsa. Semua perubahan tersinkron otomatis.',
		icon: '🎨'
	},
	{
		title: 'Audio + Visual Mixer',
		description:
			'Layer audio, waveform marker, dan preview visual bekerja berdampingan. Tinggalkan komentar spesifik di timeline atau frame yang kamu pilih.',
		icon: '🎵'
	},
	{
		title: 'Komentar, Versi & Timeline',
		description:
			'Histori perubahan otomatis. Lacak siapa mengubah apa, rollback versi, dan diskusikan revisi tanpa harus keluar dari Studio.',
		icon: '📝'
	}
];

const workflows = [
	{
		step: '1',
		title: 'Buat Studio',
		copy: 'Atur visibilitas (publik, privat, undangan) dan undang kolaborator utama. Tentukan peran Admin, Editor, dan Viewer.',
		icon: '✨'
	},
	{
		step: '2',
		title: 'Bangun Kanvas',
		copy: 'Tambahkan track audio, catatan lirik, moodboard visual, atau embed referensi untuk menghasilkan karya lintas disiplin.',
		icon: '🛠️'
	},
	{
		step: '3',
		title: 'Kolaborasi & Rilis',
		copy: 'Gunakan komentar realtime, versi otomatis, dan Showcase publik untuk merilis karya atau membuka remix/remake.',
		icon: '🚀'
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

const stats = [
	{ value: '10K+', label: 'Kreator Aktif' },
	{ value: '50K+', label: 'Studio Dibuat' },
	{ value: '1M+', label: 'Asset Dibagikan' },
	{ value: '99.9%', label: 'Uptime' }
];

const testimonials = [
	{
		name: 'Aiko Nakamura',
		role: 'Music Producer',
		quote: 'MuseLab mengubah cara tim kami berkolaborasi. Sekarang semua ide bisa langsung di-sync tanpa ribet.',
		avatar: '🎤'
	},
	{
		name: 'Rafi Aditya',
		role: 'Visual Artist',
		quote: 'Kolaborasi real-time dengan audio dan visual di satu tempat? Game changer untuk workflow kami.',
		avatar: '🎨'
	},
	{
		name: 'Kayla Chen',
		role: 'Creative Director',
		quote: 'Version control otomatis dan komentar inline membuat revisi jadi lebih efisien dan terorganisir.',
		avatar: '✨'
	}
];

const pricingPlans = [
	{
		name: 'FREE',
		price: '0',
		period: 'selamanya',
		features: [
			'1 Studio aktif',
			'Tim hingga 3 orang',
			'10MB storage',
			'Komentar real-time',
			'Version control dasar'
		],
		cta: 'Mulai Gratis',
		popular: false
	},
	{
		name: 'PRO',
		price: '99K',
		period: '/bulan',
		features: [
			'Studio tanpa batas',
			'Tim hingga 10 orang',
			'5GB storage',
			'Version control lengkap',
			'Priority support',
			'Export tanpa watermark'
		],
		cta: 'Upgrade ke Pro',
		popular: true
	},
	{
		name: 'ENTERPRISE',
		price: 'Custom',
		period: '',
		features: [
			'Studio unlimited',
			'Tim unlimited',
			'Storage custom',
			'Dedicated support',
			'Custom integrations',
			'SSO & advanced security'
		],
		cta: 'Hubungi Sales',
		popular: false
	}
];

const faqs = [
	{
		question: 'Apakah data saya aman?',
		answer: 'Ya, semua data dienkripsi dan disimpan dengan aman. Kami menggunakan best practices untuk keamanan data.'
	},
	{
		question: 'Bisakah saya upgrade kapan saja?',
		answer: 'Tentu! Anda bisa upgrade dari Free ke Pro kapan saja. Pembayaran akan diprorata untuk sisa bulan.'
	},
	{
		question: 'Apakah ada batasan untuk Free plan?',
		answer: 'Free plan mencakup 1 Studio aktif, tim hingga 3 orang, dan 10MB storage. Cukup untuk memulai kolaborasi kecil.'
	},
	{
		question: 'Bagaimana cara mengundang kolaborator?',
		answer: 'Setelah membuat Studio, Anda bisa mengundang kolaborator melalui email atau link undangan. Setiap orang bisa memiliki peran berbeda (Admin, Editor, Viewer).'
	}
];

export default function HomePage() {
	const [activeTestimonial, setActiveTestimonial] = useState(0);
	const [openFaq, setOpenFaq] = useState(null);

	useEffect(() => {
		const interval = setInterval(() => {
			setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
		}, 5000);
		return () => clearInterval(interval);
	}, []);

	return (
		<div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-50">
			<Navbar />
			<main className="flex-1">
				{/* Hero Section */}
				<section className="relative isolate overflow-hidden bg-neutral-950">
					<div className="absolute inset-0 -z-10 opacity-50 bg-[radial-gradient(circle_at_top,_#FF6B0066,_transparent_60%)]" />
					<div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
						<div className="max-w-3xl">
							<span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-white/60 animate-fade-in">
								MuseLab
							</span>
							<h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight text-white animate-fade-in-up">
								Web Kolaborasi Kreatif Real-Time untuk Seniman Multidisiplin
							</h1>
							<p className="mt-6 text-lg md:text-xl text-neutral-200 animate-fade-in-up animation-delay-200">
								Pindah dari chat group, dokumen terpisah, dan revisi berantakan menuju satu Studio terpadu.
								MuseLab menghadirkan ruang kerja seperti Figma + SoundCloud + Notion untuk karya kreatif lintas media.
							</p>
							<div className="mt-10 flex flex-wrap items-center gap-4 animate-fade-in-up animation-delay-400">
								<Link
									href="/auth?mode=register"
									className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/40 transition hover:bg-orange-400 hover:shadow-xl hover:shadow-orange-500/50 transform hover:scale-105"
								>
									Daftar & Mulai Studio
								</Link>
								<Link
									href="/showcase"
									className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/5 transform hover:scale-105"
								>
									Lihat Showcase Publik
								</Link>
								<p className="text-xs text-neutral-400">✨ Gratis 1 Studio aktif untuk tim hingga 3 orang.</p>
							</div>
						</div>
					</div>
				</section>

				{/* Stats Section */}
				<section className="bg-gradient-to-b from-neutral-950 to-neutral-900 border-y border-white/5">
					<div className="max-w-6xl mx-auto px-6 py-16">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
							{stats.map((stat, index) => (
								<div key={stat.label} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
									<div className="text-3xl md:text-4xl font-bold text-orange-500">{stat.value}</div>
									<div className="mt-2 text-xs md:text-sm text-neutral-400 uppercase tracking-wider">{stat.label}</div>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Features Section */}
				<section id="features" className="bg-white text-neutral-900">
					<div className="max-w-6xl mx-auto px-6 py-20">
						<div className="text-center max-w-2xl mx-auto">
							<h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Dirancang untuk alur kreatif modern</h2>
							<p className="mt-4 text-neutral-600">
								Kolaborasi lintas disiplin jadi rapi dengan kombinasi workspace, chat, versioning, dan showcase dalam satu platform.
							</p>
						</div>
						<div className="mt-12 grid gap-8 md:grid-cols-3">
							{features.map((feature, index) => (
								<div
									key={feature.title}
									className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
									style={{ animationDelay: `${index * 100}ms` }}
								>
									<div className="text-4xl mb-4">{feature.icon}</div>
									<h3 className="text-lg font-semibold text-neutral-900">{feature.title}</h3>
									<p className="mt-3 text-sm leading-relaxed text-neutral-600">{feature.description}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Studio Preview Section */}
				<section className="bg-neutral-100 text-neutral-900">
					<div className="max-w-6xl mx-auto px-6 py-20 grid gap-10 lg:grid-cols-2 items-center">
						<div className="space-y-6">
							<h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Studio MuseLab = Canvas + Mixer + Timeline</h2>
							<p className="text-neutral-600">
								Setiap Studio punya tiga panel utama: File & Asset, Canvas real-time, dan Percakapan & Timeline.
								Mode jam session memungkinkan audio sinkron, sementara mode penulisan membantu tim literasi kreatif.
							</p>
							<ul className="space-y-3 text-sm text-neutral-600">
								<li className="flex items-start gap-3">
									<span className="mt-1 h-2.5 w-2.5 rounded-full bg-orange-500 flex-shrink-0" />
									Pengaturan hak akses granular (Admin, Editor, Viewer) per Studio.
								</li>
								<li className="flex items-start gap-3">
									<span className="mt-1 h-2.5 w-2.5 rounded-full bg-orange-500 flex-shrink-0" />
									Upload audio, gambar, dan catatan teks dengan komentar inline.
								</li>
								<li className="flex items-start gap-3">
									<span className="mt-1 h-2.5 w-2.5 rounded-full bg-orange-500 flex-shrink-0" />
									Version control otomatis dan histori perubahan transparan.
								</li>
							</ul>
							<div className="flex flex-wrap gap-3 pt-4">
								{highlights.map((item) => (
									<div key={item.title} className="rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm hover:shadow-md transition">
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
									<span className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-200 animate-pulse">● 5 online</span>
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

				{/* Testimonials Section */}
				<section className="bg-neutral-950 text-white">
					<div className="max-w-6xl mx-auto px-6 py-20">
						<div className="text-center max-w-2xl mx-auto mb-12">
							<h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Dipercaya oleh Kreator</h2>
							<p className="mt-4 text-neutral-400">Lihat apa kata mereka tentang MuseLab</p>
						</div>
						<div className="relative">
							<div className="grid md:grid-cols-3 gap-6">
								{testimonials.map((testimonial, index) => (
									<div
										key={index}
										className={`rounded-2xl border p-6 transition-all duration-300 ${
											index === activeTestimonial
												? 'border-orange-500/50 bg-orange-500/10 shadow-lg shadow-orange-500/20'
												: 'border-white/10 bg-white/5'
										}`}
									>
										<div className="text-4xl mb-4">{testimonial.avatar}</div>
										<p className="text-sm text-neutral-300 italic">&quot;{testimonial.quote}&quot;</p>
										<div className="mt-4 pt-4 border-t border-white/10">
											<p className="text-sm font-semibold text-white">{testimonial.name}</p>
											<p className="text-xs text-neutral-400">{testimonial.role}</p>
										</div>
									</div>
								))}
							</div>
							<div className="flex justify-center gap-2 mt-8">
								{testimonials.map((_, index) => (
									<button
										key={index}
										type="button"
										onClick={() => setActiveTestimonial(index)}
										className={`h-2 rounded-full transition-all ${
											index === activeTestimonial ? 'w-8 bg-orange-500' : 'w-2 bg-white/20'
										}`}
										aria-label={`Go to testimonial ${index + 1}`}
									/>
								))}
							</div>
						</div>
					</div>
				</section>

				{/* Workflow Section */}
				<section id="workflow" className="bg-white text-neutral-900">
					<div className="max-w-6xl mx-auto px-6 py-20">
						<div className="text-center max-w-2xl mx-auto mb-12">
							<h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Cara Kerja</h2>
							<p className="mt-4 text-neutral-600">Mulai kolaborasi dalam 3 langkah sederhana</p>
						</div>
						<div className="grid gap-10 md:grid-cols-3">
							{workflows.map((item, index) => (
								<div key={item.step} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
									<div className="flex items-center gap-4">
										<span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-lg font-semibold text-white">
											{item.step}
										</span>
										<span className="text-2xl">{item.icon}</span>
									</div>
									<h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
									<p className="mt-3 text-sm text-neutral-600">{item.copy}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Pricing Section */}
				<section id="pricing" className="bg-neutral-100 text-neutral-900">
					<div className="max-w-6xl mx-auto px-6 py-20">
						<div className="text-center max-w-2xl mx-auto mb-12">
							<h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Pilih Plan yang Tepat</h2>
							<p className="mt-4 text-neutral-600">Mulai gratis, upgrade saat Studio-mu tumbuh</p>
						</div>
						<div className="grid gap-8 md:grid-cols-3">
							{pricingPlans.map((plan) => (
								<div
									key={plan.name}
									className={`rounded-3xl border p-8 relative ${
										plan.popular
											? 'border-orange-500 bg-white shadow-xl scale-105'
											: 'border-neutral-200 bg-white shadow-sm'
									}`}
								>
									{plan.popular && (
										<span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-4 py-1 text-xs font-semibold text-white">
											Paling Populer
										</span>
									)}
									<div className="text-center">
										<h3 className="text-2xl font-bold">{plan.name}</h3>
										<div className="mt-4">
											<span className="text-4xl font-bold">{plan.price}</span>
											{plan.period && <span className="text-neutral-600 ml-2">{plan.period}</span>}
										</div>
									</div>
									<ul className="mt-8 space-y-3">
										{plan.features.map((feature) => (
											<li key={feature} className="flex items-start gap-3">
												<span className="text-green-500 mt-0.5">✓</span>
												<span className="text-sm text-neutral-600">{feature}</span>
											</li>
										))}
									</ul>
									<Link
										href={plan.name === 'ENTERPRISE' ? 'mailto:team@muse.lab' : plan.name === 'PRO' ? '/payment' : '/auth?mode=register'}
										className={`mt-8 w-full block text-center rounded-full px-6 py-3 text-sm font-semibold transition ${
											plan.popular
												? 'bg-orange-500 text-white hover:bg-orange-400'
												: 'border border-neutral-300 text-neutral-900 hover:bg-neutral-50'
										}`}
									>
										{plan.cta}
									</Link>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* FAQ Section */}
				<section id="faq" className="bg-white text-neutral-900">
					<div className="max-w-3xl mx-auto px-6 py-20">
						<div className="text-center mb-12">
							<h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Pertanyaan Umum</h2>
							<p className="mt-4 text-neutral-600">Temukan jawaban untuk pertanyaan yang sering diajukan</p>
						</div>
						<div className="space-y-4">
							{faqs.map((faq, index) => (
								<div key={index} className="rounded-xl border border-neutral-200 overflow-hidden">
									<button
										type="button"
										onClick={() => setOpenFaq(openFaq === index ? null : index)}
										className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-neutral-50 transition"
									>
										<span className="font-semibold text-neutral-900">{faq.question}</span>
										<span className={`text-neutral-400 transition-transform ${openFaq === index ? 'rotate-180' : ''}`}>
											▼
										</span>
									</button>
									{openFaq === index && (
										<div className="px-6 pb-4 text-sm text-neutral-600 animate-fade-in">{faq.answer}</div>
									)}
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Final CTA Section */}
				<section className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
					<div className="max-w-6xl mx-auto px-6 py-20 text-center">
						<h2 className="text-3xl md:text-4xl font-semibold">Siap Memulai Kolaborasi?</h2>
						<p className="mt-4 text-lg text-orange-50">
							Bergabunglah dengan ribuan kreator yang sudah menggunakan MuseLab untuk menghasilkan karya luar biasa.
						</p>
						<div className="mt-8 flex flex-wrap justify-center gap-4">
							<Link
								href="/auth?mode=register"
								className="rounded-full bg-white px-8 py-4 text-sm font-semibold text-orange-600 shadow-lg transition hover:bg-orange-50 hover:shadow-xl transform hover:scale-105"
							>
								Daftar Gratis Sekarang
							</Link>
							<Link
								href="/showcase"
								className="rounded-full border-2 border-white px-8 py-4 text-sm font-semibold text-white transition hover:bg-white/10 transform hover:scale-105"
							>
								Jelajahi Showcase
							</Link>
						</div>
					</div>
				</section>
			</main>
			<Footer />
		</div>
	);
}

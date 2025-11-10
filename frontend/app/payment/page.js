'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { get, post, put } from '../../lib/api';
import Navbar from '../../components/Navbar.jsx';
import Loader from '../../components/Loader.jsx';

const PLANS = [
	{
		id: 'PRO',
		name: 'Pro',
		price: 50000,
		features: [
			'Unlimited studios',
			'10GB storage',
			'Priority support',
			'Advanced collaboration tools',
			'Export in HD'
		]
	},
	{
		id: 'ENTERPRISE',
		name: 'Enterprise',
		price: 200000,
		features: [
			'Everything in Pro',
			'Unlimited storage',
			'24/7 support',
			'Custom integrations',
			'Team management',
			'Analytics dashboard'
		]
	}
];

export default function PaymentPage() {
	const router = useRouter();
	const { loading: authLoading, isAuthenticated, user, token } = useAuth();
	const { pushToast } = useToast();
	const [selectedPlan, setSelectedPlan] = useState(null);
	const [paymentMethod, setPaymentMethod] = useState('MANDIRI');
	const [loading, setLoading] = useState(false);
	const [payment, setPayment] = useState(null);
	const [proofUrl, setProofUrl] = useState('');
	const [notes, setNotes] = useState('');

	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push('/auth?mode=login');
		}
	}, [authLoading, isAuthenticated, router]);

	async function handleCreatePayment() {
		if (!selectedPlan) {
			pushToast({ title: 'Pilih plan', description: 'Silakan pilih plan terlebih dahulu', variant: 'error' });
			return;
		}

		setLoading(true);
		try {
			const result = await post(
				'/api/payments',
				{
					plan: selectedPlan,
					method: paymentMethod,
					amount: PLANS.find(p => p.id === selectedPlan)?.price
				},
				{ auth: true, token }
			);
			setPayment(result.payment);
			pushToast({ title: 'Pembayaran dibuat', description: 'Silakan lakukan pembayaran sesuai instruksi', variant: 'success' });
		} catch (err) {
			const message = err?.data?.message || 'Gagal membuat pembayaran';
			pushToast({ title: 'Error', description: message, variant: 'error' });
		} finally {
			setLoading(false);
		}
	}

	async function handleUploadProof() {
		if (!proofUrl) {
			pushToast({ title: 'URL bukti diperlukan', description: 'Masukkan URL bukti pembayaran', variant: 'error' });
			return;
		}

		setLoading(true);
		try {
			await put(`/api/payments/${payment.id}/proof`, { proofUrl, notes }, { auth: true, token });
			pushToast({ title: 'Bukti diunggah', description: 'Bukti pembayaran akan diverifikasi oleh admin', variant: 'success' });
			setPayment(prev => ({ ...prev, proofUrl, notes, status: 'PENDING' }));
		} catch (err) {
			const message = err?.data?.message || 'Gagal mengunggah bukti';
			pushToast({ title: 'Error', description: message, variant: 'error' });
		} finally {
			setLoading(false);
		}
	}

	if (authLoading || !isAuthenticated) {
		return (
			<div className="min-h-screen bg-neutral-950 text-white">
				<Navbar />
				<div className="flex h-[calc(100vh-4rem)] items-center justify-center">
					<Loader label="Memuat..." />
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-neutral-950 text-white">
			<Navbar />
			<main className="max-w-6xl mx-auto px-6 py-14">
				<header className="mb-12">
					<h1 className="text-4xl font-semibold tracking-tight">Upgrade Plan</h1>
					<p className="mt-3 text-sm text-neutral-300">Pilih plan yang sesuai dengan kebutuhan kolaborasi kreatifmu</p>
				</header>

				{!payment ? (
					<>
						<div className="grid gap-6 md:grid-cols-2 mb-12">
							{PLANS.map((plan) => (
								<div
									key={plan.id}
									onClick={() => setSelectedPlan(plan.id)}
									className={`rounded-3xl border p-6 cursor-pointer transition ${
										selectedPlan === plan.id
											? 'border-orange-500 bg-orange-500/10'
											: 'border-white/10 bg-white/5 hover:border-white/20'
									}`}
								>
									<div className="flex items-center justify-between mb-4">
										<h3 className="text-2xl font-semibold">{plan.name}</h3>
										<div className="text-right">
											<p className="text-3xl font-bold">Rp {plan.price.toLocaleString('id-ID')}</p>
											<p className="text-xs text-neutral-400">per bulan</p>
										</div>
									</div>
									<ul className="space-y-2 text-sm text-neutral-300">
										{plan.features.map((feature, idx) => (
											<li key={idx} className="flex items-center gap-2">
												<span className="text-orange-500">✓</span>
												{feature}
											</li>
										))}
									</ul>
								</div>
							))}
						</div>

						<div className="rounded-3xl border border-white/10 bg-white/5 p-6 mb-6">
							<h3 className="text-lg font-semibold mb-4">Metode Pembayaran</h3>
							<div className="flex gap-4">
								<button
									type="button"
									onClick={() => setPaymentMethod('MANDIRI')}
									className={`flex-1 rounded-2xl border p-4 transition ${
										paymentMethod === 'MANDIRI'
											? 'border-orange-500 bg-orange-500/10'
											: 'border-white/10 hover:border-white/20'
									}`}
								>
									<div className="text-center">
										<p className="font-semibold">Bank Mandiri</p>
										<p className="text-xs text-neutral-400 mt-1">Transfer Bank</p>
									</div>
								</button>
								<button
									type="button"
									onClick={() => setPaymentMethod('QRIS')}
									className={`flex-1 rounded-2xl border p-4 transition ${
										paymentMethod === 'QRIS'
											? 'border-orange-500 bg-orange-500/10'
											: 'border-white/10 hover:border-white/20'
									}`}
								>
									<div className="text-center">
										<p className="font-semibold">QRIS</p>
										<p className="text-xs text-neutral-400 mt-1">Scan QR Code</p>
									</div>
								</button>
							</div>
						</div>

						<button
							type="button"
							onClick={handleCreatePayment}
							disabled={loading || !selectedPlan}
							className="w-full rounded-full bg-orange-500 px-6 py-4 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? 'Memproses...' : 'Lanjutkan Pembayaran'}
						</button>
					</>
				) : (
					<div className="space-y-6">
						<div className="rounded-3xl border border-white/10 bg-white/5 p-6">
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-lg font-semibold">Instruksi Pembayaran</h3>
								<span
									className={`rounded-full px-3 py-1 text-xs font-semibold ${
										payment.status === 'VERIFIED'
											? 'bg-green-500/20 text-green-300'
											: payment.status === 'REJECTED'
											? 'bg-red-500/20 text-red-300'
											: 'bg-yellow-500/20 text-yellow-300'
									}`}
								>
									{payment.status === 'VERIFIED'
										? 'Terverifikasi'
										: payment.status === 'REJECTED'
										? 'Ditolak'
										: 'Menunggu Verifikasi'}
								</span>
							</div>

							{payment.method === 'MANDIRI' ? (
								<div className="space-y-4 text-sm">
									<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
										<p className="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-2">Bank Mandiri</p>
										<p className="text-2xl font-mono font-semibold mb-1">1080028325505</p>
										<p className="text-neutral-300">RIYAN PERDHANA PUTRA</p>
									</div>
									<div className="space-y-2">
										<p className="font-semibold">Jumlah Transfer:</p>
										<p className="text-2xl font-bold text-orange-500">
											Rp {payment.amount.toLocaleString('id-ID')}
										</p>
									</div>
									<div className="space-y-2">
										<p className="font-semibold">Referensi:</p>
										<p className="font-mono text-neutral-300">{payment.reference}</p>
									</div>
									<div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4">
										<p className="font-semibold mb-2">Cara Pembayaran:</p>
										<ol className="list-decimal list-inside space-y-1 text-neutral-300">
											<li>Transfer ke rekening Bank Mandiri di atas</li>
											<li>Pastikan jumlah transfer sesuai</li>
											<li>Gunakan referensi: {payment.reference}</li>
											<li>Upload bukti transfer di bawah</li>
										</ol>
									</div>
								</div>
							) : (
								<div className="space-y-4 text-sm">
									<div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
										<p className="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-4">QRIS</p>
										<div className="bg-white p-4 rounded-2xl inline-block mb-4">
											{/* QRIS Image - Place image at frontend/public/qris.png or qris.jpg */}
											<img
												src="/qris.png"
												alt="QRIS Payment Code"
												className="w-64 h-64 object-contain mx-auto"
												onError={(e) => {
													// Fallback jika image tidak ditemukan
													e.target.style.display = 'none';
													e.target.nextElementSibling.style.display = 'flex';
												}}
											/>
											<div className="w-64 h-64 bg-neutral-200 flex items-center justify-center text-neutral-500 mx-auto" style={{ display: 'none' }}>
												<p className="text-xs text-center px-4">
													QRIS Image<br />
													Place qris.png in /public folder
												</p>
											</div>
										</div>
										<p className="text-neutral-300 font-semibold">RIYAN PERDHANA PUTRA</p>
										<p className="text-xs text-neutral-400 mt-1">WEBSIT, DIGITAL & KREATIF</p>
										<p className="text-xs text-neutral-400 mt-1">NMID: ID1025445733781</p>
									</div>
									<div className="space-y-2">
										<p className="font-semibold">Jumlah Pembayaran:</p>
										<p className="text-2xl font-bold text-orange-500">
											Rp {payment.amount.toLocaleString('id-ID')}
										</p>
									</div>
									<div className="space-y-2">
										<p className="font-semibold">Referensi:</p>
										<p className="font-mono text-neutral-300">{payment.reference}</p>
									</div>
									<div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4">
										<p className="font-semibold mb-2">Cara Pembayaran:</p>
										<ol className="list-decimal list-inside space-y-1 text-neutral-300">
											<li>Buka aplikasi pembayaran dengan logo QRIS</li>
											<li>Scan QR code di atas</li>
											<li>Cek jumlah pembayaran</li>
											<li>Lakukan pembayaran</li>
											<li>Upload bukti pembayaran di bawah</li>
										</ol>
									</div>
								</div>
							)}
						</div>

						{payment.status === 'PENDING' && !payment.proofUrl && (
							<div className="rounded-3xl border border-white/10 bg-white/5 p-6">
								<h3 className="text-lg font-semibold mb-4">Upload Bukti Pembayaran</h3>
								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium mb-2">URL Bukti Pembayaran</label>
										<input
											type="url"
											value={proofUrl}
											onChange={(e) => setProofUrl(e.target.value)}
											placeholder="https://example.com/proof.jpg"
											className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-neutral-500 focus:border-orange-500 focus:outline-none"
										/>
										<p className="mt-1 text-xs text-neutral-400">
											Upload bukti ke imgur, cloudinary, atau hosting lainnya, lalu masukkan URL di sini
										</p>
									</div>
									<div>
										<label className="block text-sm font-medium mb-2">Catatan (Opsional)</label>
										<textarea
											value={notes}
											onChange={(e) => setNotes(e.target.value)}
											placeholder="Tambahkan catatan jika diperlukan..."
											rows={3}
											className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-neutral-500 focus:border-orange-500 focus:outline-none"
										/>
									</div>
									<button
										type="button"
										onClick={handleUploadProof}
										disabled={loading || !proofUrl}
										className="w-full rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{loading ? 'Mengunggah...' : 'Upload Bukti'}
									</button>
								</div>
							</div>
						)}

						{payment.proofUrl && (
							<div className="rounded-3xl border border-green-500/30 bg-green-500/10 p-6">
								<p className="font-semibold mb-2">Bukti Pembayaran Terunggah</p>
								<a
									href={payment.proofUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-orange-400 hover:text-orange-300 underline"
								>
									Lihat bukti pembayaran
								</a>
								<p className="mt-2 text-sm text-neutral-300">
									Bukti pembayaran sedang menunggu verifikasi dari admin. Kami akan menghubungi Anda setelah
									verifikasi selesai.
								</p>
							</div>
						)}

						<button
							type="button"
							onClick={() => router.push('/studios')}
							className="w-full rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
						>
							Kembali ke Dashboard
						</button>
					</div>
				)}
			</main>
		</div>
	);
}


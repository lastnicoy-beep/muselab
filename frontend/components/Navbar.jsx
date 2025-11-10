'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const navItems = [
	{ href: '/studios', label: 'Studios' },
	{ href: '/showcase', label: 'Showcase' },
	{ href: '/#features', label: 'Fitur' },
	{ href: '/#workflow', label: 'Workflow' }
];

export default function Navbar() {
	const { isAuthenticated, user, loading, logout } = useAuth();
	const router = useRouter();
	const pathname = usePathname();

	const initials = useMemo(() => {
		if (!user?.name) return 'MU';
		const parts = user.name.trim().split(' ');
		const first = parts.shift() || '';
		const last = parts.pop() || '';
		const joined = `${first.charAt(0)}${last.charAt(0)}`.trim();
		return (joined || first.slice(0, 2) || 'MU').toUpperCase();
	}, [user]);

	return (
		<header className="sticky top-0 z-30 border-b border-white/10 bg-neutral-950/70 backdrop-blur">
			<div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-6 text-sm text-white">
				<Link href="/" className="text-lg font-semibold tracking-tight">MuseLab</Link>
				<nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-[0.25em] text-neutral-400">
					{navItems.map((item) => (
						<Link
							key={item.href}
							className={`transition hover:text-white ${pathname === item.href ? 'text-white' : ''}`}
							href={item.href}
						>
							{item.label}
						</Link>
					))}
				</nav>
				{loading ? (
					<div className="h-8 w-32 animate-pulse rounded-full bg-white/10" />
				) : isAuthenticated ? (
					<div className="flex items-center gap-3">
						<div className="hidden text-right md:block">
							<p className="text-xs font-semibold text-white leading-tight">{user?.name}</p>
							<p className="text-[11px] uppercase tracking-[0.3em] text-neutral-400">
								{user?.plan || 'FREE'} • {user?.role || 'Editor'}
							</p>
						</div>
						{(user?.plan === 'FREE' || !user?.plan) && (
							<Link
								href="/payment"
								className="hidden rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-orange-400 md:block"
							>
								Upgrade
							</Link>
						)}
						<button
							type="button"
							onClick={() => router.push('/studios')}
							className={`hidden rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition md:block ${
								pathname.startsWith('/studios') ? 'border-white text-white' : 'border-white/20 text-neutral-200 hover:border-white/40 hover:text-white'
							}`}
						>
							Dashboard
						</button>
						<button
							type="button"
							onClick={() => {
								logout();
								router.push('/');
							}}
							className="text-xs uppercase tracking-[0.25em] text-neutral-400 hover:text-white transition md:hidden"
						>
							Logout
						</button>
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-neutral-900">
							{initials}
						</div>
						<button
							type="button"
							onClick={() => {
								logout();
								router.push('/');
							}}
							className="hidden rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-neutral-200 transition hover:border-white/40 hover:text-white md:flex"
						>
							Logout
						</button>
					</div>
				) : (
					<div className="flex items-center gap-3 text-xs">
						<Link href="/auth?mode=login" className="text-neutral-300 hover:text-white transition">Login</Link>
						<Link href="/auth?mode=register" className="rounded-full bg-white px-4 py-2 font-semibold text-neutral-900 hover:bg-neutral-200 transition">
							Register
						</Link>
					</div>
				)}
			</div>
		</header>
	);
}



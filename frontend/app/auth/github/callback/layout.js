// Force dynamic rendering untuk halaman callback
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function CallbackLayout({ children }) {
	return children;
}


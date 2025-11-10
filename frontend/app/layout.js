export const metadata = {
	title: 'MuseLab',
	description: 'Kolaborasi kreatif real-time'
};

import '../styles/globals.css';
import Providers from '../components/Providers.jsx';
import { Analytics } from '@vercel/analytics/next';

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body className="bg-neutral-50 text-neutral-900">
				<Providers>
					{children}
				</Providers>
				<Analytics />
			</body>
		</html>
	);
}



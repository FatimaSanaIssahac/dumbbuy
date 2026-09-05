import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Can I Afford This? | Sarcastic AI Financial Judge',
  description: 'Determine whether you have enough money to buy an unnecessarily useless thing. Rejecting responsible decisions since 2026.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased bg-grid-pattern selection:bg-purple-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

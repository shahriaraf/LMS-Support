import type { Metadata } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../lib/auth-context';
import Navbar from '../components/Navbar';

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LMS Support Console',
  description:
    'A working mini LMS paired with a real Support Engineer Dashboard for triaging, investigating, and resolving production issues.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`} style={{ ['--font-display' as any]: 'var(--font-body)' }}>
      <body>
        <AuthProvider>
          <Navbar />
          <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}

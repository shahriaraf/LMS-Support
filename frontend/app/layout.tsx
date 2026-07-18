import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth-context';
import Navbar from '../components/Navbar';

export const metadata: Metadata = {
  title: 'LMS Support & Troubleshooting Dashboard',
  description: 'A mini LMS with a real Support Engineer Dashboard for debugging simulated production issues.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}

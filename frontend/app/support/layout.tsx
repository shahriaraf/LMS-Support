'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';

const TABS = [
  { href: '/support', label: 'Overview' },
  { href: '/support/issues', label: 'Issues' },
  { href: '/support/courses', label: 'Courses' },
  { href: '/support/logs', label: 'Logs' },
  { href: '/support/payments', label: 'Payments' },
  { href: '/support/browser-check', label: 'Browser Check' },
  { href: '/support/settings', label: 'Settings' },
];

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) return <p className="text-gray-500">Loading…</p>;

  if (!user) {
    return (
      <div className="card p-6 text-center">
        <p className="mb-4">Log in with a support_engineer account to access this dashboard.</p>
        <Link href="/login" className="btn-primary">
          Log in
        </Link>
      </div>
    );
  }

  if (user.role !== 'support_engineer' && user.role !== 'admin') {
    return (
      <div className="card p-6 text-center">
        <p>Your account ({user.role}) doesn&apos;t have access to the Support Dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Support Engineer Dashboard</h1>
        <p className="text-gray-500 text-sm">Live view of real backend state - nothing here is a screenshot.</p>
      </div>
      <div className="flex gap-2 border-b border-[#262b38] pb-2 flex-wrap">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={
              'px-3 py-1.5 rounded-md text-sm ' +
              (pathname === t.href ? 'bg-accent text-white' : 'text-gray-400 hover:text-white')
            }
          >
            {t.label}
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
}

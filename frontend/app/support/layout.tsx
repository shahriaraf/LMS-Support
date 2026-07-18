'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Flag,
  BookOpen,
  ScrollText,
  Receipt,
  Monitor,
  SlidersHorizontal,
  LogIn,
  ShieldOff,
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';

const TABS = [
  { href: '/support', label: 'Overview', icon: LayoutGrid },
  { href: '/support/issues', label: 'Issues', icon: Flag },
  { href: '/support/courses', label: 'Courses', icon: BookOpen },
  { href: '/support/logs', label: 'Logs', icon: ScrollText },
  { href: '/support/payments', label: 'Payments', icon: Receipt },
  { href: '/support/browser-check', label: 'Browser check', icon: Monitor },
  { href: '/support/settings', label: 'Settings', icon: SlidersHorizontal },
];

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) return <p className="text-sm text-ui-faint">Loading…</p>;

  if (!user) {
    return (
      <div className="surface p-8 text-center max-w-sm mx-auto mt-8">
        <span className="icon-chip tint-signal mx-auto mb-3">
          <LogIn size={15} />
        </span>
        <p className="text-sm text-ui-muted mb-4">Log in with a support engineer account to access this console.</p>
        <Link href="/login" className="btn btn-primary">
          Log in
        </Link>
      </div>
    );
  }

  if (user.role !== 'support_engineer' && user.role !== 'admin') {
    return (
      <div className="surface rail rail-danger p-8 text-center max-w-sm mx-auto mt-8">
        <span className="icon-chip tint-danger mx-auto mb-3">
          <ShieldOff size={15} />
        </span>
        <p className="text-sm text-ui-muted">
          Your account (<span className="font-mono text-ui-text">{user.role}</span>) doesn&rsquo;t have access to
          the support console.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-semibold">Support console</h1>
        <p className="text-sm text-ui-faint mt-1">Live backend state — nothing on this page is a screenshot.</p>
      </div>
      <div className="flex gap-1 border-b border-line overflow-x-auto">
        {TABS.map((t) => {
          const active = pathname === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={
                'flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 -mb-px whitespace-nowrap transition-colors ' +
                (active ? 'border-signal text-ui-text' : 'border-transparent text-ui-muted hover:text-ui-text')
              }
            >
              <t.icon size={14} />
              {t.label}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, LayoutDashboard, LifeBuoy, LogOut, Terminal } from 'lucide-react';
import { useAuth } from '../lib/auth-context';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/');
  }

  const navItem = (href: string, label: string, Icon: typeof BookOpen, active: boolean) => (
    <Link
      href={href}
      className={
        'flex items-center gap-1.5 text-sm px-2.5 py-1.5 rounded-sm transition-colors ' +
        (active ? 'text-ui-text' : 'text-ui-muted hover:text-ui-text')
      }
    >
      <Icon size={15} strokeWidth={2} />
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-20 header-blur border-b border-line">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-7">
          <Link href="/" className="flex items-center gap-2 font-display font-semibold text-[15px] tracking-tight">
            <span className="icon-chip tint-signal">
              <Terminal size={15} strokeWidth={2.25} />
            </span>
            LMS<span className="text-signal">Console</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            {navItem('/courses', 'Courses', BookOpen, pathname === '/courses' || pathname.startsWith('/courses/'))}
            {user && navItem('/dashboard', 'My learning', LayoutDashboard, pathname.startsWith('/dashboard'))}
            {user &&
              (user.role === 'support_engineer' || user.role === 'admin') &&
              navItem('/support', 'Support console', LifeBuoy, pathname.startsWith('/support'))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex flex-col items-end leading-tight mr-1">
                <span className="text-sm text-ui-text">{user.name}</span>
                <span className="text-[11px] font-mono text-ui-faint uppercase tracking-wide">{user.role}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm" aria-label="Log out">
                <LogOut size={14} />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary btn-sm">
                Log in
              </Link>
              <Link href="/signup" className="btn btn-primary btn-sm">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

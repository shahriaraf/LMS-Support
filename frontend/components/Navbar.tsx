'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <header className="border-b border-[#262b38]">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-lg tracking-tight">
            LMS<span className="text-accent">Support</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-gray-300">
            <Link href="/courses" className={pathname === '/courses' ? 'text-white' : ''}>
              Courses
            </Link>
            {user && (
              <Link href="/dashboard" className={pathname === '/dashboard' ? 'text-white' : ''}>
                My Dashboard
              </Link>
            )}
            {user && (user.role === 'support_engineer' || user.role === 'admin') && (
              <Link href="/support" className={pathname.startsWith('/support') ? 'text-white' : ''}>
                Support Dashboard
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <span className="text-gray-400">
                {user.name} <span className="text-gray-600">({user.role})</span>
              </span>
              <button onClick={handleLogout} className="btn-secondary">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-secondary">
                Log in
              </Link>
              <Link href="/signup" className="btn-primary">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

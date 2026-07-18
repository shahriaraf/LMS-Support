'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { ApiError } from '../../lib/api';

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'support_engineer'>('student');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signup(name, email, password, role);
      router.push(role === 'support_engineer' ? '/support' : '/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-6">
      <div className="mb-6">
        <span className="icon-chip tint-signal mb-3">
          <UserPlus size={15} />
        </span>
        <h1 className="text-xl font-display font-semibold">Create an account</h1>
        <p className="text-sm text-ui-muted mt-1">Set up a student or support engineer account.</p>
      </div>
      <form onSubmit={handleSubmit} className="surface p-6 space-y-4">
        <div>
          <label className="field-label">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} autoFocus />
        </div>
        <div>
          <label className="field-label">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="field-label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <div>
          <label className="field-label">Account type</label>
          <select value={role} onChange={(e) => setRole(e.target.value as any)}>
            <option value="student">Student</option>
            <option value="support_engineer">Support engineer</option>
          </select>
          <p className="text-xs text-ui-faint mt-1.5">
            Support engineer accounts unlock the debugging console. Exposed here only for this demo —
            never let a client choose its own role in production.
          </p>
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Sign up'}
        </button>
      </form>
    </div>
  );
}

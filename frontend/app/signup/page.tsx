'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
    <div className="max-w-md mx-auto card p-6">
      <h1 className="text-xl font-bold mb-4">Create an account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-gray-400">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
        </div>
        <div>
          <label className="text-sm text-gray-400">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="text-sm text-gray-400">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <div>
          <label className="text-sm text-gray-400">Account type</label>
          <select value={role} onChange={(e) => setRole(e.target.value as any)}>
            <option value="student">Student</option>
            <option value="support_engineer">Support Engineer</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Support Engineer accounts get access to the debugging dashboard. This is only exposed
            client-side for this demo - never do this in a real product.
          </p>
        </div>
        {error && <p className="text-danger text-sm">{error}</p>}
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Sign up'}
        </button>
      </form>
    </div>
  );
}

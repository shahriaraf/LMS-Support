'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, setToken } from './api';
import { User } from './types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string, role?: 'student' | 'support_engineer') => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('lms_user') : null;
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        // ignore corrupted local storage
      }
    }
    setLoading(false);
  }, []);

  function persist(u: User, token: string) {
    setToken(token);
    window.localStorage.setItem('lms_user', JSON.stringify(u));
    setUser(u);
  }

  async function login(email: string, password: string) {
    const res = await api.post<{ accessToken: string; user: User }>('/auth/login', { email, password });
    persist(res.user, res.accessToken);
    return res.user;
  }

  async function signup(
    name: string,
    email: string,
    password: string,
    role: 'student' | 'support_engineer' = 'student',
  ) {
    const res = await api.post<{ accessToken: string; user: User }>('/auth/signup', {
      name,
      email,
      password,
      role,
    });
    persist(res.user, res.accessToken);
    return res.user;
  }

  function logout() {
    setToken(null);
    window.localStorage.removeItem('lms_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

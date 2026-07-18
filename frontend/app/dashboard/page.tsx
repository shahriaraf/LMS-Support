'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, LogIn, Receipt } from 'lucide-react';
import { api } from '../../lib/api';
import { Enrollment, Course, Payment } from '../../lib/types';
import { useAuth } from '../../lib/auth-context';

const STATUS_TONE: Record<string, string> = {
  active: 'badge-ok',
  pending_payment: 'badge-warn',
  cancelled: 'badge-neutral',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Record<string, Course>>({});
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (!user) return;
    api.get<Enrollment[]>('/enrollments/me').then(setEnrollments).catch(() => undefined);
    api.get<Payment[]>('/payments/me').then(setPayments).catch(() => undefined);
    api
      .get<Course[]>('/courses')
      .then((all) => setCourses(Object.fromEntries(all.map((c) => [c._id, c]))))
      .catch(() => undefined);
  }, [user]);

  if (!user) {
    return (
      <div className="surface p-8 text-center max-w-sm mx-auto mt-8">
        <span className="icon-chip tint-signal mx-auto mb-3">
          <LogIn size={15} />
        </span>
        <p className="text-sm text-ui-muted mb-4">Log in to see your dashboard.</p>
        <Link href="/login" className="btn btn-primary">
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-2">
        <LayoutDashboard size={18} className="text-signal" />
        <h1 className="text-xl font-display font-semibold">My learning</h1>
      </div>

      <section>
        <h2 className="text-sm font-medium text-ui-muted mb-3">Enrollments</h2>
        {enrollments.length === 0 && <p className="text-sm text-ui-faint">No enrollments yet — browse the catalog to get started.</p>}
        <div className="grid md:grid-cols-2 gap-3">
          {enrollments.map((e) => {
            const course = courses[e.courseId];
            return (
              <Link key={e._id} href={`/courses/${e.courseId}`} className="card p-4 flex justify-between items-center">
                <span className="font-medium text-sm">{course?.title || e.courseId}</span>
                <span className={`badge ${STATUS_TONE[e.status] || 'badge-neutral'}`}>
                  <span className="badge-dot" />
                  {e.status.replace('_', ' ')}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Receipt size={14} className="text-ui-muted" />
          <h2 className="text-sm font-medium text-ui-muted">Payment history</h2>
        </div>
        {payments.length === 0 && <p className="text-sm text-ui-faint">No payments yet.</p>}
        <div className="surface divide-line">
          {payments.map((p) => (
            <div key={p._id} className="p-3.5 flex justify-between items-center text-sm">
              <div>
                <p>{courses[p.courseId]?.title || p.courseId}</p>
                <p className="text-ui-faint text-xs font-mono mt-0.5">
                  ${(p.amountCents / 100).toFixed(2)} · card ****{p.mockCardLast4} · {p.providerRef}
                </p>
              </div>
              <span className={`badge ${p.status === 'succeeded' ? 'badge-ok' : 'badge-danger'}`}>
                <span className="badge-dot" />
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

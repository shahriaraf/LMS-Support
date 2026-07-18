'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { Enrollment, Course, Payment } from '../../lib/types';
import { useAuth } from '../../lib/auth-context';

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
      <div className="card p-6 text-center">
        <p className="mb-4">Log in to see your dashboard.</p>
        <Link href="/login" className="btn-primary">
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">My Dashboard</h1>

      <section>
        <h2 className="font-semibold mb-3">My enrollments</h2>
        {enrollments.length === 0 && <p className="text-gray-500 text-sm">No enrollments yet.</p>}
        <div className="grid md:grid-cols-2 gap-3">
          {enrollments.map((e) => {
            const course = courses[e.courseId];
            return (
              <Link key={e._id} href={`/courses/${e.courseId}`} className="card p-4 block">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{course?.title || e.courseId}</span>
                  <span
                    className={
                      'badge ' +
                      (e.status === 'active'
                        ? 'bg-ok/20 text-ok'
                        : e.status === 'pending_payment'
                        ? 'bg-warn/20 text-warn'
                        : 'bg-gray-600/20 text-gray-400')
                    }
                  >
                    {e.status}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-3">Payment history</h2>
        {payments.length === 0 && <p className="text-gray-500 text-sm">No payments yet.</p>}
        <div className="space-y-2">
          {payments.map((p) => (
            <div key={p._id} className="card p-3 flex justify-between items-center text-sm">
              <div>
                <p>{courses[p.courseId]?.title || p.courseId}</p>
                <p className="text-gray-500 text-xs">
                  ${(p.amountCents / 100).toFixed(2)} · card ****{p.mockCardLast4} · {p.providerRef}
                </p>
              </div>
              <span className={'badge ' + (p.status === 'succeeded' ? 'bg-ok/20 text-ok' : 'bg-danger/20 text-danger')}>
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

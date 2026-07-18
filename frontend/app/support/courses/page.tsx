'use client';

import { useEffect, useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { api } from '../../../lib/api';
import { Course } from '../../../lib/types';

export default function SupportCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    api.get<Course[]>('/courses').then(setCourses);
  }, []);

  async function toggleLock(course: Course) {
    setBusyId(course._id);
    try {
      const updated = await api.patch<Course>(`/courses/${course._id}/lock`, {
        isLocked: !course.isLocked,
      });
      setCourses((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-ui-faint max-w-2xl">
        Toggling a lock here applies the exact fix used automatically when you resolve a{' '}
        <span className="font-mono text-ui-muted">COURSE_403</span> issue. It takes effect on the
        student&rsquo;s very next request — no redeploy required.
      </p>
      <div className="surface divide-line">
        {courses.map((c) => (
          <div key={c._id} className="p-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{c.title}</p>
              <p className="text-xs text-ui-faint font-mono mt-0.5">{c._id}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`badge ${c.isLocked ? 'badge-danger' : 'badge-ok'}`}>
                <span className="badge-dot" />
                {c.isLocked ? 'locked' : 'unlocked'}
              </span>
              <button className="btn btn-secondary btn-sm" onClick={() => toggleLock(c)} disabled={busyId === c._id}>
                {c.isLocked ? <Unlock size={13} /> : <Lock size={13} />}
                {c.isLocked ? 'Unlock' : 'Lock'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

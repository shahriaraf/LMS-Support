'use client';

import { useEffect, useState } from 'react';
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
    <div className="space-y-2">
      <p className="text-sm text-gray-500 mb-4">
        Toggling a lock here is the exact fix applied automatically when you resolve a COURSE_403
        issue. It takes effect on the student&apos;s very next request.
      </p>
      {courses.map((c) => (
        <div key={c._id} className="card p-4 flex items-center justify-between">
          <div>
            <p className="font-medium">{c.title}</p>
            <p className="text-xs text-gray-500">{c._id}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={'badge ' + (c.isLocked ? 'bg-danger/20 text-danger' : 'bg-ok/20 text-ok')}>
              {c.isLocked ? 'locked' : 'unlocked'}
            </span>
            <button className="btn-secondary text-sm" onClick={() => toggleLock(c)} disabled={busyId === c._id}>
              {c.isLocked ? 'Unlock' : 'Lock'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

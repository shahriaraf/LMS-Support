'use client';

import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { api } from '../../lib/api';
import { Course } from '../../lib/types';
import CourseCard from '../../components/CourseCard';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Course[]>('/courses')
      .then(setCourses)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <BookOpen size={18} className="text-signal" />
        <h1 className="text-xl font-display font-semibold">Courses</h1>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      {!courses && !error && <p className="text-sm text-ui-faint">Loading…</p>}
      {courses && courses.length === 0 && <p className="text-sm text-ui-faint">No courses published yet.</p>}
      <div className="grid md:grid-cols-3 gap-4">
        {courses?.map((c) => (
          <CourseCard key={c._id} course={c} />
        ))}
      </div>
    </div>
  );
}

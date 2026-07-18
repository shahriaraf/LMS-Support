'use client';

import { useEffect, useState } from 'react';
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
      <h1 className="text-2xl font-bold mb-6">Courses</h1>
      {error && <p className="text-danger">{error}</p>}
      {!courses && !error && <p className="text-gray-500">Loading…</p>}
      <div className="grid md:grid-cols-3 gap-4">
        {courses?.map((c) => (
          <CourseCard key={c._id} course={c} />
        ))}
      </div>
    </div>
  );
}

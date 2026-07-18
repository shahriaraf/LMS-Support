import Link from 'next/link';
import { Course } from '../lib/types';

export default function CourseCard({ course }: { course: Course }) {
  return (
    <Link href={`/courses/${course._id}`} className="card p-5 block hover:border-accent transition-colors">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold">{course.title}</h3>
        {course.isLocked && <span className="badge bg-danger/20 text-danger">locked</span>}
      </div>
      <p className="text-sm text-gray-400 line-clamp-2">{course.description}</p>
      <div className="flex items-center justify-between mt-4 text-sm">
        <span className="text-gray-500">by {course.instructor}</span>
        <span className="font-semibold">
          {course.priceCents === 0 ? 'Free' : `$${(course.priceCents / 100).toFixed(2)}`}
        </span>
      </div>
    </Link>
  );
}

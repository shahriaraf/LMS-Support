import Link from 'next/link';
import { Lock, User } from 'lucide-react';
import { Course } from '../lib/types';

export default function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${course._id}`}
      className={`card card-interactive rail ${course.isLocked ? 'rail-danger' : 'rail-signal'} p-5 flex flex-col gap-3`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display font-semibold leading-snug">{course.title}</h3>
        {course.isLocked && (
          <span className="badge badge-danger shrink-0">
            <Lock size={11} />
            Locked
          </span>
        )}
      </div>
      <p className="text-sm text-ui-muted line-clamp-2">{course.description}</p>
      <div className="flex items-center justify-between mt-1 pt-3 border-t border-line text-sm">
        <span className="flex items-center gap-1.5 text-ui-faint">
          <User size={13} />
          {course.instructor}
        </span>
        <span className="font-mono font-medium text-ui-text">
          {course.priceCents === 0 ? 'Free' : `$${(course.priceCents / 100).toFixed(2)}`}
        </span>
      </div>
    </Link>
  );
}

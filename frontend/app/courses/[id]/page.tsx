'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, GraduationCap, LogIn } from 'lucide-react';
import { api, ApiError } from '../../../lib/api';
import { Course, Enrollment } from '../../../lib/types';
import { useAuth } from '../../../lib/auth-context';
import VideoPlayer from '../../../components/VideoPlayer';
import PaymentForm from '../../../components/PaymentForm';
import ReportIssueButton from '../../../components/ReportIssueButton';

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [forbidden, setForbidden] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [cssBug, setCssBug] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  const loadCourse = useCallback(async () => {
    setLoading(true);
    setForbidden(null);
    try {
      const c = await api.get<Course>(`/courses/${id}`);
      setCourse(c);
    } catch (err) {
      setForbidden(err instanceof ApiError ? err.message : 'Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    loadCourse();
    api
      .get<{ cssMisalignmentBugEnabled: boolean }>('/settings/public')
      .then((s) => setCssBug(s.cssMisalignmentBugEnabled))
      .catch(() => undefined);
  }, [user, loadCourse]);

  useEffect(() => {
    if (!user || !course) return;
    api
      .get<Enrollment[]>('/enrollments/me')
      .then((list) => setEnrollment(list.find((e) => e.courseId === course._id) || null))
      .catch(() => undefined);
  }, [user, course]);

  async function handleFreeEnroll() {
    if (!course) return;
    setEnrolling(true);
    setEnrollError(null);
    try {
      const e = await api.post<Enrollment>('/enrollments', { courseId: course._id });
      setEnrollment(e);
    } catch (err) {
      setEnrollError(err instanceof ApiError ? err.message : 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  }

  if (!user) {
    return (
      <div className="surface p-8 text-center max-w-sm mx-auto mt-8">
        <span className="icon-chip tint-signal mx-auto mb-3">
          <LogIn size={15} />
        </span>
        <p className="text-sm text-ui-muted mb-4">Log in to view this course.</p>
        <Link href="/login" className="btn btn-primary">
          Log in
        </Link>
      </div>
    );
  }

  if (loading) return <p className="text-sm text-ui-faint">Loading…</p>;

  if (forbidden) {
    return (
      <div className="surface rail rail-danger p-6 space-y-4 max-w-lg">
        <span className="badge badge-danger">
          <span className="badge-dot" />
          403 Forbidden
        </span>
        <h1 className="text-lg font-display font-semibold">This course isn&rsquo;t accessible right now</h1>
        <p className="text-sm text-ui-muted">{forbidden}</p>
        <ReportIssueButton
          defaultCategory="COURSE_403"
          relatedCourseId={typeof id === 'string' ? id : undefined}
          label="Report this access issue"
        />
      </div>
    );
  }

  if (!course) return <p className="text-sm text-danger">Course not found.</p>;

  const isActive = enrollment?.status === 'active';

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-display font-semibold">{course.title}</h1>
        <p className="text-ui-muted mt-2 text-[15px] leading-relaxed">{course.description}</p>
        <p className="text-sm text-ui-faint mt-3">
          Taught by {course.instructor} ·{' '}
          <span className="font-mono text-ui-muted">
            {course.priceCents === 0 ? 'Free' : `$${(course.priceCents / 100).toFixed(2)}`}
          </span>
        </p>
      </div>

      {isActive ? (
        <>
          <VideoPlayer courseId={course._id} />
          <Link href={`/dashboard/quiz/${course._id}`} className="btn btn-primary inline-flex">
            <GraduationCap size={15} />
            Take the quiz
          </Link>
        </>
      ) : course.priceCents === 0 ? (
        <div className="space-y-3">
          <button
            onClick={handleFreeEnroll}
            disabled={enrolling}
            className={`btn btn-primary ${cssBug ? 'enroll-btn-bug' : 'enroll-btn-fixed'}`}
          >
            {enrolling ? 'Enrolling…' : 'Enroll for free'}
          </button>
          {enrollError && (
            <div className="tint-danger rounded-md p-3 space-y-2 max-w-md">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <ShieldAlert size={14} />
                Enrollment failed
              </p>
              <p className="text-xs opacity-90">{enrollError}</p>
              <ReportIssueButton
                defaultCategory="ENROLLMENT_DB_ERROR"
                relatedCourseId={course._id}
                label="Report this enrollment issue"
              />
            </div>
          )}
        </div>
      ) : (
        <PaymentForm
          courseId={course._id}
          amountCents={course.priceCents}
          onSuccess={() =>
            setEnrollment({
              _id: 'local',
              userId: user.id,
              courseId: course._id,
              status: 'active',
              createdAt: new Date().toISOString(),
            })
          }
        />
      )}
    </div>
  );
}

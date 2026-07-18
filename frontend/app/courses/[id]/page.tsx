'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, ApiError } from '../../../lib/api';
import { Course, Enrollment, Settings } from '../../../lib/types';
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
      if (err instanceof ApiError && err.status === 403) {
        setForbidden(err.message);
      } else {
        setForbidden(err instanceof ApiError ? err.message : 'Failed to load course');
      }
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
      <div className="card p-6 text-center">
        <p className="mb-4">Log in to view this course.</p>
        <Link href="/login" className="btn-primary">
          Log in
        </Link>
      </div>
    );
  }

  if (loading) return <p className="text-gray-500">Loading…</p>;

  if (forbidden) {
    return (
      <div className="card p-6 space-y-4">
        <p className="badge bg-danger/20 text-danger">403 Forbidden</p>
        <h1 className="text-xl font-bold">This course isn&apos;t accessible right now</h1>
        <p className="text-sm text-gray-400">{forbidden}</p>
        <ReportIssueButton
          defaultCategory="COURSE_403"
          relatedCourseId={typeof id === 'string' ? id : undefined}
          label="Report this access issue"
        />
      </div>
    );
  }

  if (!course) return <p className="text-danger">Course not found.</p>;

  const isActive = enrollment?.status === 'active';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{course.title}</h1>
        <p className="text-gray-400 mt-1">{course.description}</p>
        <p className="text-sm text-gray-500 mt-2">
          Instructor: {course.instructor} · {course.priceCents === 0 ? 'Free' : `$${(course.priceCents / 100).toFixed(2)}`}
        </p>
      </div>

      {isActive ? (
        <>
          <VideoPlayer courseId={course._id} />
          <Link href={`/dashboard/quiz/${course._id}`} className="btn-primary inline-block">
            Take the quiz
          </Link>
        </>
      ) : course.priceCents === 0 ? (
        <div className="space-y-3">
          <button
            onClick={handleFreeEnroll}
            disabled={enrolling}
            className={cssBug ? 'btn-primary enroll-btn-bug' : 'btn-primary enroll-btn-fixed'}
          >
            {enrolling ? 'Enrolling…' : 'Enroll for free'}
          </button>
          {enrollError && (
            <div className="bg-danger/10 border border-danger/40 rounded-lg p-3 space-y-2 max-w-md">
              <p className="text-danger text-sm font-medium">Enrollment failed</p>
              <p className="text-xs text-gray-400">{enrollError}</p>
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
          onSuccess={() => setEnrollment({ _id: 'local', userId: user.id, courseId: course._id, status: 'active', createdAt: new Date().toISOString() })}
        />
      )}
    </div>
  );
}

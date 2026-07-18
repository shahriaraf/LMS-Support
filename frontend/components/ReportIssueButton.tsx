'use client';

import { useState } from 'react';
import { Flag, CheckCircle2, X } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import { IssueCategory } from '../lib/types';

const CATEGORY_LABELS: Record<IssueCategory, string> = {
  COURSE_403: 'Course not loading (403 error)',
  PAYMENT_FAILURE: 'Payment failed',
  VIDEO_CORS: 'Video not playing',
  CSS_MISALIGNMENT: 'Button / layout misaligned',
  ENROLLMENT_DB_ERROR: 'Cannot enroll in a course',
  OTHER: 'Something else',
};

export default function ReportIssueButton({
  defaultCategory = 'OTHER',
  relatedCourseId,
  label = 'Report a problem',
}: {
  defaultCategory?: IssueCategory;
  relatedCourseId?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<IssueCategory>(defaultCategory);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/issues', { title, description, category, relatedCourseId });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit report');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn btn-secondary btn-sm">
        <Flag size={13} />
        {label}
      </button>
    );
  }

  if (done) {
    return (
      <div className="surface p-4 flex items-start gap-3">
        <span className="icon-chip tint-ok mt-0.5">
          <CheckCircle2 size={15} />
        </span>
        <div>
          <p className="text-sm font-medium">Report filed</p>
          <p className="text-sm text-ui-muted mt-0.5">
            A support engineer can see this ticket now, with a suggested fix attached automatically.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="surface p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Report a problem</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-ui-faint hover:text-ui-text"
          aria-label="Close"
        >
          <X size={15} />
        </button>
      </div>
      <div>
        <label className="field-label">What went wrong</label>
        <select value={category} onChange={(e) => setCategory(e.target.value as IssueCategory)}>
          {Object.entries(CATEGORY_LABELS).map(([value, text]) => (
            <option key={value} value={value}>
              {text}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="field-label">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Short summary" />
      </div>
      <div>
        <label className="field-label">What happened</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          placeholder="Steps to reproduce, what you expected, what you saw instead"
        />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-2 pt-1">
        <button className="btn btn-primary btn-sm" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit report'}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}

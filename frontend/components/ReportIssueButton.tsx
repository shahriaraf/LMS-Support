'use client';

import { useState } from 'react';
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
      <button onClick={() => setOpen(true)} className="btn-secondary text-sm">
        {label}
      </button>
    );
  }

  if (done) {
    return (
      <div className="card p-4 text-sm text-ok">
        Thanks - your report was filed and a support engineer can see it in the dashboard now.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-4 space-y-3">
      <div>
        <label className="text-sm text-gray-400">What went wrong?</label>
        <select value={category} onChange={(e) => setCategory(e.target.value as IssueCategory)}>
          {Object.entries(CATEGORY_LABELS).map(([value, text]) => (
            <option key={value} value={value}>
              {text}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm text-gray-400">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <label className="text-sm text-gray-400">Describe what happened</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
        />
      </div>
      {error && <p className="text-danger text-sm">{error}</p>}
      <div className="flex gap-2">
        <button className="btn-primary text-sm" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit report'}
        </button>
        <button type="button" className="btn-secondary text-sm" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}

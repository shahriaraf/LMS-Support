'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../../lib/api';
import { Issue } from '../../../../lib/types';

export default function IssueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await api.get<Issue>(`/issues/${id}`);
    setIssue(data);
    setNotes(data.resolutionNotes || '');
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(status: 'investigating') {
    setBusy(true);
    try {
      await api.patch(`/issues/${id}/status`, { status });
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function resolve(applyFix: boolean) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await api.patch<Issue & { fixApplied: boolean }>(`/issues/${id}/resolve`, {
        resolutionNotes: notes,
        applyFix,
      });
      setMessage(
        applyFix
          ? res.fixApplied
            ? 'Fix applied and ticket resolved - the underlying toggle has been flipped live.'
            : 'Ticket resolved, but there was nothing automatic to apply for this category.'
          : 'Ticket marked resolved (no automatic fix applied).',
      );
      await load();
    } finally {
      setBusy(false);
    }
  }

  if (!issue) return <p className="text-gray-500">Loading…</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="card p-5 space-y-2">
        <div className="flex items-center gap-2">
          <span className="badge bg-gray-600/30 text-gray-300">{issue.category}</span>
          <span className="badge bg-gray-600/30 text-gray-300">{issue.status}</span>
          <span className="badge bg-warn/20 text-warn">{issue.severity}</span>
        </div>
        <h1 className="text-xl font-bold">{issue.title}</h1>
        <p className="text-gray-400 text-sm">{issue.description}</p>
        <p className="text-xs text-gray-600">
          Reported by user {issue.reporterId} on {new Date(issue.createdAt).toLocaleString()}
          {issue.relatedCourseId && <> · course {issue.relatedCourseId}</>}
        </p>
      </div>

      <div className="card p-5 space-y-3">
        <h2 className="font-semibold">Suggested Fix</h2>
        <p className="text-sm text-gray-300 font-medium">{issue.suggestedFix.title}</p>
        <p className="text-sm text-gray-500">
          <span className="text-gray-400">Likely root cause: </span>
          {issue.suggestedFix.likelyRootCause}
        </p>
        <div>
          <p className="text-sm text-gray-400 mb-1">Investigation steps:</p>
          <ol className="list-decimal list-inside text-sm text-gray-300 space-y-1">
            {issue.suggestedFix.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>
        <p className="text-xs text-gray-600 font-mono">Relevant log query: {issue.suggestedFix.relevantLogQuery}</p>
      </div>

      {issue.status !== 'resolved' && (
        <div className="card p-5 space-y-3">
          <h2 className="font-semibold">Resolve</h2>
          {issue.status === 'open' && (
            <button className="btn-secondary text-sm" onClick={() => setStatus('investigating')} disabled={busy}>
              Mark as investigating
            </button>
          )}
          <div>
            <label className="text-sm text-gray-400">Resolution notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
          <div className="flex gap-2">
            <button className="btn-primary text-sm" onClick={() => resolve(true)} disabled={busy}>
              Resolve &amp; Apply Fix
            </button>
            <button className="btn-secondary text-sm" onClick={() => resolve(false)} disabled={busy}>
              Resolve without auto-fix
            </button>
          </div>
          {message && <p className="text-ok text-sm">{message}</p>}
        </div>
      )}

      {issue.status === 'resolved' && (
        <div className="card p-5">
          <p className="text-ok font-medium">Resolved</p>
          {issue.resolutionNotes && <p className="text-sm text-gray-400 mt-1">{issue.resolutionNotes}</p>}
          {issue.resolvedAt && (
            <p className="text-xs text-gray-600 mt-2">at {new Date(issue.resolvedAt).toLocaleString()}</p>
          )}
        </div>
      )}
    </div>
  );
}

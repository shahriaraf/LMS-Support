'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Lightbulb, Search, Wrench, CheckCircle2, Terminal } from 'lucide-react';
import { api } from '../../../../lib/api';
import { Issue } from '../../../../lib/types';

const SEVERITY_BADGE: Record<string, string> = {
  low: 'badge-neutral',
  medium: 'badge-warn',
  high: 'badge-danger',
  critical: 'badge-danger',
};

const STATUS_BADGE: Record<string, string> = {
  open: 'badge-danger',
  investigating: 'badge-warn',
  resolved: 'badge-ok',
};

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
            ? 'Fix applied and ticket resolved — the underlying toggle has been flipped live.'
            : 'Ticket resolved. There was nothing automatic to apply for this category.'
          : 'Ticket marked resolved. No automatic fix was applied.',
      );
      await load();
    } finally {
      setBusy(false);
    }
  }

  if (!issue) return <p className="text-sm text-ui-faint">Loading…</p>;

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="surface p-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="badge badge-neutral">{issue.category}</span>
          <span className={`badge ${STATUS_BADGE[issue.status]}`}>
            <span className="badge-dot" />
            {issue.status}
          </span>
          <span className={`badge ${SEVERITY_BADGE[issue.severity]}`}>{issue.severity}</span>
        </div>
        <h1 className="text-lg font-display font-semibold">{issue.title}</h1>
        <p className="text-sm text-ui-muted leading-relaxed">{issue.description}</p>
        <p className="text-xs text-ui-faint font-mono pt-1">
          reported by {issue.reporterId} on {new Date(issue.createdAt).toLocaleString()}
          {issue.relatedCourseId && <> · course {issue.relatedCourseId}</>}
        </p>
      </div>

      <div className="surface rail rail-signal p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb size={15} className="text-signal" />
          <h2 className="font-display font-semibold text-sm">Suggested fix</h2>
        </div>
        <p className="text-sm font-medium">{issue.suggestedFix.title}</p>
        <p className="text-sm text-ui-muted leading-relaxed">
          <span className="text-ui-faint">Likely root cause — </span>
          {issue.suggestedFix.likelyRootCause}
        </p>
        <div>
          <p className="text-xs uppercase tracking-wide font-mono text-ui-faint mb-2">Investigation steps</p>
          <ol className="space-y-2">
            {issue.suggestedFix.steps.map((s, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-ui-muted">
                <span className="font-mono text-signal shrink-0">{String(i + 1).padStart(2, '0')}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>
        <p className="flex items-center gap-2 text-xs font-mono text-ui-faint pt-2 border-t border-line">
          <Terminal size={12} />
          {issue.suggestedFix.relevantLogQuery}
        </p>
      </div>

      {issue.status !== 'resolved' && (
        <div className="surface p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Wrench size={15} className="text-ui-muted" />
            <h2 className="font-display font-semibold text-sm">Resolve</h2>
          </div>
          {issue.status === 'open' && (
            <button className="btn btn-secondary btn-sm" onClick={() => setStatus('investigating')} disabled={busy}>
              <Search size={13} />
              Mark as investigating
            </button>
          )}
          <div>
            <label className="field-label">Resolution notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="What did you check, and what fixed it?" />
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary btn-sm" onClick={() => resolve(true)} disabled={busy}>
              <CheckCircle2 size={14} />
              Resolve &amp; apply fix
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => resolve(false)} disabled={busy}>
              Resolve without auto-fix
            </button>
          </div>
          {message && <p className="text-sm text-ok">{message}</p>}
        </div>
      )}

      {issue.status === 'resolved' && (
        <div className="surface rail rail-ok p-6">
          <p className="flex items-center gap-1.5 text-sm font-medium text-ok">
            <CheckCircle2 size={15} />
            Resolved
          </p>
          {issue.resolutionNotes && <p className="text-sm text-ui-muted mt-2">{issue.resolutionNotes}</p>}
          {issue.resolvedAt && (
            <p className="text-xs text-ui-faint font-mono mt-2">at {new Date(issue.resolvedAt).toLocaleString()}</p>
          )}
        </div>
      )}
    </div>
  );
}

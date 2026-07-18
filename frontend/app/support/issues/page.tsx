'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flag } from 'lucide-react';
import { api } from '../../../lib/api';
import { Issue, IssueStatus } from '../../../lib/types';

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

const FILTERS: { value: IssueStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'resolved', label: 'Resolved' },
];

export default function IssuesListPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filter, setFilter] = useState<IssueStatus | 'all'>('all');

  useEffect(() => {
    api.get<Issue[]>(filter === 'all' ? '/issues' : `/issues?status=${filter}`).then(setIssues);
  }, [filter]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={filter === f.value ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
          >
            {f.label}
          </button>
        ))}
      </div>

      {issues.length === 0 && (
        <div className="surface p-8 text-center">
          <span className="icon-chip tint-neutral mx-auto mb-3">
            <Flag size={15} />
          </span>
          <p className="text-sm text-ui-muted">No issues in this view.</p>
        </div>
      )}

      <div className="space-y-2">
        {issues.map((issue) => (
          <Link
            key={issue._id}
            href={`/support/issues/${issue._id}`}
            className={`card rail ${issue.status === 'resolved' ? 'rail-ok' : issue.status === 'investigating' ? 'rail-warn' : 'rail-danger'} p-4 flex items-center justify-between gap-4`}
          >
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{issue.title}</p>
              <p className="text-xs text-ui-faint mt-1 font-mono">
                {issue.category} · reported {new Date(issue.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`badge ${SEVERITY_BADGE[issue.severity]}`}>{issue.severity}</span>
              <span className={`badge ${STATUS_BADGE[issue.status]}`}>
                <span className="badge-dot" />
                {issue.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

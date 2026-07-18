'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { Issue, IssueStatus } from '../../../lib/types';

const SEVERITY_TONE: Record<string, string> = {
  low: 'bg-gray-600/30 text-gray-300',
  medium: 'bg-warn/20 text-warn',
  high: 'bg-danger/20 text-danger',
  critical: 'bg-danger/40 text-danger',
};

export default function IssuesListPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filter, setFilter] = useState<IssueStatus | 'all'>('all');

  useEffect(() => {
    api.get<Issue[]>(filter === 'all' ? '/issues' : `/issues?status=${filter}`).then(setIssues);
  }, [filter]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['all', 'open', 'investigating', 'resolved'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={filter === s ? 'btn-primary text-sm' : 'btn-secondary text-sm'}
          >
            {s}
          </button>
        ))}
      </div>

      {issues.length === 0 && <p className="text-gray-500 text-sm">No issues in this view.</p>}

      <div className="space-y-2">
        {issues.map((issue) => (
          <Link key={issue._id} href={`/support/issues/${issue._id}`} className="card p-4 flex items-center justify-between block">
            <div>
              <p className="font-medium">{issue.title}</p>
              <p className="text-xs text-gray-500 mt-1">
                {issue.category} · reported {new Date(issue.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`badge ${SEVERITY_TONE[issue.severity]}`}>{issue.severity}</span>
              <span className="badge bg-gray-600/30 text-gray-300">{issue.status}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

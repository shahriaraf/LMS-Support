'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CircleDot, Search, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';
import { Issue } from '../../lib/types';

interface ErrorSummaryRow {
  path: string;
  statusCode: number;
  count: number;
  lastSeen: string;
}

export default function SupportOverviewPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [summary, setSummary] = useState<ErrorSummaryRow[]>([]);

  useEffect(() => {
    api.get<Issue[]>('/issues').then(setIssues).catch(() => undefined);
    api.get<ErrorSummaryRow[]>('/logs/error-summary').then(setSummary).catch(() => undefined);
  }, []);

  const open = issues.filter((i) => i.status === 'open').length;
  const investigating = issues.filter((i) => i.status === 'investigating').length;
  const resolved = issues.filter((i) => i.status === 'resolved').length;

  return (
    <div className="space-y-10">
      <div className="grid sm:grid-cols-3 gap-3">
        <StatCard label="Open" value={open} icon={CircleDot} tone="danger" />
        <StatCard label="Investigating" value={investigating} icon={Search} tone="warn" />
        <StatCard label="Resolved" value={resolved} icon={CheckCircle2} tone="ok" />
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-ui-muted">Top error patterns</h2>
          <Link href="/support/logs" className="flex items-center gap-1 text-sm text-signal hover:text-signal-strong">
            Full logs
            <ArrowRight size={13} />
          </Link>
        </div>
        {summary.length === 0 && <p className="text-sm text-ui-faint">No errors recorded yet.</p>}
        {summary.length > 0 && (
          <div className="surface divide-line">
            {summary.map((row, i) => (
              <div key={i} className="p-3.5 flex items-center justify-between text-sm">
                <div>
                  <span className="font-mono text-ui-text">{row.path}</span>
                  <span className="text-ui-faint ml-2 text-xs">
                    last seen {new Date(row.lastSeen).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="badge badge-danger">
                    <span className="badge-dot" />
                    {row.statusCode}
                  </span>
                  <span className="font-mono text-ui-faint text-xs">×{row.count}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-ui-muted">Recent issues</h2>
          <Link href="/support/issues" className="flex items-center gap-1 text-sm text-signal hover:text-signal-strong">
            All issues
            <ArrowRight size={13} />
          </Link>
        </div>
        {issues.length === 0 && <p className="text-sm text-ui-faint">No issues reported yet.</p>}
        <div className="space-y-2">
          {issues.slice(0, 5).map((issue) => (
            <Link key={issue._id} href={`/support/issues/${issue._id}`} className="card p-3.5 flex justify-between items-center">
              <span className="text-sm">{issue.title}</span>
              <span className="badge badge-neutral">{issue.category}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof CircleDot;
  tone: 'danger' | 'warn' | 'ok';
}) {
  const tintClass = { danger: 'tint-danger', warn: 'tint-warn', ok: 'tint-ok' }[tone];
  const railClass = { danger: 'rail-danger', warn: 'rail-warn', ok: 'rail-ok' }[tone];
  return (
    <div className={`card rail ${railClass} p-5 flex items-center justify-between`}>
      <div>
        <p className="text-3xl font-display font-semibold">{value}</p>
        <p className="text-sm text-ui-muted mt-0.5">{label}</p>
      </div>
      <span className={`icon-chip ${tintClass}`}>
        <Icon size={15} />
      </span>
    </div>
  );
}

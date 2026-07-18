'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-4">
        <StatCard label="Open" value={open} tone="danger" />
        <StatCard label="Investigating" value={investigating} tone="warn" />
        <StatCard label="Resolved" value={resolved} tone="ok" />
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Top errors (last 20 patterns)</h2>
          <Link href="/support/logs" className="text-sm text-accent">
            View full logs →
          </Link>
        </div>
        {summary.length === 0 && <p className="text-gray-500 text-sm">No errors recorded yet.</p>}
        <div className="card divide-y divide-[#262b38]">
          {summary.map((row, i) => (
            <div key={i} className="p-3 flex items-center justify-between text-sm">
              <div>
                <span className="font-mono">{row.path}</span>
                <span className="text-gray-500 ml-2">last seen {new Date(row.lastSeen).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="badge bg-danger/20 text-danger">{row.statusCode}</span>
                <span className="text-gray-400">×{row.count}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Recent issues</h2>
          <Link href="/support/issues" className="text-sm text-accent">
            View all →
          </Link>
        </div>
        <div className="space-y-2">
          {issues.slice(0, 5).map((issue) => (
            <Link key={issue._id} href={`/support/issues/${issue._id}`} className="card p-3 flex justify-between items-center block">
              <span className="text-sm">{issue.title}</span>
              <span className="badge bg-gray-600/30 text-gray-300">{issue.category}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: 'danger' | 'warn' | 'ok' }) {
  const toneClass = { danger: 'text-danger', warn: 'text-warn', ok: 'text-ok' }[tone];
  return (
    <div className="card p-5">
      <p className={`text-3xl font-bold ${toneClass}`}>{value}</p>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  );
}

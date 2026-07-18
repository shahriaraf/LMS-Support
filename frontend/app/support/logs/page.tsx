'use client';

import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { api } from '../../../lib/api';
import { ActivityLog, ApiLog } from '../../../lib/types';

export default function LogsPage() {
  const [tab, setTab] = useState<'api' | 'activity'>('api');
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [onlyErrors, setOnlyErrors] = useState(true);
  const [pathFilter, setPathFilter] = useState('');

  useEffect(() => {
    if (tab !== 'api') return;
    const qs = new URLSearchParams();
    if (onlyErrors) qs.set('onlyErrors', 'true');
    if (pathFilter) qs.set('path', pathFilter);
    api.get<ApiLog[]>(`/logs/api?${qs.toString()}`).then(setApiLogs);
  }, [tab, onlyErrors, pathFilter]);

  useEffect(() => {
    if (tab !== 'activity') return;
    api.get<ActivityLog[]>('/logs/activity').then(setActivityLogs);
  }, [tab]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setTab('api')} className={tab === 'api' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}>
          API logs
        </button>
        <button
          onClick={() => setTab('activity')}
          className={tab === 'activity' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
        >
          User activity
        </button>
      </div>

      {tab === 'api' && (
        <>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-ui-muted cursor-pointer">
              <input type="checkbox" checked={onlyErrors} onChange={(e) => setOnlyErrors(e.target.checked)} />
              Errors only
            </label>
            <input
              placeholder="filter by path, e.g. payments"
              value={pathFilter}
              onChange={(e) => setPathFilter(e.target.value)}
              className="max-w-xs font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            {apiLogs.length === 0 && <p className="text-sm text-ui-faint">No matching logs.</p>}
            {apiLogs.map((log) => (
              <details key={log._id} className={`card rail ${log.isError ? 'rail-danger' : 'rail-ok'} group`}>
                <summary className="cursor-pointer list-none p-3.5 flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 min-w-0">
                    <ChevronRight size={13} className="text-ui-faint shrink-0 transition-transform group-open:rotate-90" />
                    <span className="font-mono truncate">
                      {log.method} {log.path}
                    </span>
                  </span>
                  <span className="flex items-center gap-3 shrink-0">
                    <span className={`badge ${log.isError ? 'badge-danger' : 'badge-ok'}`}>
                      <span className="badge-dot" />
                      {log.statusCode}
                    </span>
                    <span className="text-ui-faint text-xs font-mono">{new Date(log.createdAt).toLocaleTimeString()}</span>
                  </span>
                </summary>
                <div className="px-3.5 pb-3.5 pt-1 text-xs space-y-2.5 text-ui-muted border-t border-line ml-[21px]">
                  {log.userId && <p>userId: <span className="font-mono text-ui-text">{log.userId}</span></p>}
                  {typeof log.durationMs === 'number' && <p>duration: <span className="font-mono text-ui-text">{log.durationMs}ms</span></p>}
                  {log.requestBody && (
                    <div>
                      <p className="text-ui-faint mb-1">Request body</p>
                      <pre className="bg-ink border border-line rounded-sm p-2.5 overflow-x-auto font-mono">{JSON.stringify(log.requestBody, null, 2)}</pre>
                    </div>
                  )}
                  {log.responseBody && (
                    <div>
                      <p className="text-ui-faint mb-1">Response body</p>
                      <pre className="bg-ink border border-line rounded-sm p-2.5 overflow-x-auto font-mono">{JSON.stringify(log.responseBody, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        </>
      )}

      {tab === 'activity' && (
        <div className="surface divide-line">
          {activityLogs.length === 0 && <p className="text-sm text-ui-faint p-4">No activity recorded yet.</p>}
          {activityLogs.map((log) => (
            <div key={log._id} className="p-3.5 text-sm flex items-center justify-between">
              <div>
                <span className="font-mono text-ui-text">{log.action}</span>
                {log.userId && <span className="text-ui-faint ml-2 text-xs font-mono">user {log.userId}</span>}
              </div>
              <span className="text-ui-faint text-xs font-mono">{new Date(log.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

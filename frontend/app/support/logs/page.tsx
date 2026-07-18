'use client';

import { useEffect, useState } from 'react';
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
        <button onClick={() => setTab('api')} className={tab === 'api' ? 'btn-primary text-sm' : 'btn-secondary text-sm'}>
          API request/response logs
        </button>
        <button
          onClick={() => setTab('activity')}
          className={tab === 'activity' ? 'btn-primary text-sm' : 'btn-secondary text-sm'}
        >
          User activity logs
        </button>
      </div>

      {tab === 'api' && (
        <>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <input
                type="checkbox"
                className="w-auto"
                checked={onlyErrors}
                onChange={(e) => setOnlyErrors(e.target.checked)}
              />
              Errors only
            </label>
            <input
              placeholder="filter by path, e.g. payments"
              value={pathFilter}
              onChange={(e) => setPathFilter(e.target.value)}
              className="max-w-xs"
            />
          </div>
          <div className="space-y-2">
            {apiLogs.length === 0 && <p className="text-gray-500 text-sm">No matching logs.</p>}
            {apiLogs.map((log) => (
              <details key={log._id} className="card p-3">
                <summary className="cursor-pointer flex items-center justify-between text-sm">
                  <span className="font-mono">
                    {log.method} {log.path}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className={'badge ' + (log.isError ? 'bg-danger/20 text-danger' : 'bg-ok/20 text-ok')}>
                      {log.statusCode}
                    </span>
                    <span className="text-gray-500 text-xs">{new Date(log.createdAt).toLocaleString()}</span>
                  </span>
                </summary>
                <div className="mt-3 text-xs space-y-2 text-gray-400">
                  {log.userId && <p>userId: {log.userId}</p>}
                  {typeof log.durationMs === 'number' && <p>duration: {log.durationMs}ms</p>}
                  {log.requestBody && (
                    <div>
                      <p className="text-gray-500">Request body:</p>
                      <pre className="bg-black/30 p-2 rounded overflow-x-auto">{JSON.stringify(log.requestBody, null, 2)}</pre>
                    </div>
                  )}
                  {log.responseBody && (
                    <div>
                      <p className="text-gray-500">Response body:</p>
                      <pre className="bg-black/30 p-2 rounded overflow-x-auto">{JSON.stringify(log.responseBody, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        </>
      )}

      {tab === 'activity' && (
        <div className="space-y-2">
          {activityLogs.length === 0 && <p className="text-gray-500 text-sm">No activity recorded yet.</p>}
          {activityLogs.map((log) => (
            <div key={log._id} className="card p-3 text-sm flex items-center justify-between">
              <div>
                <span className="font-mono">{log.action}</span>
                {log.userId && <span className="text-gray-500 ml-2 text-xs">user {log.userId}</span>}
              </div>
              <span className="text-gray-500 text-xs">{new Date(log.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

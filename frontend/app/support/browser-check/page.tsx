'use client';

import { useEffect, useState } from 'react';

interface CheckResult {
  label: string;
  supported: boolean;
  note?: string;
}

export default function BrowserCheckPage() {
  const [ua, setUa] = useState('');
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [checks, setChecks] = useState<CheckResult[]>([]);

  useEffect(() => {
    setUa(navigator.userAgent);
    setViewport({ width: window.innerWidth, height: window.innerHeight });

    const results: CheckResult[] = [
      { label: 'Fetch API', supported: typeof window.fetch === 'function' },
      { label: 'WebSocket', supported: typeof window.WebSocket === 'function' },
      { label: 'localStorage', supported: (() => {
          try {
            window.localStorage.setItem('__test', '1');
            window.localStorage.removeItem('__test');
            return true;
          } catch {
            return false;
          }
        })() },
      { label: 'CSS Grid', supported: typeof CSS !== 'undefined' && CSS.supports?.('display', 'grid') },
      { label: 'CSS backdrop-filter', supported: typeof CSS !== 'undefined' && CSS.supports?.('backdrop-filter', 'blur(4px)') },
      {
        label: 'Third-party cookies / cross-site storage',
        supported: navigator.cookieEnabled,
        note: 'Some browsers (Safari ITP, Firefox ETP) block cross-origin cookies by default, which can break auth flows relying on cookies instead of Authorization headers.',
      },
      {
        label: 'Video codec: MP4 (H.264)',
        supported: (() => {
          const v = document.createElement('video');
          return v.canPlayType('video/mp4; codecs="avc1.42E01E"') !== '';
        })(),
      },
    ];
    setChecks(results);
  }, []);

  const failing = checks.filter((c) => !c.supported);

  return (
    <div className="space-y-6 max-w-2xl">
      <p className="text-sm text-gray-500">
        Runs in whatever browser is currently viewing this page - useful for confirming a
        user-reported bug is actually a browser compatibility gap rather than a backend issue.
      </p>

      <div className="card p-5 space-y-2 text-sm">
        <p>
          <span className="text-gray-500">User agent:</span> <span className="font-mono break-all">{ua}</span>
        </p>
        <p>
          <span className="text-gray-500">Viewport:</span> {viewport.width}×{viewport.height}
        </p>
      </div>

      <div className="card divide-y divide-[#262b38]">
        {checks.map((c) => (
          <div key={c.label} className="p-3 flex items-start justify-between text-sm gap-4">
            <div>
              <p>{c.label}</p>
              {c.note && !c.supported && <p className="text-xs text-gray-500 mt-1">{c.note}</p>}
            </div>
            <span className={'badge ' + (c.supported ? 'bg-ok/20 text-ok' : 'bg-danger/20 text-danger')}>
              {c.supported ? 'supported' : 'unsupported'}
            </span>
          </div>
        ))}
      </div>

      {failing.length > 0 && (
        <div className="card p-4 bg-warn/5 border-warn/30">
          <p className="text-warn text-sm font-medium">{failing.length} compatibility gap(s) found</p>
          <p className="text-xs text-gray-400 mt-1">
            If a user's bug report matches one of these, it's worth suggesting a browser/OS update or an
            alternate browser before escalating as a backend defect.
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Monitor, TriangleAlert, Check, X } from 'lucide-react';

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
      {
        label: 'localStorage',
        supported: (() => {
          try {
            window.localStorage.setItem('__test', '1');
            window.localStorage.removeItem('__test');
            return true;
          } catch {
            return false;
          }
        })(),
      },
      { label: 'CSS Grid', supported: typeof CSS !== 'undefined' && CSS.supports?.('display', 'grid') },
      {
        label: 'CSS backdrop-filter',
        supported: typeof CSS !== 'undefined' && CSS.supports?.('backdrop-filter', 'blur(4px)'),
      },
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
      <p className="text-sm text-ui-faint">
        Runs in whatever browser is currently viewing this page — useful for confirming a
        user-reported bug is a browser compatibility gap rather than a backend defect.
      </p>

      <div className="surface p-5 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-ui-muted mb-1">
          <Monitor size={14} />
          <span className="text-xs uppercase tracking-wide font-mono">Client environment</span>
        </div>
        <p>
          <span className="text-ui-faint">User agent:</span>{' '}
          <span className="font-mono text-xs break-all">{ua}</span>
        </p>
        <p>
          <span className="text-ui-faint">Viewport:</span>{' '}
          <span className="font-mono">
            {viewport.width}×{viewport.height}
          </span>
        </p>
      </div>

      <div className="surface divide-line">
        {checks.map((c) => (
          <div key={c.label} className="p-3.5 flex items-start justify-between text-sm gap-4">
            <div>
              <p>{c.label}</p>
              {c.note && !c.supported && <p className="text-xs text-ui-faint mt-1">{c.note}</p>}
            </div>
            <span className={`badge shrink-0 ${c.supported ? 'badge-ok' : 'badge-danger'}`}>
              {c.supported ? <Check size={11} /> : <X size={11} />}
              {c.supported ? 'supported' : 'unsupported'}
            </span>
          </div>
        ))}
      </div>

      {failing.length > 0 && (
        <div className="surface rail rail-warn p-4 flex gap-3">
          <span className="icon-chip tint-warn shrink-0">
            <TriangleAlert size={14} />
          </span>
          <div>
            <p className="text-sm font-medium">{failing.length} compatibility gap(s) found</p>
            <p className="text-xs text-ui-muted mt-1">
              If a user&rsquo;s report matches one of these, suggest a browser or OS update before
              escalating as a backend defect.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

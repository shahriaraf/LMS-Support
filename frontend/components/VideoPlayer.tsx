'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { API_URL } from '../lib/api';
import ReportIssueButton from './ReportIssueButton';

interface Props {
  courseId: string;
}

type State =
  | { status: 'loading' }
  | { status: 'ready'; videoUrl: string; corsSimulated: boolean }
  | { status: 'error'; message: string };

export default function VideoPlayer({ courseId }: Props) {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setState({ status: 'loading' });
      const token = window.localStorage.getItem('lms_token');
      try {
        // Intentionally a raw fetch() straight to the backend origin
        // (not through Next's server) so a real cross-origin CORS block
        // happens in the browser exactly like it would in production.
        const res = await fetch(`${API_URL}/video/${courseId}/manifest`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message || `Request failed with ${res.status}`);
        }
        const data = await res.json();
        if (!cancelled) {
          setState({ status: 'ready', videoUrl: data.videoUrl, corsSimulated: data.corsSimulated });
        }
      } catch (err: any) {
        if (!cancelled) {
          setState({
            status: 'error',
            message:
              err?.message === 'Failed to fetch'
                ? 'Failed to fetch. Open DevTools → Console to confirm — this is almost always a CORS policy block on /video/:id/manifest, not an outage.'
                : err?.message || 'The video failed to load.',
          });
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  if (state.status === 'loading') {
    return (
      <div className="aspect-video surface flex items-center justify-center gap-2 text-sm text-ui-faint">
        <Loader2 size={16} className="animate-spin" />
        Loading video…
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="aspect-video surface rail rail-danger flex flex-col items-center justify-center gap-3 p-8 text-center">
        <span className="icon-chip tint-danger">
          <AlertTriangle size={16} />
        </span>
        <div>
          <p className="font-medium">Video failed to load</p>
          <p className="text-sm text-ui-muted mt-1 max-w-md">{state.message}</p>
        </div>
        <ReportIssueButton defaultCategory="VIDEO_CORS" relatedCourseId={courseId} label="Report this video issue" />
      </div>
    );
  }

  return (
    <div>
      {state.corsSimulated && (
        <p className="flex items-center gap-1.5 text-xs text-warn mb-2">
          <AlertTriangle size={12} />
          CORS simulation is enabled but this request still succeeded — likely a same-origin dev setup.
          Confirm the toggle state in Support → Settings.
        </p>
      )}
      <video controls className="w-full aspect-video rounded-md bg-black" src={state.videoUrl} />
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
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
                ? 'Failed to fetch - open DevTools → Console to confirm, but this is almost always a CORS policy block on /video/:id/manifest.'
                : err?.message || 'Video failed to load',
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
    return <div className="aspect-video card flex items-center justify-center text-gray-500">Loading video…</div>;
  }

  if (state.status === 'error') {
    return (
      <div className="aspect-video card flex flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-danger font-semibold">⚠ Video failed to load</p>
        <p className="text-sm text-gray-400 max-w-md">{state.message}</p>
        <ReportIssueButton defaultCategory="VIDEO_CORS" relatedCourseId={courseId} label="Report this video issue" />
      </div>
    );
  }

  return (
    <div>
      {state.corsSimulated && (
        <p className="text-xs text-warn mb-2">
          Note: CORS simulation is currently OFF-path (this request succeeded), but the toggle is on -
          your environment may be same-origin. Ask support to check Settings.
        </p>
      )}
      <video controls className="w-full aspect-video rounded-lg bg-black" src={state.videoUrl} />
    </div>
  );
}

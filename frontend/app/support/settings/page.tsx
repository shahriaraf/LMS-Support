'use client';

import { useEffect, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { api } from '../../../lib/api';
import { Settings } from '../../../lib/types';

export default function SupportSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<Settings>('/settings').then(setSettings);
  }, []);

  async function update(partial: Partial<Settings>) {
    setSaving(true);
    try {
      const updated = await api.patch<Settings>('/settings', partial);
      setSettings(updated);
    } finally {
      setSaving(false);
    }
  }

  if (!settings) return <p className="text-sm text-ui-faint">Loading…</p>;

  return (
    <div className="space-y-4 max-w-2xl">
      <p className="text-sm text-ui-faint">
        These toggles control real backend behavior across the whole app. Course locks are
        per-course and live on the <span className="text-ui-muted">Courses</span> tab instead of
        here.
      </p>

      <div className="surface p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Payment failure rate</p>
            <p className="text-xs text-ui-faint mt-0.5">Chance any payments/charge call randomly returns a 500.</p>
          </div>
          <span className="font-mono text-sm text-ui-text">{Math.round(settings.paymentFailureRate * 100)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(settings.paymentFailureRate * 100)}
          onChange={(e) => update({ paymentFailureRate: Number(e.target.value) / 100 })}
        />
      </div>

      <ToggleRow
        title="Video CORS error"
        description="Omits Access-Control-Allow-Origin on the video manifest endpoint — genuinely blocked by the browser."
        value={settings.videoCorsErrorEnabled}
        onChange={(v) => update({ videoCorsErrorEnabled: v })}
        disabled={saving}
      />
      <ToggleRow
        title="Enrollment DB validation error"
        description="Enrollment attempts throw a simulated Mongoose validation failure (400)."
        value={settings.enrollmentValidationErrorEnabled}
        onChange={(v) => update({ enrollmentValidationErrorEnabled: v })}
        disabled={saving}
      />
      <ToggleRow
        title="Enroll button CSS bug"
        description="Applies a broken margin/transform class to the free-enroll button."
        value={settings.cssMisalignmentBugEnabled}
        onChange={(v) => update({ cssMisalignmentBugEnabled: v })}
        disabled={saving}
      />
    </div>
  );
}

function ToggleRow({
  title,
  description,
  value,
  onChange,
  disabled,
}: {
  title: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled: boolean;
}) {
  return (
    <div className={`surface rail ${value ? 'rail-warn' : 'rail-ok'} p-5 flex items-center justify-between gap-4`}>
      <div className="flex items-start gap-3">
        <span className="icon-chip tint-neutral shrink-0 mt-0.5">
          <SlidersHorizontal size={13} />
        </span>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-ui-faint mt-0.5">{description}</p>
        </div>
      </div>
      <button
        role="switch"
        aria-checked={value}
        aria-label={title}
        onClick={() => onChange(!value)}
        disabled={disabled}
        className="switch shrink-0"
        data-on={value}
      >
        <span className="switch-knob" />
      </button>
    </div>
  );
}

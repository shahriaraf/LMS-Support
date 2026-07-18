'use client';

import { useEffect, useState } from 'react';
import { Receipt } from 'lucide-react';
import { api } from '../../../lib/api';
import { Payment } from '../../../lib/types';

export default function SupportPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [onlyFailed, setOnlyFailed] = useState(true);

  useEffect(() => {
    api.get<Payment[]>(onlyFailed ? '/payments/failed' : '/payments').then(setPayments);
  }, [onlyFailed]);

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-sm text-ui-muted cursor-pointer">
        <input type="checkbox" checked={onlyFailed} onChange={(e) => setOnlyFailed(e.target.checked)} />
        Failed payments only
      </label>

      {payments.length === 0 && (
        <div className="surface p-8 text-center">
          <span className="icon-chip tint-neutral mx-auto mb-3">
            <Receipt size={15} />
          </span>
          <p className="text-sm text-ui-muted">No payments found.</p>
        </div>
      )}

      <div className="space-y-2">
        {payments.map((p) => (
          <div key={p._id} className={`card rail ${p.status === 'succeeded' ? 'rail-ok' : 'rail-danger'} p-4 space-y-1.5 text-sm`}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-ui-text">{p.providerRef}</span>
              <span className={`badge ${p.status === 'succeeded' ? 'badge-ok' : 'badge-danger'}`}>
                <span className="badge-dot" />
                {p.status}
              </span>
            </div>
            <p className="text-ui-muted">
              user <span className="font-mono">{p.userId}</span> · course{' '}
              <span className="font-mono">{p.courseId}</span> · ${(p.amountCents / 100).toFixed(2)} · card ****
              {p.mockCardLast4}
            </p>
            {p.failureReason && <p className="text-danger text-xs">{p.failureReason}</p>}
            <p className="text-ui-faint text-xs font-mono">{new Date(p.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

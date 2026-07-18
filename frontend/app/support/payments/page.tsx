'use client';

import { useEffect, useState } from 'react';
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
      <label className="flex items-center gap-2 text-sm text-gray-400">
        <input type="checkbox" className="w-auto" checked={onlyFailed} onChange={(e) => setOnlyFailed(e.target.checked)} />
        Failed payments only
      </label>

      <div className="space-y-2">
        {payments.length === 0 && <p className="text-gray-500 text-sm">No payments found.</p>}
        {payments.map((p) => (
          <div key={p._id} className="card p-4 text-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono">{p.providerRef}</span>
              <span className={'badge ' + (p.status === 'succeeded' ? 'bg-ok/20 text-ok' : 'bg-danger/20 text-danger')}>
                {p.status}
              </span>
            </div>
            <p className="text-gray-400">
              userId {p.userId} · course {p.courseId} · ${(p.amountCents / 100).toFixed(2)} · card ****{p.mockCardLast4}
            </p>
            {p.failureReason && <p className="text-danger text-xs">{p.failureReason}</p>}
            <p className="text-gray-600 text-xs">{new Date(p.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

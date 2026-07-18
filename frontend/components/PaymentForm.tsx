'use client';

import { useState } from 'react';
import { AlertTriangle, CreditCard } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import ReportIssueButton from './ReportIssueButton';

interface Props {
  courseId: string;
  amountCents: number;
  onSuccess: () => void;
}

export default function PaymentForm({ courseId, amountCents, onSuccess }: Props) {
  const [cardNumber, setCardNumber] = useState('4242424242424242');
  const [expiry, setExpiry] = useState('12/29');
  const [cvc, setCvc] = useState('123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; providerRef?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/payments/charge', { courseId, cardNumber, expiry, cvc });
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError) {
        setError({ message: err.message, providerRef: err.body?.providerRef });
      } else {
        setError({ message: 'Payment failed' });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="surface p-5 space-y-4 max-w-sm">
      <div className="flex items-center gap-2">
        <span className="icon-chip tint-signal">
          <CreditCard size={14} />
        </span>
        <h3 className="font-display font-semibold">Checkout — ${(amountCents / 100).toFixed(2)}</h3>
      </div>
      <div>
        <label className="field-label">Card number</label>
        <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} required inputMode="numeric" />
        <p className="text-xs text-ui-faint mt-1.5">
          Use <code className="font-mono text-ui-muted">4000000000000002</code> to reliably reproduce a
          payment failure.
        </p>
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="field-label">Expiry</label>
          <input value={expiry} onChange={(e) => setExpiry(e.target.value)} required placeholder="MM/YY" />
        </div>
        <div className="flex-1">
          <label className="field-label">CVC</label>
          <input value={cvc} onChange={(e) => setCvc(e.target.value)} required inputMode="numeric" />
        </div>
      </div>
      {error && (
        <div className="tint-danger rounded-md p-3 space-y-2">
          <p className="flex items-center gap-1.5 text-sm font-medium">
            <AlertTriangle size={14} />
            Payment failed (500)
          </p>
          <p className="text-xs opacity-90">{error.message}</p>
          {error.providerRef && <p className="text-xs font-mono opacity-70">ref: {error.providerRef}</p>}
          <ReportIssueButton
            defaultCategory="PAYMENT_FAILURE"
            relatedCourseId={courseId}
            label="Report this payment issue"
          />
        </div>
      )}
      <button className="btn btn-primary w-full" disabled={loading}>
        {loading ? 'Processing…' : 'Pay & enroll'}
      </button>
    </form>
  );
}

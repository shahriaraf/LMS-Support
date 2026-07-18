'use client';

import { useState } from 'react';
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
    <form onSubmit={handleSubmit} className="card p-5 space-y-4 max-w-sm">
      <h3 className="font-semibold">Checkout - ${(amountCents / 100).toFixed(2)}</h3>
      <div>
        <label className="text-sm text-gray-400">Card number</label>
        <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} required />
        <p className="text-xs text-gray-600 mt-1">
          Try <code>4000000000000002</code> to reliably reproduce a payment failure.
        </p>
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-sm text-gray-400">Expiry</label>
          <input value={expiry} onChange={(e) => setExpiry(e.target.value)} required />
        </div>
        <div className="flex-1">
          <label className="text-sm text-gray-400">CVC</label>
          <input value={cvc} onChange={(e) => setCvc(e.target.value)} required />
        </div>
      </div>
      {error && (
        <div className="bg-danger/10 border border-danger/40 rounded-lg p-3 space-y-2">
          <p className="text-danger text-sm font-medium">Payment failed (500)</p>
          <p className="text-xs text-gray-400">{error.message}</p>
          {error.providerRef && <p className="text-xs text-gray-600">Ref: {error.providerRef}</p>}
          <ReportIssueButton
            defaultCategory="PAYMENT_FAILURE"
            relatedCourseId={courseId}
            label="Report this payment issue"
          />
        </div>
      )}
      <button className="btn-primary w-full" disabled={loading}>
        {loading ? 'Processing…' : 'Pay & Enroll'}
      </button>
    </form>
  );
}

'use client';

import { useSearchParams } from 'next/navigation';

export default function BookingSuccessBanner() {
  const sp = useSearchParams();
  const success = sp?.get('success');
  if (!success || !(success === '1' || success === 'true')) return null;

  return (
    <div className="bg-green-600 text-white py-3">
      <div className="max-w-5xl mx-auto px-6">Your booking was received — check your email for confirmation.</div>
    </div>
  );
}

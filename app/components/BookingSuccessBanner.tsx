'use client';

import { useSearchParams } from 'next/navigation';

export default function BookingSuccessBanner() {
  const sp = useSearchParams();
  const success = sp?.get('success');
  const pending = sp?.get('pending');
  
  // Show success banner
  if (success === '1' || success === 'true') {
    return (
      <div className="bg-green-600 text-white py-3">
        <div className="max-w-5xl mx-auto px-6">Your booking is confirmed — check your email for details.</div>
      </div>
    );
  }
  
  // Show pending confirmation banner
  if (pending === '1' || pending === 'true') {
    return (
      <div className="bg-amber-600 text-white py-3">
        <div className="max-w-5xl mx-auto px-6 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span>Please check your email and click the confirmation link to complete your booking.</span>
        </div>
      </div>
    );
  }
  
  return null;
}

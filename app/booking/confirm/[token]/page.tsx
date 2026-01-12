'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/app/components/shadcn/button';
import Link from 'next/link';

type BookingDetails = {
  name: string;
  email: string;
  packageName: string;
  price: number;
  date: string;
  time: string;
  carModel?: string;
  carType?: string;
  seatType?: string;
  locationType?: string;
  locationAddress?: string;
  expiresAt: string;
};

export default function ConfirmBookingPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedSlug, setConfirmedSlug] = useState<string>('');
  
  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await fetch(`/api/book/confirm?token=${token}`);
        const json = await res.json();
        
        if (!res.ok) {
          setError(json.error || 'Failed to load booking');
          return;
        }
        
        setBooking(json.booking);
      } catch {
        setError('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    }
    
    if (token) {
      fetchBooking();
    }
  }, [token]);
  
  async function handleConfirm() {
    setConfirming(true);
    setError(null);
    
    try {
      const res = await fetch('/api/book/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        setError(json.error || 'Failed to confirm booking');
        return;
      }
      
      setConfirmed(true);
      setConfirmedSlug(json.slug || '');
    } catch {
      setError('Failed to confirm booking');
    } finally {
      setConfirming(false);
    }
  }
  
  function formatDate(dateStr: string) {
    try {
      // Handle both ISO date strings and date objects
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  }
  
  function formatTime(timeStr: string) {
    try {
      const [h, m] = timeStr.split(':').map(Number);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hour = h % 12 || 12;
      return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
    } catch {
      return timeStr;
    }
  }
  
  if (loading) {
    return (
      <main className="min-h-svh flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading booking details...</p>
        </div>
      </main>
    );
  }
  
  if (confirmed) {
    return (
      <main className="min-h-svh flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full">
          <div className="rounded-2xl border border-white/10 bg-card/70 p-8 text-center backdrop-blur-xl">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-heading text-2xl text-white mb-2">Booking Confirmed!</h1>
            <p className="text-muted-foreground mb-6">
              Your appointment has been successfully booked. You will receive a confirmation email shortly.
            </p>
            <Button asChild className="w-full rounded-full">
              <Link href={confirmedSlug ? `/booking/${confirmedSlug}?success=1` : '/'}>
                Return to Website
              </Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }
  
  if (error && !booking) {
    return (
      <main className="min-h-svh flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full">
          <div className="rounded-2xl border border-red-500/20 bg-card/70 p-8 text-center backdrop-blur-xl">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="font-heading text-2xl text-white mb-2">Link Expired or Invalid</h1>
            <p className="text-muted-foreground mb-6">
              {error}
            </p>
            <Button asChild variant="outline" className="w-full rounded-full">
              <Link href="/pricing">
                Book Again
              </Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }
  
  return (
    <main className="min-h-svh bg-background py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl text-white mb-2">Confirm Your Booking</h1>
          <p className="text-muted-foreground">
            Please review the details below and click confirm to complete your booking.
          </p>
        </div>
        
        <div className="rounded-2xl border border-white/10 bg-card/70 backdrop-blur-xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 bg-primary/5">
            <h2 className="font-heading text-lg text-white">{booking?.packageName}</h2>
            <p className="text-primary font-medium text-2xl mt-1">${booking?.price}</p>
          </div>
          
          {/* Details */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Date</p>
                <p className="text-white mt-1">{booking?.date ? formatDate(booking.date) : ''}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Time</p>
                <p className="text-white mt-1">{booking?.time ? formatTime(booking.time) : ''}</p>
              </div>
            </div>
            
            <div className="h-px bg-white/10" />
            
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Customer</p>
              <p className="text-white mt-1">{booking?.name}</p>
              <p className="text-muted-foreground text-sm">{booking?.email}</p>
            </div>
            
            {booking?.carModel && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Vehicle</p>
                <p className="text-white mt-1">
                  {booking.carModel}
                  {booking.carType && ` • ${booking.carType.charAt(0).toUpperCase() + booking.carType.slice(1)}`}
                </p>
              </div>
            )}
            
            {booking?.locationType && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Location</p>
                <p className="text-white mt-1">
                  {booking.locationType === 'shop' ? 'At our location' : booking.locationAddress || 'Your location'}
                </p>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="px-6 py-4 border-t border-white/10 bg-background/30">
            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}
            
            <Button 
              onClick={handleConfirm} 
              disabled={confirming}
              className="w-full rounded-full py-6 text-base font-medium"
            >
              {confirming ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Confirming...
                </>
              ) : (
                'Confirm Booking'
              )}
            </Button>
            
            <p className="text-center text-xs text-muted-foreground mt-4">
              By confirming, you agree to our terms of service and cancellation policy.
            </p>
          </div>
        </div>
        
        {/* Expiry notice */}
        {booking?.expiresAt && (
          <p className="text-center text-xs text-muted-foreground mt-6">
            This confirmation link expires at {new Date(booking.expiresAt).toLocaleString()}
          </p>
        )}
      </div>
    </main>
  );
}

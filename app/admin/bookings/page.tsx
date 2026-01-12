import { Suspense } from 'react';
import BookingsClient from './BookingsClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Bookings | Admin',
};

export default function BookingsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl lg:text-3xl text-white tracking-tight">Bookings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage all customer appointments</p>
      </div>

      <Suspense fallback={<LoadingState />}>
        <BookingsClient />
      </Suspense>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

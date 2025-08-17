import { Suspense } from 'react';
import AdminLogout from './signout';
import AdminBookings from './table';

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10 lg:py-14">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight">Admin: Bookings</h1>
        <AdminLogout />
      </div>
      <p className="text-sm text-muted-foreground mt-2">View, update, or cancel bookings.</p>
      <div className="mt-6 rounded-2xl border border-white/10 bg-card/70 p-4 backdrop-blur-xl">
        <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
          <AdminBookings />
        </Suspense>
      </div>
    </main>
  );
}

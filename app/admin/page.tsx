import { Suspense } from 'react';
import { db, hasDb, ensureSchema, type BookingRow } from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getStats() {
  if (!hasDb) {
    return {
      totalBookings: 0,
      totalRevenue: 0,
      upcomingCount: 0,
      completedCount: 0,
      recentBookings: [] as BookingRow[],
    };
  }
  
  await ensureSchema();
  
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const [totalResult, revenueResult, upcomingResult, completedResult, recentResult] = await Promise.all([
    db`SELECT COUNT(*) as count FROM bookings WHERE status != 'cancelled'` as unknown as Array<{ count: string }>,
    db`SELECT COALESCE(SUM(price), 0) as total FROM bookings WHERE status = 'completed'` as unknown as Array<{ total: string }>,
    db`SELECT COUNT(*) as count FROM bookings WHERE status = 'booked' AND date >= ${todayStr}` as unknown as Array<{ count: string }>,
    db`SELECT COUNT(*) as count FROM bookings WHERE status = 'completed'` as unknown as Array<{ count: string }>,
    db`SELECT * FROM bookings WHERE status != 'cancelled' ORDER BY created_at DESC LIMIT 5` as unknown as BookingRow[],
  ]);
  
  return {
    totalBookings: parseInt(totalResult[0]?.count || '0'),
    totalRevenue: parseFloat(revenueResult[0]?.total || '0'),
    upcomingCount: parseInt(upcomingResult[0]?.count || '0'),
    completedCount: parseInt(completedResult[0]?.count || '0'),
    recentBookings: recentResult || [],
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-2xl lg:text-3xl text-white tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your business performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Bookings" 
          value={stats.totalBookings.toString()} 
          icon="📊"
          description="All time bookings"
        />
        <StatCard 
          title="Revenue" 
          value={`$${stats.totalRevenue.toFixed(2)}`}
          icon="💰"
          description="From completed bookings"
        />
        <StatCard 
          title="Upcoming" 
          value={stats.upcomingCount.toString()} 
          icon="⏳"
          description="Scheduled appointments"
        />
        <StatCard 
          title="Completed" 
          value={stats.completedCount.toString()} 
          icon="✅"
          description="Successfully finished"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-card/70 backdrop-blur-xl">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="font-medium text-white">Recent Bookings</h2>
            <Link href="/admin/bookings" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          <Suspense fallback={<TableLoadingState />}>
            <RecentBookingsTable bookings={stats.recentBookings} />
          </Suspense>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-card/70 backdrop-blur-xl p-4">
            <h2 className="font-medium text-white mb-4">Quick Actions</h2>
            <div className="flex flex-col gap-2">
              <Link 
                href="/admin/bookings" 
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/80 transition hover:bg-white/5"
              >
                <span>📅</span>
                <span>Manage Bookings</span>
              </Link>
              <Link 
                href="/admin/pricing" 
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/80 transition hover:bg-white/5"
              >
                <span>💰</span>
                <span>Package Pricing</span>
              </Link>
              <Link 
                href="/admin/discount" 
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/80 transition hover:bg-white/5"
              >
                <span>🏷️</span>
                <span>Set Discount</span>
              </Link>
            </div>
          </div>

          {/* Discount Card */}
          <DiscountCard />
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon, 
  description 
}: { 
  title: string; 
  value: string; 
  icon: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-card/70 backdrop-blur-xl p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-heading text-white">{value}</p>
          <p className="mt-1 text-[10px] text-muted-foreground">{description}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

function RecentBookingsTable({ bookings }: { bookings: BookingRow[] }) {
  if (bookings.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        No bookings yet. Bookings will appear here once customers start booking.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5">
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Customer</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Package</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Price</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id} className="border-b border-white/5 hover:bg-white/[0.02]">
              <td className="px-4 py-3">
                <Link href={`/admin/booking/${booking.id}`} className="hover:text-primary">
                  <div className="text-white">{booking.name}</div>
                  <div className="text-xs text-muted-foreground">{booking.email}</div>
                </Link>
              </td>
              <td className="px-4 py-3 text-white/80">{booking.package_name}</td>
              <td className="px-4 py-3 text-white/80">
                {typeof booking.date === 'string' ? booking.date : new Date(booking.date).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={booking.status} />
              </td>
              <td className="px-4 py-3 text-right text-white">${booking.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    booked: 'bg-blue-500/20 text-blue-400',
    completed: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400',
    updated: 'bg-yellow-500/20 text-yellow-400',
  } as Record<string, string>;
  
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] || 'bg-gray-500/20 text-gray-400'}`}>
      {status}
    </span>
  );
}

async function DiscountCard() {
  let discountPercent = 0;
  try {
    if (hasDb) {
      await ensureSchema();
      const rows = await db`SELECT value FROM settings WHERE key = 'global_discount_percent' LIMIT 1` as unknown as Array<{ value: string }>;
      discountPercent = parseFloat(rows[0]?.value || '0');
    }
  } catch {
    // Ignore errors
  }

  return (
    <div className="rounded-xl border border-white/10 bg-card/70 backdrop-blur-xl p-4">
      <h2 className="font-medium text-white mb-2">Current Discount</h2>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-heading text-primary">{discountPercent}%</span>
        <span className="text-xs text-muted-foreground">off all packages</span>
      </div>
      {discountPercent > 0 ? (
        <p className="mt-2 text-xs text-green-400">Active discount running</p>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">No discount active</p>
      )}
    </div>
  );
}

function TableLoadingState() {
  return (
    <div className="p-8 text-center">
      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}


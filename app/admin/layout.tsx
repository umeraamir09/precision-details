import Link from 'next/link';
import { Suspense } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center gap-4 px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-bold text-sm">PD</span>
            </div>
            <span className="font-heading text-lg text-white hidden sm:inline">Admin</span>
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <Link href="/" className="text-xs text-muted-foreground hover:text-white transition">
              View Site
            </Link>
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:block w-64 shrink-0 border-r border-white/10 min-h-[calc(100vh-3.5rem)] sticky top-14 self-start">
          <nav className="flex flex-col gap-1 p-4">
            <NavSection title="Overview">
              <NavLink href="/admin" icon="📊">Dashboard</NavLink>
            </NavSection>
            
            <NavSection title="Bookings">
              <NavLink href="/admin/bookings" icon="📅">All Bookings</NavLink>
              <NavLink href="/admin/bookings?status=upcoming" icon="⏳">Upcoming</NavLink>
              <NavLink href="/admin/bookings?status=completed" icon="✅">Completed</NavLink>
            </NavSection>
            
            <NavSection title="Settings">
              <NavLink href="/admin/discount" icon="🏷️">Discounts</NavLink>
            </NavSection>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <Suspense fallback={<LoadingState />}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function NavSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="flex flex-col gap-0.5">
        {children}
      </div>
    </div>
  );
}

function NavLink({ href, icon, children }: { href: string; icon: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
    >
      <span className="text-base">{icon}</span>
      <span>{children}</span>
    </Link>
  );
}

function AdminLogoutButton() {
  return (
    <form action="/api/admin/logout" method="POST">
      <button 
        type="submit" 
        className="text-xs text-muted-foreground hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-white/5"
      >
        Sign out
      </button>
    </form>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

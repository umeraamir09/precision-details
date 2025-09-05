'use client';
import { useEffect, useState } from 'react';

// Simple theme manager (system default, persist choice, toggle button)
// Adds/removes 'dark' class on <html>. Respects prefers-color-scheme initially.

function getSystemPref(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = window.localStorage.getItem('pd_theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return getSystemPref();
  });

  // Apply theme to html element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
    if (mounted) {
      try { localStorage.setItem('pd_theme', theme); } catch {}
    }
  }, [theme, mounted]);

  // Listen for system changes when user hasn't explicitly chosen (only before first manual toggle)
  useEffect(() => {
    setMounted(true);
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    function handle(e: MediaQueryListEvent) {
      const stored = localStorage.getItem('pd_theme');
      if (stored === 'light' || stored === 'dark') return; // user choice overrides
      setTheme(e.matches ? 'dark' : 'light');
    }
    mql.addEventListener('change', handle);
    return () => mql.removeEventListener('change', handle);
  }, []);

  function toggle() {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }

  const icon = theme === 'dark' ? (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v2"/><path d="M12 19v2"/><path d="M5.22 5.22l1.42 1.42"/><path d="M17.36 17.36l1.42 1.42"/><path d="M3 12h2"/><path d="M19 12h2"/><path d="M5.22 18.78l1.42-1.42"/><path d="M17.36 6.64l1.42-1.42"/><circle cx="12" cy="12" r="5"/></svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>
  );

  const label = theme === 'dark' ? 'Light mode' : 'Dark mode';

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        className="group relative inline-flex items-center gap-2 rounded-full border border-white/10 bg-background/70 px-4 py-2 text-xs font-medium text-foreground shadow-lg backdrop-blur-md transition hover:border-white/20 hover:bg-background/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/30 group-hover:bg-primary/25">
          {icon}
        </span>
        <span className="hidden sm:inline">{label}</span>
      </button>
    </div>
  );
}

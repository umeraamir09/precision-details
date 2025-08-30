"use client";
import { useEffect, useState } from 'react';
import { Button } from '@/app/components/shadcn/button';

export default function AdminDiscount() {
  const [percent, setPercent] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/discount', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setPercent(Number(json.percent) || 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load discount');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true); setError(null);
    try {
      const res = await fetch('/api/discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '' },
        body: JSON.stringify({ percent })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setPercent(Number(json.percent) || 0);
      setSavedAt(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally { setSaving(false); }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-card/70 p-4 backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg text-white">Global Discount</h2>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {loading && <span>Loading…</span>}
          {error && <span className="text-red-400">{error}</span>}
          {savedAt && !loading && !error && <span>Saved {savedAt.toLocaleTimeString()}</span>}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Set a global % discount applied to all package & service prices (max 90%). Set to 0 to disable and hide banners.</p>
      <div className="flex flex-wrap items-center gap-4">
        <label className="text-sm text-white inline-flex items-center gap-2">Percent
          <input
            type="number"
            min={0}
            max={90}
            value={percent}
            onChange={e=>setPercent(Math.min(90, Math.max(0, Math.round(Number(e.target.value) || 0))))}
            className="w-24 rounded-md border border-white/10 bg-background/60 px-2 py-1 text-sm text-white"
          />
        </label>
        <Button onClick={save} disabled={saving || loading} className="rounded-full">{saving ? 'Saving…' : 'Save'}</Button>
        <Button variant="secondary" onClick={load} disabled={loading} className="rounded-full">Reload</Button>
      </div>
      {percent > 0 && (
        <div className="text-[10px] text-muted-foreground">Currently active: {percent}% off</div>
      )}
    </div>
  );
}

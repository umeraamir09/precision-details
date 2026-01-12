'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/app/components/shadcn/button';

export default function DiscountClient() {
  const [percent, setPercent] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/discount', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '' 
        },
        body: JSON.stringify({ percent }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setPercent(Number(json.percent) || 0);
      setSuccess('Discount saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  const presets = [0, 5, 10, 15, 20, 25];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Current Discount Display */}
      <div className="rounded-xl border border-white/10 bg-card/70 backdrop-blur-xl p-6">
        <h2 className="text-lg font-medium text-white mb-4">Current Discount</h2>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-heading text-primary">{percent}%</span>
          <span className="text-muted-foreground">off all packages</span>
        </div>
        {percent > 0 ? (
          <p className="mt-4 text-sm text-green-400 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            Discount is active and applied to all bookings
          </p>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            No discount is currently active
          </p>
        )}
      </div>

      {/* Edit Discount */}
      <div className="rounded-xl border border-white/10 bg-card/70 backdrop-blur-xl p-6">
        <h2 className="text-lg font-medium text-white mb-4">Set Discount</h2>
        
        {/* Preset Buttons */}
        <div className="mb-6">
          <p className="text-xs text-muted-foreground mb-3">Quick Presets</p>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => setPercent(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  percent === p
                    ? 'bg-primary text-white'
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                {p === 0 ? 'None' : `${p}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div className="mb-6">
          <label className="text-xs text-muted-foreground mb-2 block">Custom Percentage</label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min={0}
              max={90}
              value={percent}
              onChange={(e) => setPercent(Math.min(90, Math.max(0, Math.round(Number(e.target.value) || 0))))}
              className="w-32 rounded-lg border border-white/10 bg-background/60 px-4 py-2 text-lg text-white outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
            />
            <span className="text-lg text-white">%</span>
            <input
              type="range"
              min={0}
              max={90}
              value={percent}
              onChange={(e) => setPercent(Number(e.target.value))}
              className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Maximum discount allowed: 90%
          </p>
        </div>

        {/* Preview */}
        {percent > 0 && (
          <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm text-primary font-medium">Preview</p>
            <p className="text-xs text-muted-foreground mt-1">
              A $100 package will be displayed as <span className="text-white">${Math.round(100 * (1 - percent / 100))}</span>
            </p>
          </div>
        )}

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <Button onClick={save} disabled={saving} className="px-6">
            {saving ? 'Saving...' : 'Save Discount'}
          </Button>
          <Button variant="secondary" onClick={load} disabled={loading}>
            Reset
          </Button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-400">
            {success}
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="rounded-xl border border-white/10 bg-card/70 backdrop-blur-xl p-6">
        <h2 className="text-lg font-medium text-white mb-4">How it works</h2>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex items-start gap-3">
            <span className="text-primary">•</span>
            <span>The discount is applied to all package prices site-wide</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary">•</span>
            <span>Customers see both original and discounted prices</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary">•</span>
            <span>Vehicle surcharges (Van +$10, SUV +$20) are added after the discount</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary">•</span>
            <span>Set to 0% to disable the discount and hide promotional banners</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

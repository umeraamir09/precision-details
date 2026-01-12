'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/app/components/shadcn/button';
import { tiers } from '@/lib/tiers';

export default function PricingClient() {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/pricing', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setPrices(json.prices || {});
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load prices');
      // Initialize with default prices on error
      const defaults: Record<string, number> = {};
      for (const tier of tiers) {
        defaults[tier.slug] = tier.price;
      }
      setPrices(defaults);
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
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prices }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setPrices(json.prices || prices);
      setSuccess('Prices saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  function updatePrice(slug: string, value: number) {
    setPrices(prev => ({ ...prev, [slug]: Math.max(0, value) }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Get package info from tiers
  const packages = tiers.filter(t => t.slug !== 'custom');

  return (
    <div className="space-y-8">
      {/* Package Prices */}
      <div className="rounded-xl border border-white/10 bg-card/70 backdrop-blur-xl p-6">
        <h2 className="text-lg font-medium text-white mb-4">Package Base Prices</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Set the base price for each package. Vehicle surcharges (Van +$10, SUV +$20) and discounts are applied on top of these prices.
        </p>
        
        <div className="space-y-4">
          {packages.map((pkg) => {
            const currentPrice = prices[pkg.slug] ?? pkg.price;
            const defaultPrice = pkg.price;
            const isModified = currentPrice !== defaultPrice;
            
            return (
              <div 
                key={pkg.slug} 
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg bg-background/40 border border-white/5"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white">{pkg.name}</h3>
                    {pkg.comingSoon && (
                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-muted text-muted-foreground">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Default: ${defaultPrice.toFixed(2)}
                    {isModified && (
                      <span className="ml-2 text-primary">• Modified</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg text-white font-medium">$</span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={currentPrice}
                    onChange={(e) => updatePrice(pkg.slug, parseFloat(e.target.value) || 0)}
                    className="w-28 rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-white outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                  />
                  {isModified && (
                    <button
                      type="button"
                      onClick={() => updatePrice(pkg.slug, defaultPrice)}
                      className="text-xs text-muted-foreground hover:text-white transition"
                      title="Reset to default"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Services Notice */}
      <div className="rounded-xl border border-white/10 bg-card/70 backdrop-blur-xl p-6">
        <h2 className="text-lg font-medium text-white mb-2">Custom Package Services</h2>
        <p className="text-sm text-muted-foreground">
          Custom package services are defined in <code className="px-1.5 py-0.5 rounded bg-white/5 text-xs">lib/services.ts</code>. 
          To update individual service prices, please modify that file directly.
        </p>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <Button onClick={save} disabled={saving} className="px-6">
          {saving ? 'Saving...' : 'Save Prices'}
        </Button>
        <Button variant="secondary" onClick={load} disabled={loading}>
          Reset All
        </Button>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-400">
          {success}
        </div>
      )}

      {/* Info Card */}
      <div className="rounded-xl border border-white/10 bg-card/70 backdrop-blur-xl p-6">
        <h2 className="text-lg font-medium text-white mb-4">How Pricing Works</h2>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex items-start gap-3">
            <span className="text-primary">1.</span>
            <span>Base prices set here are the starting point for each package</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary">2.</span>
            <span>Global discount (set in Discounts page) is applied to the base price</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary">3.</span>
            <span>Vehicle surcharges are added: Sedan ($0), Van (+$10), SUV (+$20)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary">4.</span>
            <span>Changes take effect immediately across the website</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

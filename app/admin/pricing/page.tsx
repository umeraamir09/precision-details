import { Suspense } from 'react';
import PricingClient from './PricingClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Package Pricing | Admin',
};

export default function PricingPage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="font-heading text-2xl lg:text-3xl text-white tracking-tight">Package Pricing</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage prices for all service packages</p>
      </div>

      <Suspense fallback={<LoadingState />}>
        <PricingClient />
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

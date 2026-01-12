import { Suspense } from 'react';
import DiscountClient from './DiscountClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Discount Settings | Admin',
};

export default function DiscountPage() {
  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="font-heading text-2xl lg:text-3xl text-white tracking-tight">Discount Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage global pricing discounts</p>
      </div>

      <Suspense fallback={<LoadingState />}>
        <DiscountClient />
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

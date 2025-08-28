import { notFound } from 'next/navigation';
import Reveal from '@/app/components/Reveal';
import BookingSuccessBanner from '@/app/components/BookingSuccessBanner';
import { getTierBySlug, type Tier } from '@/lib/tiers';
import BookingClient from './BookingClient';

export default async function BookingPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams?: Promise<Record<string, string | string[]>> }) {
  const { slug } = await params;
  const qp = (await (searchParams || Promise.resolve({}))) as Record<string, string | string[]>;
  let tier = getTierBySlug(slug);
  if (!tier && slug === 'custom') {
  const rawFeatures = qp['features'];
  const featureStr = typeof rawFeatures === 'string' ? rawFeatures : Array.isArray(rawFeatures) ? rawFeatures[0] : '';
  const feats = featureStr ? featureStr.split(',').map((f: string) => decodeURIComponent(f)) : [];
  const rawPrice = qp['price'];
  const priceStr = typeof rawPrice === 'string' ? rawPrice : Array.isArray(rawPrice) ? rawPrice[0] : '0';
    tier = {
      slug: 'custom',
      name: 'Custom Package',
      price: Number(priceStr) || 0,
      period: 'per car',
      features: feats,
      startingAt: true,
    } as Tier;
  }
  const tierObj: Tier | null = tier || null;
  if (!tierObj) return notFound();

  return (
    <main className="relative min-h-svh overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-1/3 top-[-10%] h-[40rem] w-[40rem] rounded-full bg-gradient-to-br from-primary/25 via-primary-500/10 to-transparent blur-3xl" />
        <div className="absolute -right-1/4 bottom-[-10%] h-[32rem] w-[32rem] rounded-full bg-gradient-to-tl from-primary-500/10 via-primary/10 to-transparent blur-3xl" />
      </div>

      <BookingSuccessBanner />
      <section className="mx-auto max-w-6xl px-6 py-10 lg:py-14">
        <div className="mb-8 flex flex-col gap-2 text-center lg:mb-12">
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight">Book {tierObj.name}</h1>
          <p className="text-sm text-muted-foreground">Lock in your spot — quick, clear, and secure.</p>
        </div>

  <BookingClient tier={tierObj} slug={slug} />
      </section>
    </main>
  );
}

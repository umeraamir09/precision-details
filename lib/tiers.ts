export type Tier = {
  slug: 'bronze' | 'silver' | 'gold' | 'paint-correction' | 'diamond' | 'exterior' | 'interior' | 'upholstery' | 'custom';
  name: string;
  price: number;
  period: string;
  features: string[];
  highlight?: boolean;
  cta?: string;
  /** Indicates the tier is not yet available for booking */
  comingSoon?: boolean;
  /** Indicates the price is a starting price */
  startingAt?: boolean;
};

export const tiers: Tier[] = [
  {
    slug: 'silver',
    name: 'Essentials',
    price: 206.25,
    period: 'per car',
    features: [
      'Full exterior wash',
      'Full interior clean + interior shine',
      'Trunk clean',
      'Paint protection from wax',
    ],
    highlight: true,
    cta: 'Book Now',
  },
  {
    slug: 'upholstery',
    name: 'Upholstery Interior Deep Clean',
    price: 150,
    period: 'per car',
    features: [
      'Full interior shampoo',
      'Extracted seats',
      'Fresh smell',
    ],
    startingAt: false,
    cta: 'Book Now',
  },
  {
    slug: 'paint-correction',
    name: 'Paint Correction',
    price: 220,
    period: 'per car',
    features: [
      'Paint decontamination clay bar',
      '1 step clear cut compound',
      '1 step polish',
      'Duration: 3-4 hours',
    ],
    cta: 'Coming Soon',
    comingSoon: true,
  },
  {
    slug: 'custom',
    name: 'Custom Package',
    price: 0,
    period: 'per car',
    features: [
      'Build a personalized package',
      'Pick just the services you need',
      'Instant live pricing',
    ],
    startingAt: false,
    cta: 'Build Now',
  },
];

export function getTierBySlug(slug: string) {
  return tiers.find((t) => t.slug === slug);
}

/**
 * Get tiers with dynamically loaded prices from the database.
 * This should be used in server components.
 */
export async function getTiersWithDynamicPrices(): Promise<Tier[]> {
  const { getPackagePrices } = await import('./pricing');
  const prices = await getPackagePrices();
  
  return tiers.map(tier => ({
    ...tier,
    price: prices[tier.slug] ?? tier.price,
  }));
}

/**
 * Get a single tier with dynamic price from the database.
 * This should be used in server components.
 */
export async function getTierBySlugWithDynamicPrice(slug: string): Promise<Tier | undefined> {
  const tier = getTierBySlug(slug);
  if (!tier) return undefined;
  
  const { getPackagePrice } = await import('./pricing');
  const price = await getPackagePrice(slug);
  
  return {
    ...tier,
    price,
  };
}

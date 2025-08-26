export type Tier = {
  slug: 'bronze' | 'silver' | 'gold' | 'paint-correction' | 'diamond' | 'exterior' | 'interior' | 'upholstery';
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
    slug: 'exterior',
    name: 'Exterior Only',
      price: 50,
    period: 'per car',
    features: [
      'Double coat foam wash with contact wash',
      'Swirl-free windows',
      'Tire shine',
      'Duration: 1–1.5 hours',
        'Paint protection wax included',
    ],
    startingAt: true,
    cta: 'Book Now',
  },
  {
    slug: 'interior',
    name: 'Interior Only',
      price: 80,
    period: 'per car',
    features: [
      'Full interior vacuum',
      'Interior clean with shiner',
      'Full trunk clean',
      'Duration: 2–2.5 hours',
    ],
    startingAt: true,
    cta: 'Book Now',
  },
    {
      slug: 'upholstery',
      name: 'Upholstery Interior Deep Clean',
      price: 120,
      period: 'per car',
      features: [
        'Full interior shampoo',
        'Extracted seats',
        'Fresh smell',
      ],
      startingAt: true,
      cta: 'Book Now',
    },
  {
    slug: 'silver',
    name: 'Silver',
    price: 149,
    period: 'per car',
    features: [
      'Double coat foam wash with contact wash',
      'Full interior clean',
      'Interior shine',
      'Trunk clean',
      'Tire shine',
      'Swirl-free windows',
    ],
    highlight: true,
    cta: 'Book Now',
  },
  {
    slug: 'gold',
    name: 'Gold',
    price: 179,
    period: 'per car',
    features: [
      'Everything in Silver',
      'Engine Bay Cleaning',
      '2-4 weeks of paint protection from wax',
    ],
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
];

export function getTierBySlug(slug: string) {
  return tiers.find((t) => t.slug === slug);
}

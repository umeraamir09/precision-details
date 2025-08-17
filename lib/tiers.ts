export type Tier = {
  slug: 'bronze' | 'silver' | 'gold';
  name: string;
  price: number;
  period: string;
  features: string[];
  highlight?: boolean;
  cta?: string;
};

export const tiers: Tier[] = [
  {
    slug: 'bronze',
    name: 'Bronze',
    price: 119,
    period: 'per car',
    features: [
      'Single coat foam wash with contact wash',
      'Full interior clean',
      'Tire Shine',
      'Swirl-free windows',
    ],
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
];

export function getTierBySlug(slug: string) {
  return tiers.find((t) => t.slug === slug);
}

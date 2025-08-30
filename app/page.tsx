
import { getGlobalDiscountPercent } from '@/lib/utils';
import HomeClient from './home-client';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const initialDiscount = await getGlobalDiscountPercent();
  return <HomeClient initialDiscount={initialDiscount} />;
}

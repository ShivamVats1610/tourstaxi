import { listCabs } from '@/lib/crm';
import { CabManager } from '../_components';

export const metadata = { title: 'Cars | ToursTaxi Admin' };
export const dynamic = 'force-dynamic';

export default async function CarsPage() {
  const cabs = await listCabs({ includeInactive: true });
  return <CabManager cabs={cabs} />;
}

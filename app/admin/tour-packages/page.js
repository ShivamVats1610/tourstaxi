import { listTourPackages } from '@/lib/crm';
import { TourPackageManager } from '../_components';

export const metadata = { title: 'Tour Packages | ToursTaxi Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminTourPackagesPage() {
  const packages = await listTourPackages({ includeInactive: true });
  return <TourPackageManager packages={packages} />;
}

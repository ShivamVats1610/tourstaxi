import { listPopularRoutes } from '@/lib/crm';
import { RouteManager } from '../_components';

export const metadata = { title: 'Routes | ToursTaxi Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminRoutesPage() {
  const routes = await listPopularRoutes({ includeInactive: true });
  return <RouteManager routes={routes} />;
}

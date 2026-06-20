import { listUsers } from '@/lib/crm';
import { Customers } from '../_components';

export const metadata = { title: 'Customers | ToursTaxi Admin' };
export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const users = await listUsers();
  return <Customers users={users} />;
}

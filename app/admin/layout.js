import { requireUser } from '@/lib/auth';
import { AdminShell } from './_components';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({ children }) {
  const user = await requireUser('admin');
  return <AdminShell user={user}>{children}</AdminShell>;
}

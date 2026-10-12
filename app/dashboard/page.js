export const metadata = { robots: { index: false, follow: false } };
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await requireUser();
  redirect(user.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard');
}

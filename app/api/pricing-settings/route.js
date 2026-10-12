import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth';
import { getPricingSettings, updatePricingSettings } from '@/lib/pricing-settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = await getPricingSettings();
  return Response.json(
    { success: true, settings },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function POST(request) {
  await requireUser('admin');
  const body = await request.json().catch(() => ({}));
  const settings = await updatePricingSettings(body);

  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/pricing');
  revalidatePath('/');
  revalidatePath('/services');
  revalidatePath('/contact');
  revalidatePath('/privacy-policy');
  revalidatePath('/terms-conditions');
  revalidatePath('/about');

  return Response.json({ success: true, settings });
}

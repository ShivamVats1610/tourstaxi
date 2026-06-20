import { getPricingSettings } from '@/lib/pricing-settings';

export async function GET() {
  const settings = await getPricingSettings();
  return Response.json({ success: true, settings });
}

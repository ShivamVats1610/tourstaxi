import { getPricingSettings } from '@/lib/pricing-settings';
import { PricingSettingsForm } from '../_components';

export const metadata = { title: 'Fare Settings | ToursTaxi Admin' };
export const dynamic = 'force-dynamic';

export default async function PricingPage() {
  const settings = await getPricingSettings();
  return <PricingSettingsForm settings={settings} />;
}

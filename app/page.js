import HomeClient from '@/components/site/HomeClient';
import { listCabs, listPopularRoutes } from '@/lib/crm';
import { getPricingSettings } from '@/lib/pricing-settings';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata('/');
export default async function HomePage() {
  const [cabs, routes, settings] = await Promise.all([listCabs({ fallbackToFleet: false }), listPopularRoutes(), getPricingSettings()]);
  return <HomeClient initialFleet={JSON.parse(JSON.stringify(cabs))} initialRoutes={JSON.parse(JSON.stringify(routes))} settings={settings} />;
}

import TourSlugClient from '@/components/site/TourSlugClient';
import { listTourPackages } from '@/lib/crm';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const packages = await listTourPackages();
  const p = packages.find(x => x.slug === slug);
  return { title: p ? `${p.title} - Tour Package | ToursTaxi` : 'Tour Packages - ToursTaxi' };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const packages = await listTourPackages();
  return <TourSlugClient slug={slug} packages={packages} />;
}

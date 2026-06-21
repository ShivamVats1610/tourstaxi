import FleetSlugClient from '@/components/site/FleetSlugClient';
import { listCabs } from '@/lib/crm';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const fleet = await listCabs({ fallbackToFleet: false });
  const v = fleet.find(f => f.slug === params.slug);
  return { title: v ? `${v.name} - Book Online | ToursTaxi` : 'Fleet - ToursTaxi' };
}

export default async function Page({ params }) {
  const fleet = await listCabs({ fallbackToFleet: false });
  const vehicle = fleet.find((item) => item.slug === params.slug);
  if (!vehicle) notFound();

  const related = fleet.filter((item) => item.slug !== params.slug).slice(0, 3);
  return <FleetSlugClient vehicle={vehicle} related={related} />;
}

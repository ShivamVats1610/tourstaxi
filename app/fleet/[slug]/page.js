import FleetSlugClient from '@/components/site/FleetSlugClient';
import { FLEET } from '@/lib/data';

export function generateStaticParams() { return FLEET.map(v => ({ slug: v.slug })); }
export function generateMetadata({ params }) {
  const v = FLEET.find(f => f.slug === params.slug);
  return { title: v ? `${v.name} — Book Online | ToursTaxi` : 'Fleet — ToursTaxi' };
}

export default function Page({ params }) {
  return <FleetSlugClient slug={params.slug} />;
}

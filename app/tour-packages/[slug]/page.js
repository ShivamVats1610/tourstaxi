import TourSlugClient from '@/components/site/TourSlugClient';
import { PACKAGES } from '@/lib/data';

export function generateStaticParams() { return PACKAGES.map(p => ({ slug: p.slug })); }
export function generateMetadata({ params }) {
  const p = PACKAGES.find(x => x.slug === params.slug);
  return { title: p ? `${p.title} — Tour Package | ToursTaxi` : 'Tour Packages — ToursTaxi' };
}

export default function Page({ params }) {
  return <TourSlugClient slug={params.slug} />;
}

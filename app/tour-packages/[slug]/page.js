import TourSlugClient from '@/components/site/TourSlugClient';
import JsonLd from '@/components/site/JsonLd';
import { listTourPackages } from '@/lib/crm';
import { pageMetadata, breadcrumbs, absoluteUrl, plainDescription } from '@/lib/seo';
import { notFound } from 'next/navigation';
import { cache } from 'react';
const getPackages = cache(() => listTourPackages());
export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tour = (await getPackages()).find(item => item.slug === slug);
  if (!tour) notFound();
  return pageMetadata('/tour-packages/' + encodeURIComponent(slug), { title: tour.title + ' Tour Package', description: plainDescription(tour.description, 'Plan your ' + tour.title + ' with ToursTaxi. Explore the itinerary, inclusions and travel options, and contact our team to book.'), image: tour.image });
}
export default async function Page({ params }) {
  const { slug } = await params;
  const packages = await getPackages();
  const tour = packages.find(item => item.slug === slug);
  if (!tour) notFound();
  const path = '/tour-packages/' + encodeURIComponent(slug);
  return <>
    <JsonLd data={breadcrumbs([{ name: 'Tour Packages', path: '/tour-packages' }, { name: tour.title, path }])} />
    <JsonLd data={{ '@context': 'https://schema.org', '@type': 'TouristTrip', name: tour.title, description: tour.description || undefined, url: absoluteUrl(path), image: tour.image ? absoluteUrl(tour.image) : undefined, provider: { '@id': absoluteUrl('/#business') } }} />
    <TourSlugClient slug={slug} packages={JSON.parse(JSON.stringify(packages))} />
  </>;
}

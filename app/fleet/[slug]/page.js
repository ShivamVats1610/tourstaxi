import FleetSlugClient from '@/components/site/FleetSlugClient';
import JsonLd from '@/components/site/JsonLd';
import { listCabs } from '@/lib/crm';
import { pageMetadata, breadcrumbs, absoluteUrl, plainDescription } from '@/lib/seo';
import { notFound } from 'next/navigation';
import { cache } from 'react';
const getFleet = cache(() => listCabs({ fallbackToFleet: false }));
export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const vehicle = (await getFleet()).find(item => item.slug === slug);
  if (!vehicle) notFound();
  return pageMetadata('/fleet/' + encodeURIComponent(slug), { title: vehicle.name + ' Cab Booking in Sawai Madhopur', description: plainDescription(vehicle.description, 'Book a ' + vehicle.name + ' with ToursTaxi. View seating, cab features and fares for Sawai Madhopur, Ranthambore and outstation travel.'), image: vehicle.image });
}
export default async function Page({ params }) {
  const { slug } = await params;
  const fleet = await getFleet();
  const vehicle = fleet.find(item => item.slug === slug);
  if (!vehicle) notFound();
  const path = '/fleet/' + encodeURIComponent(slug);
  return <>
    <JsonLd data={breadcrumbs([{ name: 'Fleet', path: '/fleet' }, { name: vehicle.name, path }])} />
    <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Service', name: vehicle.name + ' Cab Booking', serviceType: 'Chauffeur-driven taxi', url: absoluteUrl(path), provider: { '@id': absoluteUrl('/#business') }, ...(vehicle.description ? { description: vehicle.description } : {}), ...(vehicle.image ? { image: absoluteUrl(vehicle.image) } : {}) }} />
    <FleetSlugClient vehicle={JSON.parse(JSON.stringify(vehicle))} related={JSON.parse(JSON.stringify(fleet.filter(item => item.slug !== slug).slice(0, 3)))} />
  </>;
}

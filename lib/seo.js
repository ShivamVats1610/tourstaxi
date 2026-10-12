export const SITE_URL = new URL(process.env.SITE_URL || 'https://www.tourstaxi.com').origin;
export const SITE_NAME = 'ToursTaxi';
export const PRIVATE_ROBOTS = { index: false, follow: false };
export const PUBLIC_PAGES = {
  '/': ['Sawai Madhopur Taxi & Rajasthan Tours', 'Book ToursTaxi for Sawai Madhopur taxi service, Ranthambore travel, Jaipur airport transfers, outstation cabs and Rajasthan tour packages.'],
  '/about': ['About Our Sawai Madhopur Taxi & Travel Team', 'Meet ToursTaxi, operated by Shree Ganesh Tours Taxi in Sawai Madhopur. Learn about our cab booking, Rajasthan travel and local support team.'],
  '/services': ['Taxi Services, Airport Transfers & Outstation Cabs', 'Explore ToursTaxi cab services: one-way and round-trip taxis, local rentals, airport transfers, Rajasthan tours and corporate travel.'],
  '/fleet': ['Book Sedan & SUV Cabs in Sawai Madhopur', 'Compare ToursTaxi cars, seating, features and cab rates. Choose a sedan or SUV for Sawai Madhopur, Ranthambore, Jaipur and outstation trips.'],
  '/tour-packages': ['Rajasthan, Ranthambore & Golden Triangle Tours', 'Explore ToursTaxi travel packages for Ranthambore, Jaipur, Rajasthan and the Golden Triangle. Compare itineraries and plan your tour with our team.'],
  '/popular-routes': ['Popular Outstation Taxi Routes & Cab Fares', 'Explore popular ToursTaxi routes and cab fares for outstation travel. Plan one-way and return journeys from Sawai Madhopur and across Rajasthan.'],
  '/blog': ['Rajasthan Travel Guides & Taxi Booking Tips', 'Read ToursTaxi travel guides for Rajasthan, Ranthambore and Jaipur, with sightseeing ideas, journey planning advice and taxi booking tips.'],
  '/contact': ['Contact ToursTaxi for Cab & Tour Bookings', 'Contact ToursTaxi in Sawai Madhopur for taxi bookings, Rajasthan tours, airport transfers and travel enquiries. Call or send our team a message.'],
  '/faq': ['Taxi Booking, Payment & Cancellation FAQs', 'Find answers to ToursTaxi questions about cab bookings, payments, cancellations, airport pickups, local rentals and outstation travel.'],
  '/privacy-policy': ['Privacy Policy', 'Read how ToursTaxi collects, uses and protects your personal information when you enquire, book a taxi or use our travel website.'],
  '/terms-conditions': ['Booking Terms & Conditions', 'Read ToursTaxi booking terms, fare conditions, payment policies and cancellation rules before booking your taxi or travel package.'],
};

export function absoluteUrl(path = '/') {
  return new URL(path, SITE_URL + '/').href;
}

export function plainDescription(value, fallback = '') {
  const text = String(value || fallback).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > 160 ? text.slice(0, 157).trimEnd() + '...' : text;
}

export function pageMetadata(path, { title, description, image, type = 'website' } = {}) {
  const defaults = PUBLIC_PAGES[path] || [];
  const pageTitle = title || defaults[0] || SITE_NAME;
  const summary = plainDescription(description || defaults[1]);
  const fullTitle = pageTitle + ' | ' + SITE_NAME;
  const images = [{ url: image || '/opengraph-image', alt: pageTitle }];
  return {
    title: { absolute: fullTitle },
    description: summary,
    alternates: { canonical: absoluteUrl(path) },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
    openGraph: { type, locale: 'en_IN', siteName: SITE_NAME, title: fullTitle, description: summary, url: absoluteUrl(path), images },
    twitter: { card: 'summary_large_image', title: fullTitle, description: summary, images: images.map(item => item.url) },
  };
}

export function breadcrumbs(items) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ name: 'Home', path: '/' }, ...items].map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: absoluteUrl(item.path) })) };
}

export function businessSchema(company, settings) {
  const businessId = absoluteUrl('/#business');
  const sameAs = ['facebookUrl', 'instagramUrl', 'youtubeUrl', 'xUrl', 'googleBusinessUrl'].map(key => settings[key]).filter(url => /^https?:\/\//.test(url || ''));
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'TravelAgency', '@id': businessId, name: SITE_NAME, legalName: company.legalName, alternateName: ['Tours Taxi', company.legalName], url: SITE_URL, logo: absoluteUrl('/images/logo.png'), image: absoluteUrl('/opengraph-image'), telephone: settings.callingNumber || company.phoneRaw, email: settings.websiteEmail || company.email,
        description: 'Sawai Madhopur taxi bookings, Ranthambore travel, Rajasthan tours and airport transfers.',
        address: { '@type': 'PostalAddress', streetAddress: 'City Center, Indra Colony', addressLocality: 'Sawai Madhopur', addressRegion: 'Rajasthan', postalCode: '322001', addressCountry: 'IN' },
        areaServed: ['Sawai Madhopur', 'Ranthambore', 'Jaipur', 'Rajasthan'], openingHoursSpecification: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '00:00', closes: '23:59' }, ...(sameAs.length ? { sameAs } : {}) },
      { '@type': 'TaxiService', '@id': absoluteUrl('/#taxi-service'), name: 'ToursTaxi Cab Booking', provider: { '@id': businessId }, url: absoluteUrl('/services'), areaServed: ['Sawai Madhopur', 'Ranthambore', 'Jaipur', 'Rajasthan'] },
      { '@type': 'WebSite', '@id': absoluteUrl('/#website'), url: SITE_URL, name: SITE_NAME, alternateName: 'Tours Taxi', publisher: { '@id': businessId }, inLanguage: 'en-IN' },
    ],
  };
}

import { pageMetadata, breadcrumbs, PUBLIC_PAGES } from '@/lib/seo';
import JsonLd from '@/components/site/JsonLd';
import { COMPANY } from '@/lib/data';
import { getPricingSettings } from '@/lib/pricing-settings';
import { formatPhoneNumber } from '@/lib/phone-utils';

export const metadata = pageMetadata('/terms-conditions');

export default async function TermsPage() {
  const settings = await getPricingSettings();
  const phone = formatPhoneNumber(settings.callingNumber || COMPANY.phoneRaw);
  const email = settings.websiteEmail || COMPANY.email;

  return (
    <div className="pt-24">
      <JsonLd data={breadcrumbs([{ name: PUBLIC_PAGES['/terms-conditions'][0], path: '/terms-conditions' }])} />
      <section className="py-20 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-orange-300 text-xs font-semibold uppercase tracking-wider mb-4">Legal</div>
          <h1 className="text-4xl md:text-5xl font-extrabold">Terms & Conditions</h1>
          <p className="mt-3 text-white/70">Last updated: 1 June 2025</p>
        </div>
      </section>
      <section className="py-16">
        <article className="prose prose-slate max-w-3xl mx-auto px-4">
          <p>By using ToursTaxi services you agree to these terms.</p>
          <h2>Bookings</h2>
          <p>All bookings are subject to cab availability. A booking is confirmed only after you receive an SMS/email confirmation from ToursTaxi.</p>
          <h2>Fares</h2>
          <p>Quoted fares include driver allowance, fuel and applicable taxes. Toll, parking and inter-state permit fees (where applicable) are billed at actuals.</p>
          <h2>Cancellations</h2>
          <p>Free cancellation up to 4 hours before pickup. Cancellations made later attract a cab-allotment fee of Rs 300-Rs 500 depending on cab category.</p>
          <h2>Driver hours</h2>
          <p>Drivers may take mandatory breaks for safety. For multi-day trips, the daily driving limit is 250 km per day; additional km is billed extra.</p>
          <h2>Liability</h2>
          <p>ToursTaxi is not liable for delays caused by traffic, weather, vehicle breakdown, road closures or other force-majeure events.</p>
          <h2>Conduct</h2>
          <p>Smoking, consumption of alcohol and carrying inflammable materials inside the cab are strictly prohibited.</p>
          <h2>Governing law</h2>
          <p>These terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of courts in Sawai Madhopur, Rajasthan.</p>
          <h2>Contact</h2>
          <p>For any clarifications, write to {email} or call {phone}.</p>
        </article>
      </section>
    </div>
  );
}

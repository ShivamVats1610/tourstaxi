import { pageMetadata, breadcrumbs, PUBLIC_PAGES } from '@/lib/seo';
import JsonLd from '@/components/site/JsonLd';
import Reveal from '@/components/site/Reveal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BookNowButton from '@/components/site/BookNowButton';
import { COMPANY, SERVICES } from '@/lib/data';
import { getPricingSettings } from '@/lib/pricing-settings';
import { phoneHref } from '@/lib/phone-utils';
import { ArrowRight, Repeat, Timer, Plane, Tent, Briefcase, Phone } from 'lucide-react';

const ICONS = { ArrowRight, Repeat, Timer, Plane, Tent, Briefcase };
const SERVICE_PREFILLS = [
  { tripType: 'one-way', startStep: 0 },
  { tripType: 'round-trip', startStep: 0 },
  { tripType: 'local', startStep: 0 },
  { tripType: 'airport', startStep: 0 },
  { tripType: 'round-trip', startStep: 0 },
  { tripType: 'round-trip', startStep: 0 },
];

export const metadata = pageMetadata('/services');

export default async function ServicesPage() {
  const settings = await getPricingSettings();
  const callNumber = settings.callingNumber || COMPANY.phoneRaw;
  const corporateWhatsAppHref = `https://wa.me/${String(settings.whatsappNumber || callNumber).replace(/\D/g, '')}?text=${encodeURIComponent('Hi ToursTaxi, I would like to enquire about Corporate Travel bookings.')}`;

  return (
    <div className="pt-24">
      <JsonLd data={breadcrumbs([{ name: PUBLIC_PAGES['/services'][0], path: '/services' }])} />
      <section className="bg-gradient-to-br from-[#12233f] via-[#0f3f3b] to-[#071527] py-16 text-white sm:py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">Services</div>
          <h1 className="text-3xl md:text-5xl font-extrabold">Every kind of ride, all in one place</h1>
          <p className="mt-4 text-white/80 text-lg">Six services. One promise - a verified driver, a clean cab and a fair fare.</p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => {
            const Icon = ICONS[s.icon] || ArrowRight;
            return (
              <Reveal key={s.title} delay={i * 0.06}>
                <Card className="h-full group hover:-translate-y-1 hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700 shadow-sm mb-4 group-hover:scale-110 transition-transform"><Icon className="h-6 w-6" /></div>
                    <h3 className="font-bold text-xl text-slate-900">{s.title}</h3>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">{s.desc}</p>
                    {s.title === 'Corporate Travel' ? (
                      <a href={corporateWhatsAppHref} className="mt-5 inline-flex text-sm font-bold text-teal-700 hover:text-teal-800">Book Now</a>
                    ) : (
                      <BookNowButton variant="ghost" prefill={SERVICE_PREFILLS[i] || { startStep: 0 }} className="mt-5 h-auto bg-transparent p-0 text-sm font-bold text-teal-700 shadow-none hover:bg-transparent hover:text-teal-800">Book Now</BookNowButton>
                    )}
                  </CardContent>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="py-16 bg-[#12233f] text-white">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl md:text-3xl font-extrabold">Need a custom quote?</h3>
            <p className="opacity-90">Talk to our team for corporate, wedding or large-group bookings.</p>
          </div>
          <a href={phoneHref(callNumber)}><Button className="h-12 px-6 bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold"><Phone className="h-4 w-4 mr-2" /> Call ToursTaxi</Button></a>
        </div>
      </section>
    </div>
  );
}

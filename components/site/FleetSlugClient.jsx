'use client';
import { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { FLEET, FAQS } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useBooking } from '@/lib/booking-context';
import { Users, Briefcase, Check, ArrowLeft, ArrowRight, Snowflake, Star, Fuel } from 'lucide-react';

export default function FleetSlugClient({ slug }) {
  const vehicle = FLEET.find(v => v.slug === slug);
  const { open } = useBooking();

  const gallery = vehicle ? [vehicle.image, ...FLEET.filter(v => v.slug !== slug).slice(0, 3).map(v => v.image)] : [];
  const [active, setActive] = useState(0);

  const related = FLEET.filter(v => v.slug !== slug).slice(0, 3);
  if (!vehicle) return notFound();

  return (
    <div className="pt-24">
      <section className="py-8 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <Link href="/fleet" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-sky-600"><ArrowLeft className="h-4 w-4" /> Back to fleet</Link>
        </div>
      </section>

      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-10">
          {/* Gallery */}
          <div>
            <motion.div key={active} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 shadow-xl">
              <img src={gallery[active]} alt={vehicle.name} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-bold uppercase">{vehicle.badge}</div>
            </motion.div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {gallery.map((g, i) => (
                <button key={i} onClick={() => setActive(i)} className={`aspect-[4/3] rounded-lg overflow-hidden border-2 transition ${active === i ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                  <img src={g} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="text-xs text-sky-600 font-semibold uppercase tracking-wider">{vehicle.category}</div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mt-1">{vehicle.name}</h1>
            <div className="flex items-center gap-1 mt-3">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-orange-400 text-orange-400" />)}<span className="text-sm text-slate-500 ml-1">(4.9 / 1,240 trips)</span></div>

            <p className="mt-4 text-slate-600 leading-relaxed">The {vehicle.name} is one of ToursTaxi&apos;s most-loved cabs - perfect for {vehicle.seats <= 4 ? 'couples and small families' : vehicle.seats <= 6 ? 'families and small groups' : 'large groups and tours'}. Every {vehicle.name} in our fleet is professionally sanitised, GPS-tracked and serviced every fortnight to ensure a flawless ride.</p>

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { i: Users, l: 'Seats', v: `${vehicle.seats}+1` },
                { i: Briefcase, l: 'Luggage', v: vehicle.luggage },
                { i: Snowflake, l: 'AC', v: 'Yes' },
                { i: Fuel, l: 'Fuel', v: 'Diesel' }
              ].map(s => <div key={s.l} className="rounded-xl border border-slate-200 bg-white p-3 text-center"><s.i className="h-5 w-5 mx-auto text-sky-500" /><div className="text-xs text-slate-500 mt-1">{s.l}</div><div className="font-bold text-slate-900">{s.v}</div></div>)}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="font-bold text-slate-900">Features</h3>
              <ul className="mt-3 grid grid-cols-2 gap-y-1.5 text-sm text-slate-700">
                {[...vehicle.features, 'Sanitised before every trip', 'Live GPS tracking', '24x7 roadside assistance'].map(f => <li key={f} className="flex items-center gap-1.5"><Check className="h-4 w-4 text-sky-500" /> {f}</li>)}
              </ul>
            </div>

            <div className="mt-5 rounded-2xl bg-gradient-to-br from-sky-50 to-orange-50 border border-sky-200 p-5 flex items-end justify-between">
              <div>
                <div className="text-xs text-slate-500">Starting from</div>
                <div className="text-4xl font-extrabold text-slate-900">Rs {vehicle.startPrice.toLocaleString()}</div>
                <div className="text-xs text-slate-500">Rs {vehicle.pricePerKm}/km / incl. driver & fuel</div>
              </div>
              <Button onClick={() => open({ vehicleSlug: vehicle.slug, startStep: 0 })} className="h-12 px-6 bg-orange-500 hover:bg-orange-600 font-bold shadow-lg shadow-orange-500/30">Book this Cab <ArrowRight className="h-4 w-4 ml-2" /></Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-8">Questions about the {vehicle.name}</h2>
          <Accordion type="single" collapsible className="bg-slate-50 rounded-2xl border border-slate-200 px-4 sm:px-6">
            {FAQS.slice(0, 6).map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}><AccordionTrigger className="text-left font-semibold text-slate-900 hover:no-underline">{f.q}</AccordionTrigger><AccordionContent className="text-slate-600 leading-relaxed">{f.a}</AccordionContent></AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Related */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-2xl font-extrabold text-slate-900 mb-6">Other cabs you might like</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map(v => (
              <Link href={`/fleet/${v.slug}`} key={v.slug}>
                <Card className="overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all">
                  <div className="relative h-44 overflow-hidden"><img src={v.image} alt={v.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /></div>
                  <CardContent className="p-4">
                    <div className="text-xs text-sky-600 font-semibold uppercase">{v.category}</div>
                    <div className="font-bold text-slate-900">{v.name}</div>
                    <div className="mt-1 text-sm text-slate-600 flex items-center gap-3"><span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{v.seats}</span><span>Rs {v.startPrice.toLocaleString()}</span></div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

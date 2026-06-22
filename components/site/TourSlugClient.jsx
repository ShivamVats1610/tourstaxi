'use client';
import { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { PACKAGES, FAQS } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useBooking } from '@/lib/booking-context';
import { Check, ArrowLeft, ArrowRight, Clock, Star, Sparkles } from 'lucide-react';

const ITINERARIES = {
  'ranthambore-safari': [
    { day: 'Day 1', title: 'Arrival & Evening Safari', desc: 'Pickup from Sawai Madhopur station, check-in at resort, lunch, afternoon jungle safari (gypsy/canter).' },
    { day: 'Day 2', title: 'Morning Safari & Departure', desc: 'Early-morning safari (best for tiger sightings), breakfast, optional visit to Ranthambore Fort, drop.' }
  ],
  'jaipur-tour': [
    { day: 'Day 1', title: 'Pink City Sightseeing', desc: 'Arrival, Amber Fort, Jal Mahal photo stop, City Palace, Jantar Mantar, Hawa Mahal facade, Chokhi Dhani dinner.' },
    { day: 'Day 2', title: 'Local Markets & Departure', desc: 'Johri Bazaar shopping, lassi at Lassiwala, optional Albert Hall Museum, drop.' }
  ],
  'golden-triangle': [
    { day: 'Day 1', title: 'Delhi Arrival', desc: 'Airport pickup, hotel check-in, Old Delhi tour (Red Fort, Jama Masjid, Chandni Chowk).' },
    { day: 'Day 2', title: 'Delhi  to  Agra', desc: 'Drive to Agra, evening view of Taj Mahal from Mehtab Bagh, hotel.' },
    { day: 'Day 3', title: 'Taj at Sunrise  to  Jaipur', desc: 'Sunrise Taj Mahal tour, Agra Fort, drive to Jaipur with Fatehpur Sikri stop.' },
    { day: 'Day 4', title: 'Jaipur Sightseeing', desc: 'Amber Fort, City Palace, Hawa Mahal, evening Chokhi Dhani cultural dinner.' },
    { day: 'Day 5', title: 'Departure', desc: 'Markets in the morning, drop to Jaipur airport / Delhi.' }
  ],
  'rajasthan-heritage': [
    { day: 'Day 1', title: 'Jaipur', desc: 'Amber Fort, City Palace, Hawa Mahal, Chokhi Dhani.' },
    { day: 'Day 2', title: 'Jaipur  to  Pushkar  to  Jodhpur', desc: 'Holy Brahma Temple & Pushkar Ghats, drive to Jodhpur.' },
    { day: 'Day 3', title: 'Jodhpur Blue City', desc: 'Mehrangarh Fort, Jaswant Thada, blue-city walk, Sardar Market.' },
    { day: 'Day 4', title: 'Jodhpur  to  Jaisalmer', desc: 'Drive to the Golden City, evening Gadisar Lake walk.' },
    { day: 'Day 5', title: 'Desert Camp', desc: 'Jaisalmer Fort, Patwon Ki Haveli, dune sunset, camel ride, cultural night.' },
    { day: 'Day 6', title: 'Jaisalmer  to  Udaipur', desc: 'Long scenic drive to the City of Lakes.' },
    { day: 'Day 7', title: 'Udaipur', desc: 'City Palace, boat ride on Lake Pichola, Sajjangarh sunset, departure.' }
  ]
};

export default function TourSlugClient({ slug, packages = PACKAGES }) {
  const pkg = packages.find(p => p.slug === slug);
  const { open } = useBooking();

  const gallery = pkg ? [pkg.image, ...packages.filter(p => p.slug !== slug).slice(0, 3).map(p => p.image)].filter(Boolean) : [];
  const [active, setActive] = useState(0);
  const itinerary = ITINERARIES[slug] || ITINERARIES['jaipur-tour'];
  const related = packages.filter(p => p.slug !== slug).slice(0, 3);
  if (!pkg) return notFound();

  return (
    <div className="pt-24">
      <section className="py-8 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4"><Link href="/tour-packages" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-sky-600"><ArrowLeft className="h-4 w-4" /> Back to packages</Link></div>
      </section>

      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-10">
          <div>
            <motion.div key={active} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 shadow-xl">
              <img src={gallery[active]} alt={pkg.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-bold uppercase">{pkg.tag}</div>
            </motion.div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {gallery.map((g, i) => (
                <button key={i} onClick={() => setActive(i)} className={`aspect-[4/3] rounded-lg overflow-hidden border-2 transition ${active === i ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                  <img src={g} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-sky-600 font-semibold uppercase tracking-wider">Tour Package / {pkg.tag}</div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mt-1">{pkg.title}</h1>
            <div className="flex items-center gap-3 mt-3 text-sm text-slate-600">
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-sky-500" />{pkg.duration}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-orange-400 text-orange-400" /> 4.9 (380 reviews)</span>
            </div>
            <p className="mt-4 text-slate-600 leading-relaxed">{pkg.description}</p>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="font-bold text-slate-900 flex items-center gap-2"><Sparkles className="h-4 w-4 text-orange-500" /> What&apos;s included</h3>
              <ul className="mt-3 grid grid-cols-2 gap-y-1.5 text-sm text-slate-700">
                {[...pkg.inclusions, 'GST & Toll', '24x7 Tour Manager', 'Pickup & Drop'].map(f => <li key={f} className="flex items-center gap-1.5"><Check className="h-4 w-4 text-sky-500" /> {f}</li>)}
              </ul>
            </div>

            <div className="mt-5 rounded-2xl bg-gradient-to-br from-sky-50 to-orange-50 border border-sky-200 p-5 flex items-end justify-between">
              <div><div className="text-xs text-slate-500">From (per person)</div><div className="text-4xl font-extrabold text-slate-900">Rs {pkg.price.toLocaleString()}</div><div className="text-xs text-slate-500">All-inclusive / No hidden charges</div></div>
              <Button onClick={() => open({ packageSlug: pkg.slug, startStep: 0 })} className="h-12 px-6 bg-orange-500 hover:bg-orange-600 font-bold shadow-lg shadow-orange-500/30">Book this Tour <ArrowRight className="h-4 w-4 ml-2" /></Button>
            </div>
          </div>
        </div>
      </section>

      {/* Itinerary */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-10">Day-by-day Itinerary</h2>
          <div className="relative">
            <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-slate-200" />
            <div className="space-y-8">
              {itinerary.map((it, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className={`relative flex ${i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'} items-start gap-4 sm:gap-10`}>
                  <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-gradient-to-br from-sky-500 to-orange-500 text-white text-xs font-bold flex items-center justify-center shadow-lg shadow-sky-500/30 z-10">{i + 1}</div>
                  <div className="hidden sm:block flex-1" />
                  <div className="flex-1 ml-12 sm:ml-0">
                    <Card><CardContent className="p-5">
                      <div className="text-xs text-sky-600 font-semibold uppercase tracking-wider">{it.day}</div>
                      <h4 className="font-bold text-lg text-slate-900 mt-1">{it.title}</h4>
                      <p className="text-sm text-slate-600 mt-2 leading-relaxed">{it.desc}</p>
                    </CardContent></Card>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-8">Tour FAQs</h2>
          <Accordion type="single" collapsible className="bg-white rounded-2xl border border-slate-200 px-4 sm:px-6">
            {FAQS.slice(0, 6).map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}><AccordionTrigger className="text-left font-semibold text-slate-900 hover:no-underline">{f.q}</AccordionTrigger><AccordionContent className="text-slate-600 leading-relaxed">{f.a}</AccordionContent></AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Related */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-2xl font-extrabold text-slate-900 mb-6">More tours you might love</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map(p => (
              <Link href={`/tour-packages/${p.slug}`} key={p.slug}>
                <Card className="overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all">
                  <div className="relative h-44 overflow-hidden"><img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /></div>
                  <CardContent className="p-4">
                    <div className="text-xs flex items-center gap-1.5 text-slate-500"><Clock className="h-3.5 w-3.5" />{p.duration}</div>
                    <div className="font-bold text-slate-900 mt-1">{p.title}</div>
                    <div className="mt-1 text-sm font-extrabold text-orange-600">Rs {p.price.toLocaleString()}</div>
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

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Reveal from '@/components/site/Reveal';
import { PACKAGES } from '@/lib/data';
import { Clock, Check, ArrowRight } from 'lucide-react';

export const metadata = { title: 'Tour Packages — ToursTaxi' };

export default function ToursPage() {
  return (
    <div className="pt-24">
      <section className="bg-gradient-to-br from-[#12233f] via-[#0f3f3b] to-[#071527] py-16 text-white sm:py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">Tour Packages</div>
          <h1 className="text-3xl md:text-5xl font-extrabold">Curated journeys, end-to-end</h1>
          <p className="mt-4 text-white/80 text-lg">Cab, stay, sightseeing \u2014 handcrafted by our Sawai Madhopur tour desk.</p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 grid gap-8 lg:grid-cols-2">
          {PACKAGES.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.06}>
              <Card className="overflow-hidden group hover:shadow-2xl transition-all h-full">
                <div className="grid sm:grid-cols-5">
                  <div className="relative sm:col-span-2 h-56 sm:h-full overflow-hidden">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-[11px] font-bold uppercase">{p.tag}</div>
                  </div>
                  <CardContent className="sm:col-span-3 p-6 flex flex-col">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500"><Clock className="h-3.5 w-3.5" />{p.duration}</div>
                    <h3 className="text-2xl font-bold mt-1">{p.title}</h3>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">{p.description}</p>
                    <ul className="mt-4 grid grid-cols-2 gap-y-1.5 text-sm text-slate-700">
                      {p.inclusions.map(f => <li key={f} className="flex items-center gap-1.5"><Check className="h-4 w-4 text-teal-600" /> {f}</li>)}
                    </ul>
                    <div className="mt-auto pt-5 flex items-end justify-between border-t border-slate-100 mt-4">
                      <div>
                        <div className="text-[11px] text-slate-500">Starts at</div>
                        <div className="text-3xl font-extrabold text-slate-900">\u20b9{p.price.toLocaleString()}<span className="text-sm text-slate-500 font-medium"> / person</span></div>
                      </div>
                      <Link href="/contact"><Button className="bg-amber-400 text-slate-950 hover:bg-amber-300">Book Now <ArrowRight className="h-4 w-4 ml-2" /></Button></Link>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}

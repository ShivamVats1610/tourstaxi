import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Reveal from '@/components/site/Reveal';
import { listPopularRoutes } from '@/lib/crm';
import { ArrowRight, MapPin, Clock } from 'lucide-react';

export const metadata = { title: 'Popular Routes - ToursTaxi' };
export const dynamic = 'force-dynamic';

export default async function RoutesPage() {
  const routes = await listPopularRoutes();

  return (
    <div className="pt-24">
      <section className="bg-gradient-to-br from-[#12233f] via-[#0f3f3b] to-[#071527] py-16 text-white sm:py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">Popular Routes</div>
          <h1 className="text-3xl md:text-5xl font-extrabold">India favourite outstation routes</h1>
          <p className="mt-4 text-white/80 text-lg">All-inclusive fares. Verified drivers. Zero hidden surcharges.</p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {routes.map((r, i) => (
            <Reveal key={r.id || `${r.from}-${r.to}`} delay={i * 0.05}>
              <Card className="overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative h-52 overflow-hidden">
                  <img src={r.image} alt={`${r.from} to ${r.to}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5 text-white">
                    <div className="flex items-center gap-2 text-xs opacity-90 mb-1"><MapPin className="h-3 w-3" /> {r.distance} / <Clock className="h-3 w-3" /> {r.duration}</div>
                    <div className="text-xl font-bold flex items-center gap-2">{r.from} <ArrowRight className="h-4 w-4" /> {r.to}</div>
                  </div>
                </div>
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-500">Cab from</div>
                    <div className="text-2xl font-extrabold text-slate-900">Rs {r.price.toLocaleString()}</div>
                    <div className="text-xs text-slate-500">incl. driver, fuel, tax</div>
                  </div>
                  <Link href="/#book"><Button className="bg-[#12233f] hover:bg-[#0f1c33]">Book Cab</Button></Link>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}

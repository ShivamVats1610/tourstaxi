import Reveal from '@/components/site/Reveal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SERVICES } from '@/lib/data';
import { ArrowRight, Repeat, Timer, Plane, Tent, Briefcase, Phone } from 'lucide-react';

const ICONS = { ArrowRight, Repeat, Timer, Plane, Tent, Briefcase };

export const metadata = { title: 'Services — ToursTaxi' };

export default function ServicesPage() {
  return (
    <div className="pt-24">
      <section className="py-20 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-orange-300 text-xs font-semibold uppercase tracking-wider mb-4">Services</div>
          <h1 className="text-4xl md:text-6xl font-extrabold">Every kind of ride, all in one place</h1>
          <p className="mt-4 text-white/80 text-lg">Six services. One promise \u2014 a verified driver, a clean cab and a fair fare.</p>
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
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-sky-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 mb-4 group-hover:scale-110 transition-transform"><Icon className="h-6 w-6" /></div>
                    <h3 className="font-bold text-xl text-slate-900">{s.title}</h3>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">{s.desc}</p>
                    <Link href="/#book" className="mt-4 inline-flex items-center gap-1 text-sky-600 font-semibold text-sm group-hover:gap-2 transition-all">Book now <ArrowRight className="h-4 w-4" /></Link>
                  </CardContent>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="py-16 bg-orange-500 text-white">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl md:text-3xl font-extrabold">Need a custom quote?</h3>
            <p className="opacity-90">Talk to our team for corporate, wedding or large-group bookings.</p>
          </div>
          <a href="tel:+918955458128"><Button className="h-12 px-6 bg-white text-orange-600 hover:bg-slate-100 font-bold"><Phone className="h-4 w-4 mr-2" /> Call ToursTaxi</Button></a>
        </div>
      </section>
    </div>
  );
}

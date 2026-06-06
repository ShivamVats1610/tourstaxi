import { Card, CardContent } from '@/components/ui/card';
import Reveal from '@/components/site/Reveal';
import SectionTitle from '@/components/site/SectionTitle';
import { STATS } from '@/lib/data';
import { Award, Heart, Globe2, Target } from 'lucide-react';

export const metadata = { title: 'About — ToursTaxi' };

export default function AboutPage() {
  const values = [
    { icon: Heart, title: 'Hospitality first', desc: 'We treat every guest like family \u2014 from the first call to the final drop.' },
    { icon: Award, title: 'Quality obsession', desc: 'Quarterly-refreshed fleet, certified drivers, zero compromise on comfort.' },
    { icon: Globe2, title: 'Local expertise', desc: 'Born in Sawai Madhopur, we know India\u2019s heritage and wildlife circuit by heart.' },
    { icon: Target, title: 'Transparent always', desc: 'Honest pricing, no surge, GST invoices on request \u2014 always.' }
  ];

  return (
    <div className="pt-24">
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-orange-300 text-xs font-semibold uppercase tracking-wider mb-4">Our Story</div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">Driving India\u2019s travellers since <span className="text-orange-400">2014</span></h1>
          <p className="mt-5 text-white/80 text-lg max-w-2xl mx-auto">ToursTaxi began with a single Innova in the lanes of Sawai Madhopur \u2014 today we operate 500+ cabs across 100+ Indian cities, helping travellers explore the country in comfort.</p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 grid gap-6 grid-cols-2 md:grid-cols-4">
          {STATS.map(s => (
            <Reveal key={s.label} className="text-center bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-br from-sky-600 to-orange-500 bg-clip-text text-transparent">{s.value}</div>
              <div className="text-xs uppercase tracking-wider text-slate-500 mt-1 font-semibold">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Our Values" title="What we stand for" subtitle="Four guiding principles that shape every ride and every tour we run." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.06}>
                <Card className="h-full hover:-translate-y-1 hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-sky-100 to-orange-100 flex items-center justify-center mb-4"><v.icon className="h-6 w-6 text-sky-600" /></div>
                    <h3 className="font-bold text-lg">{v.title}</h3>
                    <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{v.desc}</p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 grid lg:grid-cols-2 gap-10 items-center">
          <Reveal><img src="https://images.unsplash.com/photo-1477587458883-47145ed94245?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHxSYWphc3RoYW58ZW58MHx8fHwxNzgwNzI3Njc3fDA&ixlib=rb-4.1.0&q=85" alt="rajasthan" className="rounded-3xl shadow-xl" /></Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Made in Sawai Madhopur. <span className="bg-gradient-to-r from-sky-600 to-orange-500 bg-clip-text text-transparent">Trusted across India.</span></h2>
            <p className="mt-4 text-slate-600 leading-relaxed">From a tiny cab stand near Ranthambore National Park to a pan-India ground-transport partner for hotels, travel agents and corporates \u2014 ToursTaxi has grown one happy traveller at a time.</p>
            <p className="mt-4 text-slate-600 leading-relaxed">Today we power 10,000+ trips a year, but our promise remains unchanged: honest pricing, warm hospitality and a driver who genuinely loves the road.</p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

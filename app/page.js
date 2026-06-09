'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Users, Briefcase, ArrowRight, Phone, MapPin, Clock, Smartphone, Apple, Play, Check, ShieldCheck, BadgeIndianRupee, Headphones, Sparkles, Route as RouteIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import BookingWidget from '@/components/site/BookingWidget';
import Reveal from '@/components/site/Reveal';
import SectionTitle from '@/components/site/SectionTitle';
import { STATS, WHY_CHOOSE, FLEET, PACKAGES, ROUTES, TESTIMONIALS, FAQS } from '@/lib/data';

const ICONS = { ShieldCheck, BadgeIndianRupee, Headphones, Clock, Sparkles, Route: RouteIcon };

function Home() {
  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative min-h-[100vh] flex items-center pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1625037669075-e5472e080265?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHwyfHxTVVYlMjBJbmRpYXxlbnwwfHx8fDE3ODA3Mjc2ODZ8MA&ixlib=rb-4.1.0&q=85" alt="luxury cab" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/75 to-sky-900/60" />
          <div className="absolute inset-0 bg-grid opacity-40" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur text-white text-xs font-semibold uppercase tracking-wider mb-5">
                <Star className="h-3.5 w-3.5 text-orange-400 fill-orange-400" /> Rated 4.9 by 10,000+ travellers
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-white text-balance">
                Premium Cabs.<br /> <span className="bg-gradient-to-r from-sky-400 via-orange-300 to-orange-500 bg-clip-text text-transparent">Unforgettable Journeys.</span>
              </h1>
              <p className="mt-5 text-white/80 text-lg leading-relaxed max-w-xl">Outstation cabs, airport transfers and handcrafted Rajasthan tours \u2014 powered by verified drivers, transparent pricing and 24×7 support.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#book"><Button className="h-12 px-6 bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/40">Book a Cab <ArrowRight className="h-4 w-4 ml-2" /></Button></a>
                <Link href="/tour-packages"><Button variant="outline" className="h-12 px-6 bg-white/10 border-white/30 text-white hover:bg-white hover:text-slate-900">Explore Tours</Button></Link>
              </div>
              <div className="mt-8 flex items-center gap-4 text-white/80 text-sm">
                <div className="flex -space-x-2">
                  {TESTIMONIALS.slice(0, 4).map(t => <img key={t.name} src={t.avatar} alt={t.name} className="h-9 w-9 rounded-full border-2 border-slate-900 object-cover" />)}
                </div>
                <div><span className="font-bold text-white">10,000+</span> happy travellers this year</div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="order-1 lg:order-2 lg:pl-4">
              <BookingWidget />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ---------- STATS ---------- */}
      <section className="-mt-14 relative z-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08} className="text-center px-4 py-3">
                <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-br from-sky-600 to-orange-500 bg-clip-text text-transparent">{s.value}</div>
                <div className="text-xs uppercase tracking-wider text-slate-500 mt-1 font-semibold">{s.label}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- WHY CHOOSE ---------- */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Why ToursTaxi" title="Travel that feels first-class — every time" subtitle="From your first call to the final drop, every detail is designed for comfort, safety and zero surprises." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_CHOOSE.map((f, i) => {
              const Icon = ICONS[f.icon] || ShieldCheck;
              return (
                <Reveal key={f.title} delay={i * 0.06}>
                  <Card className="h-full group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border-slate-200">
                    <CardContent className="p-6">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-sky-100 to-orange-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Icon className="h-6 w-6 text-sky-600" />
                      </div>
                      <h3 className="font-bold text-lg text-slate-900 mb-1.5">{f.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                    </CardContent>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- FLEET ---------- */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Our Fleet" title="Pick the perfect ride for your journey" subtitle="From nimble sedans to spacious tempo travellers \u2014 every cab is sanitised, GPS-tracked and serviced fortnightly." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FLEET.map((v, i) => (
              <Reveal key={v.slug} delay={i * 0.06}>
                <Card className="overflow-hidden group hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 h-full">
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img src={v.image} alt={v.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-orange-500 text-white text-[11px] font-bold uppercase tracking-wide shadow">{v.badge}</div>
                  </div>
                  <CardContent className="p-5">
                    <div className="text-xs text-sky-600 font-semibold uppercase tracking-wider">{v.category}</div>
                    <h3 className="text-xl font-bold mt-1 text-slate-900">{v.name}</h3>
                    <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{v.seats}</span>
                      <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" />{v.luggage}</span>
                      <span className="flex items-center gap-1.5">{v.ac ? 'AC' : 'Non-AC'}</span>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <div className="text-[11px] text-slate-500">Starting</div>
                        <div className="text-2xl font-extrabold text-slate-900">\u20b9{v.startPrice.toLocaleString()}</div>
                      </div>
                      <Link href="/#book"><Button size="sm" className="bg-sky-500 hover:bg-sky-600">Book Now</Button></Link>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/fleet"><Button variant="outline" className="h-11 px-6 border-slate-300">View Full Fleet <ArrowRight className="h-4 w-4 ml-2" /></Button></Link>
          </div>
        </div>
      </section>

      {/* ---------- POPULAR ROUTES ---------- */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Popular Routes" title="India\u2019s most-booked outstation cab routes" subtitle="Fixed, all-inclusive prices on India\u2019s most-loved routes." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ROUTES.slice(0, 6).map((r, i) => (
              <Reveal key={`${r.from}-${r.to}`} delay={i * 0.05}>
                <Card className="overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="relative h-40 overflow-hidden">
                    <img src={r.image} alt={`${r.from} to ${r.to}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <div className="flex items-center gap-2 text-xs opacity-80"><MapPin className="h-3 w-3" /> {r.distance} \u00b7 {r.duration}</div>
                      <div className="text-xl font-bold flex items-center gap-2">{r.from} <ArrowRight className="h-4 w-4" /> {r.to}</div>
                    </div>
                  </div>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-500">Cab from</div>
                      <div className="text-xl font-extrabold text-slate-900">\u20b9{r.price.toLocaleString()}</div>
                    </div>
                    <Link href="/#book"><Button size="sm" variant="outline" className="hover:bg-sky-500 hover:text-white hover:border-sky-500">Book Cab</Button></Link>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- TOUR PACKAGES ---------- */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-900 via-slate-950 to-sky-950 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-orange-300 text-xs font-semibold uppercase tracking-wider mb-3"><span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" /> Curated Tours</div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">Handcrafted Rajasthan & Golden Triangle tours</h2>
            <p className="mt-3 text-white/70 text-base md:text-lg">Stay, sightseeing and chauffeured cab \u2014 everything taken care of.</p>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PACKAGES.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.06}>
                <Card className="overflow-hidden bg-white/5 border-white/10 backdrop-blur group hover:-translate-y-1.5 transition-all duration-300 h-full">
                  <div className="relative h-48 overflow-hidden">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-orange-500 text-white text-[11px] font-bold uppercase">{p.tag}</div>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-1.5 text-xs text-white/60"><Clock className="h-3.5 w-3.5" />{p.duration}</div>
                    <h3 className="text-lg font-bold mt-2 text-white">{p.title}</h3>
                    <p className="text-sm text-white/70 mt-2 line-clamp-3">{p.description}</p>
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <div className="text-[11px] text-white/50">From</div>
                        <div className="text-xl font-extrabold text-orange-400">\u20b9{p.price.toLocaleString()}</div>
                      </div>
                      <Link href="/tour-packages"><Button size="sm" className="bg-orange-500 hover:bg-orange-600">Book Now</Button></Link>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- TESTIMONIALS ---------- */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Reviews" title="Loved by travellers across India" subtitle="Real stories from people who explored India with ToursTaxi." />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.06}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-3">{Array.from({ length: t.rating }).map((_, k) => <Star key={k} className="h-4 w-4 fill-orange-400 text-orange-400" />)}</div>
                    <p className="text-sm text-slate-700 leading-relaxed mb-5">\u201c{t.text}\u201d</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                      <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">{t.name}</div>
                        <div className="text-xs text-slate-500">{t.city}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- APP DOWNLOAD ---------- */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-sky-700 to-orange-600 text-white p-8 lg:p-14">
            <div className="absolute inset-0 bg-grid opacity-30" />
            <div className="relative grid lg:grid-cols-2 gap-10 items-center">
              <Reveal>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-semibold uppercase tracking-wider mb-4"><Smartphone className="h-3.5 w-3.5" /> ToursTaxi App</div>
                <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">Book in 30 seconds.<br />Track your driver live.</h2>
                <p className="mt-4 text-white/85 text-base lg:text-lg max-w-lg">Download the ToursTaxi app for instant fares, saved addresses, exclusive deals and one-tap support.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="#" className="inline-flex items-center gap-2 px-5 h-12 rounded-xl bg-slate-900 hover:bg-black transition-colors"><Apple className="h-5 w-5" /><div className="text-left leading-tight"><div className="text-[10px] opacity-80">Download on the</div><div className="font-semibold">App Store</div></div></a>
                  <a href="#" className="inline-flex items-center gap-2 px-5 h-12 rounded-xl bg-slate-900 hover:bg-black transition-colors"><Play className="h-5 w-5" /><div className="text-left leading-tight"><div className="text-[10px] opacity-80">Get it on</div><div className="font-semibold">Google Play</div></div></a>
                </div>
                <ul className="mt-6 grid sm:grid-cols-2 gap-2 text-sm text-white/90">
                  {['Instant fare estimates', 'Live cab tracking', 'Save addresses & cards', '24×7 in-app support'].map(x => <li key={x} className="flex items-center gap-2"><Check className="h-4 w-4" /> {x}</li>)}
                </ul>
              </Reveal>
              <Reveal delay={0.15} className="relative">
                <div className="relative mx-auto w-64 lg:w-80">
                  <div className="absolute -inset-8 bg-white/20 blur-3xl rounded-full" />
                  <img src="https://images.unsplash.com/photo-1604357209793-fca5dca89f97?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwbWFwfGVufDB8fHx8MTc4MDcyNzY5Mnww&ixlib=rb-4.1.0&q=85" alt="app" className="relative w-full rounded-3xl border-4 border-white/30 shadow-2xl" />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="FAQ" title="Questions, answered" subtitle="Everything you wanted to know about booking with ToursTaxi." />
          <Reveal>
            <Accordion type="single" collapsible className="w-full bg-slate-50 rounded-2xl border border-slate-200 px-4 sm:px-6">
              {FAQS.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-slate-200">
                  <AccordionTrigger className="text-left font-semibold text-slate-900 hover:no-underline">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-slate-600 leading-relaxed">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>

      {/* ---------- CTA STRIP ---------- */}
      <section className="py-10 bg-orange-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
          <div className="text-center sm:text-left">
            <div className="font-extrabold text-xl sm:text-2xl">Ready to ride?</div>
            <div className="text-sm opacity-90">Call us anytime \u2014 our team books your cab in under 60 seconds.</div>
          </div>
          <a href="tel:+918955458128"><Button className="h-12 px-6 bg-white text-orange-600 hover:bg-slate-100 font-bold"><Phone className="h-4 w-4 mr-2" /> +91 8955458128</Button></a>
        </div>
      </section>
    </>
  );
}

export default Home;

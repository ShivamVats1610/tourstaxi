'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Apple, ArrowRight, BadgeIndianRupee, CalendarCheck, Check, Clock, Download, Headphones, Play, Route as RouteIcon, ShieldCheck, Smartphone, Star, Users, Briefcase, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import BookingWidget from '@/components/site/BookingWidget';
import Reveal from '@/components/site/Reveal';
import SectionTitle from '@/components/site/SectionTitle';
import { COMPANY, FAQS, FLEET, PACKAGES, ROUTES, TESTIMONIALS, WHY_CHOOSE } from '@/lib/data';

const HERO_BG = 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=2200&q=85';
const ICONS = { ShieldCheck, BadgeIndianRupee, Headphones, Clock, Route: RouteIcon };

function Home() {
  return (
    <>
      <section className="relative overflow-hidden pt-[72px] sm:pt-[74px]">
        <div className="relative min-h-[720px] pb-10 pt-16 sm:min-h-[680px] sm:pb-20 sm:pt-24">
          <img src={HERO_BG} alt="city road for cab booking" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-slate-950/62" />
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/80 via-slate-950/35 to-slate-950/70" />

          <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="mx-auto max-w-[22rem] text-[clamp(30px,10vw,44px)] font-black uppercase leading-[1.05] tracking-normal text-white sm:max-w-full sm:whitespace-nowrap sm:text-[clamp(36px,5.2vw,68px)]">
              Services Across 2000+ Cities
            </motion.h1>
          </div>

          <div className="relative mt-7 sm:mt-8">
            <BookingWidget />
          </div>

          <div className="relative mx-auto mt-14 max-w-4xl px-4 sm:mt-12">
            <div className="mx-auto flex flex-wrap items-center justify-center gap-3 text-base font-normal text-white sm:text-sm sm:font-semibold">
              <span className="flex items-center gap-2"><span className="text-2xl leading-none">{"{"}</span> India&apos;s top rated car rental service <span className="text-2xl leading-none">{"}"}</span></span>
            </div>
            <div className="mx-auto mt-5 hidden max-w-3xl grid-cols-1 overflow-hidden rounded-full bg-white shadow-[0_18px_30px_rgba(15,23,42,0.25)] sm:grid sm:grid-cols-3">
              <RatingBadge title="App Store" score="4.2K+ Reviews" icon={<Apple className="h-10 w-10 text-sky-500" />} />
              <RatingBadge title="Google" score="6.1K+ Reviews" icon={<span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-3xl font-black text-sky-600">G</span>} />
              <RatingBadge title="Play Store" score="15.5K+ Reviews" icon={<Play className="h-11 w-11 fill-emerald-500 text-emerald-500" />} />
            </div>
          </div>
        </div>
      </section>

      <section className="-mt-1 bg-white pb-12 pt-24">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          <PromoCard title="Book Now" subtitle="at zero cost" note="Pay after cab confirmation" tone="sky" />
          <PromoCard title="Premium Cabs" subtitle="for every route" note="Sedan, SUV and traveller options" image={FLEET[3]?.image} />
          <PromoCard title="Free Cancellations" subtitle="before your trip" note="Flexible travel plans" tone="emerald" />
        </div>
      </section>

      <section className="bg-slate-50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Cab Services" title="Choose the ride type you need" subtitle="Fast booking, clean cabs, and support that answers when your trip matters." />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              ['One Way Taxi', 'Pay only for the drop route.', ArrowRight],
              ['Round Trip', 'Keep the same cab for multi-day travel.', RouteIcon],
              ['Local Rental', 'Hourly packages for city travel.', Clock],
              ['Airport Transfer', 'Reliable pickups and drops.', CalendarCheck]
            ].map(([title, desc, Icon], index) => (
              <Reveal key={title} delay={index * 0.05}>
                <Card className="h-full rounded-lg border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl">
                  <CardContent className="p-6">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-sky-50 text-sky-600"><Icon className="h-6 w-6" /></div>
                    <h3 className="text-lg font-black text-slate-950">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
                    <Link href="/#book" className="mt-5 inline-flex items-center text-sm font-bold text-orange-600">Book now <ArrowRight className="ml-1 h-4 w-4" /></Link>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Why ToursTaxi" title="A smoother way to book outstation cabs" subtitle="Transparent fares, verified drivers and clean vehicles across India." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {WHY_CHOOSE.slice(0, 5).map((item, index) => {
              const Icon = ICONS[item.icon] || ShieldCheck;
              return (
                <Reveal key={item.title} delay={index * 0.05}>
                  <div className="h-full rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <Icon className="h-7 w-7 text-sky-500" />
                    <h3 className="mt-4 font-black text-slate-950">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Our Fleet" title="Cars for solo rides, families and groups" subtitle="Every cab is kept clean, AC-ready and suitable for outstation travel." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FLEET.map((vehicle, index) => (
              <Reveal key={vehicle.slug} delay={index * 0.04}>
                <Card className="h-full overflow-hidden rounded-lg border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl">
                  <img src={vehicle.image} alt={vehicle.name} className="h-48 w-full object-cover" />
                  <CardContent className="p-5">
                    <div className="text-xs font-black uppercase tracking-wide text-sky-600">{vehicle.category}</div>
                    <h3 className="mt-1 text-xl font-black text-slate-950">{vehicle.name}</h3>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{vehicle.seats}</span>
                      <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" />{vehicle.luggage}</span>
                    </div>
                    <div className="mt-5 flex items-center justify-between">
                      <div><span className="text-xs text-slate-500">Starting</span><div className="text-2xl font-black text-slate-950">Rs {vehicle.startPrice.toLocaleString()}</div></div>
                      <Link href="/#book"><Button className="rounded bg-sky-500 hover:bg-sky-600">Book</Button></Link>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Popular Routes" title="Most booked taxi routes" subtitle="Fixed route pricing for common outstation journeys." />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ROUTES.map((route, index) => (
              <Reveal key={`${route.from}-${route.to}`} delay={index * 0.04}>
                <Link href="/#book" className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-300 hover:shadow-lg">
                  <div>
                    <div className="flex items-center gap-2 text-lg font-black text-slate-950">{route.from} <ArrowRight className="h-4 w-4 text-sky-500" /> {route.to}</div>
                    <div className="mt-1 text-sm text-slate-500">{route.distance} · {route.duration}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">From</div>
                    <div className="text-xl font-black text-orange-600">Rs {route.price.toLocaleString()}</div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="download-app" className="bg-slate-950 py-16 text-white lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:px-8">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-sky-200"><Smartphone className="h-4 w-4" /> ToursTaxi App</div>
            <h2 className="mt-5 text-4xl font-black tracking-normal sm:text-5xl">Download the app for quicker cab booking</h2>
            <p className="mt-4 max-w-xl text-white/70">Save routes, compare cab choices, track support updates and manage bookings from one place.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#" className="inline-flex h-12 items-center gap-2 rounded-lg bg-white px-5 font-bold text-slate-950"><Apple className="h-5 w-5" /> App Store</a>
              <a href="#" className="inline-flex h-12 items-center gap-2 rounded-lg bg-white px-5 font-bold text-slate-950"><Download className="h-5 w-5" /> Google Play</a>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              {['Instant fare estimates', '24x7 booking support', 'Verified drivers', 'Easy cancellation'].map((item) => (
                <div key={item} className="flex items-center gap-3 border-b border-white/10 py-4 last:border-b-0"><Check className="h-5 w-5 text-emerald-400" /> {item}</div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Tour Packages" title="Rajasthan and Golden Triangle trips" subtitle="Cab, sightseeing and travel support bundled into easy packages." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PACKAGES.map((pkg, index) => (
              <Reveal key={pkg.slug} delay={index * 0.05}>
                <Card className="h-full overflow-hidden rounded-lg border-slate-200 transition hover:-translate-y-1 hover:shadow-xl">
                  <img src={pkg.image} alt={pkg.title} className="h-44 w-full object-cover" />
                  <CardContent className="p-5">
                    <div className="text-xs font-bold uppercase tracking-wide text-sky-600">{pkg.duration}</div>
                    <h3 className="mt-2 font-black text-slate-950">{pkg.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{pkg.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-black text-orange-600">Rs {pkg.price.toLocaleString()}</span>
                      <Link href="/tour-packages"><Button size="sm" variant="outline">Details</Button></Link>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Reviews" title="Trusted by travellers" subtitle="A cleaner booking experience backed by real support." />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {TESTIMONIALS.map((review, index) => (
              <Reveal key={review.name} delay={index * 0.04}>
                <Card className="h-full rounded-lg border-slate-200 bg-white">
                  <CardContent className="p-6">
                    <div className="mb-3 flex gap-1">{Array.from({ length: review.rating }).map((_, star) => <Star key={star} className="h-4 w-4 fill-orange-400 text-orange-400" />)}</div>
                    <p className="text-sm leading-6 text-slate-700">&quot;{review.text}&quot;</p>
                    <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                      <img src={review.avatar} alt={review.name} className="h-10 w-10 rounded-full object-cover" />
                      <div><div className="font-bold text-slate-950">{review.name}</div><div className="text-xs text-slate-500">{review.city}</div></div>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="FAQ" title="Questions, answered" subtitle="Important booking details before you ride." />
          <Accordion type="single" collapsible className="rounded-lg border border-slate-200 bg-slate-50 px-4">
            {FAQS.map((faq, index) => (
              <AccordionItem key={faq.q} value={`faq-${index}`}>
                <AccordionTrigger className="text-left font-bold text-slate-950 hover:no-underline">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-slate-600">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="bg-orange-500 py-9 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
          <div><div className="text-2xl font-black">Need help choosing a cab?</div><div className="text-sm opacity-90">Call our booking team and confirm your ride in minutes.</div></div>
          <a href={`tel:${COMPANY.phoneRaw}`}><Button className="h-12 rounded bg-white px-6 font-black text-orange-600 hover:bg-slate-100">{COMPANY.phone}</Button></a>
        </div>
      </section>
    </>
  );
}

function RatingBadge({ icon, title, score }) {
  return (
    <div className="flex items-center justify-center gap-3 border-b border-slate-100 px-5 py-4 sm:border-b-0 sm:border-r sm:last:border-r-0">
      {icon}
      <div className="text-left">
        <div className="font-black text-slate-950">{title}</div>
        <div className="flex text-lg leading-none text-orange-400">★★★★★</div>
        <div className="text-xs font-bold text-slate-950">({score})</div>
      </div>
    </div>
  );
}

function PromoCard({ title, subtitle, note, image, tone = 'orange' }) {
  const toneClass = tone === 'sky' ? 'from-sky-100 to-white text-sky-500' : tone === 'emerald' ? 'from-emerald-100 to-white text-sky-500' : 'from-orange-100 to-white text-orange-500';
  return (
    <div className={`relative min-h-40 overflow-hidden rounded-[28px] bg-gradient-to-br ${toneClass} p-6 shadow-sm`}>
      {image && <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />}
      <div className="relative">
        <div className="text-4xl font-black leading-none">{title}</div>
        <div className="text-2xl font-black text-slate-950">{subtitle}</div>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-slate-700">
          {tone === 'emerald' ? <XCircle className="h-4 w-4 text-emerald-500" /> : <Check className="h-4 w-4 text-emerald-500" />} {note}
        </div>
      </div>
    </div>
  );
}

export default Home;

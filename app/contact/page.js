'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Reveal from '@/components/site/Reveal';
import { COMPANY } from '@/lib/data';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [sending, setSending] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => { setSending(false); toast.success('Message sent!', { description: 'Our team will call you within 30 minutes.' }); e.target.reset(); }, 900);
  };

  return (
    <div className="pt-24">
      <section className="bg-gradient-to-br from-[#12233f] via-[#0f3f3b] to-[#071527] py-16 text-white sm:py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">Get in Touch</div>
          <h1 className="text-3xl md:text-5xl font-extrabold">We\u2019d love to plan your next trip</h1>
          <p className="mt-4 text-white/80 text-lg">Drop us a message, call our 24×7 desk, or just walk in \u2014 we\u2019re always happy to talk travel.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-10">
          <Reveal>
            <Card><CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl font-extrabold text-slate-900">Send us a message</h2>
              <p className="text-slate-600 mt-1 text-sm">We typically reply within 30 minutes.</p>
              <form onSubmit={submit} className="mt-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input required placeholder="Full Name" />
                  <Input required type="tel" placeholder="Phone Number" />
                </div>
                <Input required type="email" placeholder="Email Address" />
                <Input placeholder="Subject (e.g. Ranthambore tour for 4)" />
                <Textarea required placeholder="Tell us about your trip \u2014 dates, destinations, group size..." rows={5} />
                <Button type="submit" disabled={sending} className="w-full h-12 bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold">{sending ? 'Sending...' : <>Send Message <Send className="h-4 w-4 ml-2" /></>}</Button>
              </form>
            </CardContent></Card>
          </Reveal>

          <Reveal delay={0.1} className="space-y-4">
            {[
              { icon: MapPin, title: 'Office Address', value: COMPANY.address },
              { icon: Phone, title: 'Phone', value: COMPANY.phone, href: `tel:${COMPANY.phoneRaw}` },
              { icon: Mail, title: 'Email', value: COMPANY.email, href: `mailto:${COMPANY.email}` },
              { icon: Clock, title: 'Working Hours', value: 'Open 24 \u00d7 7 \u2014 even on holidays' }
            ].map((c, i) => (
              <Card key={i} className="group hover:-translate-y-0.5 hover:shadow-lg transition-all">
                <CardContent className="p-5 flex gap-4 items-start">
                  <div className="h-11 w-11 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700 shrink-0"><c.icon className="h-5 w-5" /></div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{c.title}</div>
                    {c.href ? <a href={c.href} className="text-slate-900 font-semibold hover:text-teal-700">{c.value}</a> : <div className="text-slate-900 font-semibold">{c.value}</div>}
                  </div>
                </CardContent>
              </Card>
            ))}
            <Card className="overflow-hidden">
              <div className="aspect-[4/3]">
                <iframe title="Sawai Madhopur Map" src="https://maps.google.com/maps?q=Sawai%20Madhopur%20Rajasthan&t=&z=13&ie=UTF8&iwloc=&output=embed" className="w-full h-full border-0" loading="lazy" />
              </div>
            </Card>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

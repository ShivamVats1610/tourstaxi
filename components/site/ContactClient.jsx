'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Reveal from '@/components/site/Reveal';
import { COMPANY } from '@/lib/data';
import { formatPhoneNumber, phoneHref } from '@/lib/phone-utils';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [sending, setSending] = useState(false);
  const [sitePhone, setSitePhone] = useState(COMPANY.phoneRaw);
  const [siteEmail, setSiteEmail] = useState(COMPANY.email);
  const sitePhoneLabel = formatPhoneNumber(sitePhone);

  useEffect(() => {
    let ignore = false;
    fetch('/api/pricing-settings', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : null)
      .then((result) => {
        if (!ignore && result?.settings?.callingNumber) setSitePhone(result.settings.callingNumber);
        if (!ignore && result?.settings?.websiteEmail) setSiteEmail(result.settings.websiteEmail);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    const form = new FormData(e.currentTarget);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(form.entries()))
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to send message.');
      toast.success('Message sent!', { description: result.emailSkipped ? 'Saved in admin records. Email credentials need checking.' : 'Our team will call you within 30 minutes.' });
      e.currentTarget.reset();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="pt-24">
      <section className="bg-gradient-to-br from-[#12233f] via-[#0f3f3b] to-[#071527] py-16 text-white sm:py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">Get in Touch</div>
          <h1 className="text-3xl md:text-5xl font-extrabold">We would love to plan your next trip</h1>
          <p className="mt-4 text-white/80 text-lg">Contact {COMPANY.legalName}, the local Sawai Madhopur taxi service behind ToursTaxi.</p>
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
                  <Input required name="name" placeholder="Full Name" />
                  <Input required name="phone" type="tel" placeholder="Phone Number" />
                </div>
                <Input required name="email" type="email" placeholder="Email Address" />
                <Input name="subject" placeholder="Subject (e.g. Ranthambore tour for 4)" />
                <Textarea required name="message" placeholder="Tell us about your trip - dates, destinations, group size..." rows={5} />
                <Button type="submit" disabled={sending} className="w-full h-12 bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold">{sending ? 'Sending...' : <>Send Message <Send className="h-4 w-4 ml-2" /></>}</Button>
              </form>
            </CardContent></Card>
          </Reveal>

          <Reveal delay={0.1} className="space-y-4">
            {[
              { icon: MapPin, title: 'Business Name', value: COMPANY.legalName },
              { icon: MapPin, title: 'Office Address', value: COMPANY.address },
              { icon: Phone, title: 'Phone', value: sitePhoneLabel, href: phoneHref(sitePhone) },
              { icon: Mail, title: 'Email', value: siteEmail, href: `mailto:${siteEmail}` },
              { icon: Clock, title: 'Working Hours', value: 'Open 24 \u00d7 7 - even on holidays' }
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
                <iframe title="Shree Ganesh Tours Taxi location map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3585.5030116424073!2d76.35445159999999!3d26.017092899999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396e257672fb05dd%3A0x2b0160204e84f32a!2sShree%20ganesh%20tours%20taxi!5e0!3m2!1sen!2sin!4v1783234648366!5m2!1sen!2sin" className="w-full h-full border-0" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
              </div>
            </Card>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

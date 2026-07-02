'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import { COMPANY, NAV } from '@/lib/data';
import { usePathname } from 'next/navigation';

export default function Footer({ settings = {} }) {
  const pathname = usePathname();
  const phone = settings.callingNumber || COMPANY.phoneRaw;
  const socials = [
    ['f', settings.facebookUrl],
    ['ig', settings.instagramUrl],
    ['x', settings.xUrl],
    ['yt', settings.youtubeUrl],
    ['g', settings.googleBusinessUrl],
  ].filter(([, href]) => href);

  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="bg-[#071527] text-slate-300 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-10 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img src="/icon.svg" alt="" className="h-10 w-10 rounded-xl shadow-lg" />
            <div>
              <div className="text-white font-extrabold text-lg">Tours<span className="text-teal-300">Taxi</span></div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Premium Cab Rentals</div>
            </div>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">India most-trusted cab partner for outstation trips, airport transfers and curated Rajasthan tours - serving 100+ cities since 2014.</p>
          <div className="flex gap-3">
            {socials.map(([label, href]) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-white/10 hover:bg-teal-700 flex items-center justify-center text-xs font-bold uppercase text-white transition-colors">{label}</a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            {NAV.map(n => <li key={n.href}><Link href={n.href} className="hover:text-teal-300 transition-colors">{n.label}</Link></li>)}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Top Routes</h4>
          <ul className="space-y-2 text-sm">
            {['Jaipur  to  Ranthambore', 'Delhi  to  Ranthambore', 'Agra  to  Ranthambore', 'Kota  to  Ranthambore', 'Jaipur  to  Udaipur', 'Sawai Madhopur  to  Jaipur'].map(r => (
              <li key={r}><Link href="/popular-routes" className="hover:text-teal-300 transition-colors">{r}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Get in Touch</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3"><MapPin className="h-5 w-5 text-amber-400 shrink-0" /><span>{COMPANY.address}</span></li>
            <li className="flex gap-3"><Phone className="h-5 w-5 text-amber-400 shrink-0" /><a href={`tel:${phone}`} className="hover:text-teal-300">{phone}</a></li>
            <li className="flex gap-3"><Mail className="h-5 w-5 text-amber-400 shrink-0" /><a href={`mailto:${COMPANY.email}`} className="hover:text-teal-300 break-all">{COMPANY.email}</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>&copy; {new Date().getFullYear()} ToursTaxi. All rights reserved. Powered by Amar Web Connect.</div>
        <div className="flex gap-5">
          <Link href="/privacy-policy" className="hover:text-teal-300">Privacy Policy</Link>
          <Link href="/terms-conditions" className="hover:text-teal-300">Terms & Conditions</Link>
        </div>
      </div>
    </footer>
  );
}

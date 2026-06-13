import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import { COMPANY, NAV } from '@/lib/data';

const SOCIALS = ['f', 'ig', 'x', 'yt'];

export default function Footer() {
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
          <p className="text-sm text-slate-400 leading-relaxed mb-4">India\u2019s most-trusted cab partner for outstation trips, airport transfers and curated Rajasthan tours \u2014 serving 100+ cities since 2014.</p>
          <div className="flex gap-3">
            {SOCIALS.map((label) => (
              <a key={label} href="#" className="h-9 w-9 rounded-full bg-white/10 hover:bg-teal-700 flex items-center justify-center text-xs font-bold uppercase text-white transition-colors">{label}</a>
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
            {['Jaipur \u2192 Ranthambore', 'Delhi \u2192 Ranthambore', 'Agra \u2192 Ranthambore', 'Kota \u2192 Ranthambore', 'Jaipur \u2192 Udaipur', 'Sawai Madhopur \u2192 Jaipur'].map(r => (
              <li key={r}><Link href="/popular-routes" className="hover:text-teal-300 transition-colors">{r}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Get in Touch</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3"><MapPin className="h-5 w-5 text-amber-400 shrink-0" /><span>{COMPANY.address}</span></li>
            <li className="flex gap-3"><Phone className="h-5 w-5 text-amber-400 shrink-0" /><a href={`tel:${COMPANY.phoneRaw}`} className="hover:text-teal-300">{COMPANY.phone}</a></li>
            <li className="flex gap-3"><Mail className="h-5 w-5 text-amber-400 shrink-0" /><a href={`mailto:${COMPANY.email}`} className="hover:text-teal-300 break-all">{COMPANY.email}</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>\u00a9 {new Date().getFullYear()} ToursTaxi. All rights reserved.</div>
        <div className="flex gap-5">
          <Link href="/privacy-policy" className="hover:text-teal-300">Privacy Policy</Link>
          <Link href="/terms-conditions" className="hover:text-teal-300">Terms & Conditions</Link>
        </div>
      </div>
    </footer>
  );
}

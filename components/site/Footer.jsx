'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import { COMPANY, NAV } from '@/lib/data';
import { formatPhoneNumber, phoneHref } from '@/lib/phone-utils';
import { usePathname } from 'next/navigation';

const SOCIAL_ICONS = {
  facebook: '/images/social/facebook.svg',
  instagram: '/images/social/instagram.svg',
  x: '/images/social/x.svg',
  youtube: '/images/social/youtube.svg',
  google: '/images/social/google.svg',
};

export default function Footer({ settings = {} }) {
  const pathname = usePathname();
  const phone = settings.callingNumber || COMPANY.phoneRaw;
  const phoneLabel = formatPhoneNumber(phone);
  const email = settings.websiteEmail || COMPANY.email;
  const socials = [
    ['facebook', 'Facebook', settings.facebookUrl],
    ['instagram', 'Instagram', settings.instagramUrl],
    ['x', 'X', settings.xUrl],
    ['youtube', 'YouTube', settings.youtubeUrl],
    ['google', 'Google Business', settings.googleBusinessUrl],
  ].filter(([key, , href]) => href || key === 'youtube');

  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="bg-[#071527] text-slate-300 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-10 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img src="/images/logo.png" alt="" className="h-10 w-10 rounded-full border border-amber-400 bg-white object-cover shadow-lg" />
            <div>
              <div className="text-white font-extrabold text-lg">Tours <span className="text-amber-300">Taxi</span></div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{COMPANY.legalName}</div>
            </div>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">ToursTaxi by {COMPANY.legalName} is a trusted cab partner for outstation trips, airport transfers and curated Rajasthan tours from Sawai Madhopur.</p>
          <div className="flex gap-3">
            {socials.map(([key, label, href]) => (
              href ? (
                <a key={key} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className="flex h-9 w-9 items-center justify-center rounded-full bg-white transition-colors hover:bg-white/90">
                  <img src={SOCIAL_ICONS[key]} alt="" className="h-5 w-5 object-contain" />
                </a>
              ) : (
                <span key={key} aria-label={`${label} coming soon`} title={`${label} coming soon`} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 opacity-75">
                  <img src={SOCIAL_ICONS[key]} alt="" className="h-5 w-5 object-contain" />
                </span>
              )
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
            <li className="font-bold text-white">{COMPANY.legalName}</li>
            <li className="flex gap-3"><MapPin className="h-5 w-5 text-amber-400 shrink-0" /><span>{COMPANY.address}</span></li>
            <li className="flex gap-3"><Phone className="h-5 w-5 text-amber-400 shrink-0" /><a href={phoneHref(phone)} className="hover:text-teal-300">{phoneLabel}</a></li>
            <li className="flex gap-3"><Mail className="h-5 w-5 text-amber-400 shrink-0" /><a href={`mailto:${email}`} className="hover:text-teal-300 break-all">{email}</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>&copy; {new Date().getFullYear()} ToursTaxi / {COMPANY.legalName}. All rights reserved. Developed by <a href="https://codnest.online/" target="_blank" rel="noopener noreferrer" className="hover:text-teal-300 transition-colors">Codnest Online</a> &amp; ExclusiveAI.</div>
        <div className="flex gap-5">
          <Link href="/privacy-policy" className="hover:text-teal-300">Privacy Policy</Link>
          <Link href="/terms-conditions" className="hover:text-teal-300">Terms & Conditions</Link>
        </div>
      </div>
    </footer>
  );
}

'use client';

import { ArrowUp, PhoneCall } from 'lucide-react';
import { COMPANY } from '@/lib/data';
import { phoneHref } from '@/lib/phone-utils';
import { usePathname } from 'next/navigation';

export default function WhatsAppButton({ settings = {} }) {
  const pathname = usePathname();
  const message = encodeURIComponent('Hi ToursTaxi, I want to book a cab.');
  const callNumber = settings.callingNumber || COMPANY.phoneRaw;
  const whatsappNumber = settings.whatsappNumber || callNumber;
  const href = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${message}`;

  if (pathname?.startsWith('/admin')) return null;

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-3 sm:right-6">
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top"
        className="group flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-950 shadow-[0_10px_25px_rgba(15,23,42,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-slate-50"
      >
        <ArrowUp className="h-5 w-5 transition group-hover:-translate-y-0.5" />
      </button>

      <a
        href={phoneHref(callNumber)}
        aria-label="Call ToursTaxi"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#f59e0b] text-slate-950 shadow-[0_14px_35px_rgba(15,23,42,0.28)] transition duration-300 hover:-translate-y-1 hover:bg-[#fbbf24]"
      >
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-amber-400/25" />
        <span className="absolute -inset-1 -z-20 rounded-full bg-amber-300/20 opacity-0 blur transition group-hover:opacity-100" />
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-amber-300 transition group-hover:rotate-12">
          <PhoneCall className="h-5 w-5" />
        </span>
      </a>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#128c7e] text-white shadow-[0_14px_35px_rgba(15,23,42,0.28)] transition duration-300 hover:-translate-y-1 hover:bg-[#0f766e]"
      >
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#128c7e]/25" />
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white transition group-hover:scale-110">
          <img src="/images/social/whatsapp.svg" alt="" className="h-5 w-5 object-contain" />
        </span>
      </a>
    </div>
  );
}

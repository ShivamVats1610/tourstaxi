'use client';

import { MessageCircle, PhoneCall } from 'lucide-react';
import { COMPANY } from '@/lib/data';
import { usePathname } from 'next/navigation';

export default function WhatsAppButton() {
  const pathname = usePathname();
  const message = encodeURIComponent('Hi ToursTaxi, I want to book a cab.');
  const href = `https://wa.me/${COMPANY.phoneRaw.replace(/\D/g, '')}?text=${message}`;

  if (pathname?.startsWith('/admin')) return null;

  return (
    <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-3 sm:right-6">
      <a
        href={`tel:${COMPANY.phoneRaw}`}
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
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#128c7e] transition group-hover:scale-110">
          <MessageCircle className="h-5 w-5" />
        </span>
      </a>
    </div>
  );
}

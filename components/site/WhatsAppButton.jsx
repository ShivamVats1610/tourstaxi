'use client';

import { MessageCircle } from 'lucide-react';
import { COMPANY } from '@/lib/data';

export default function WhatsAppButton() {
  const message = encodeURIComponent('Hi ToursTaxi, I want to book a cab.');
  const href = `https://wa.me/${COMPANY.phoneRaw.replace(/\D/g, '')}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="group fixed bottom-5 right-4 z-50 flex items-center gap-2 rounded-full bg-[#128c7e] px-3 py-3 text-white shadow-[0_14px_35px_rgba(15,23,42,0.28)] transition hover:-translate-y-0.5 hover:bg-[#0f766e] sm:right-6 sm:px-4"
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#128c7e]/25" />
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#128c7e]">
        <MessageCircle className="h-4 w-4" />
      </span>
      <span className="hidden text-sm font-black sm:inline">WhatsApp</span>
    </a>
  );
}

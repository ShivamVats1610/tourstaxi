'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Phone, LogIn, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { COMPANY, NAV } from '@/lib/data';
import { usePathname } from 'next/navigation';

export default function Header({ settings = {} }) {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    queueMicrotask(() => setOpen(false));
  }, [pathname]);

  useEffect(() => {
    let active = true;
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => {
        if (active) setSession(data.user || null);
      })
      .catch(() => {
        if (active) setSession(null);
      });

    return () => {
      active = false;
    };
  }, [pathname]);

  const dashboardHref = session?.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard';
  const visibleNav = NAV.filter((item) => ['Home', 'Services', 'Fleet', 'Routes', 'Tour Packages', 'Contact'].includes(item.label));
  const callNumber = settings.callingNumber || COMPANY.phoneRaw;
  const callLabel = callNumber.replace(/^\+91\s?/, '').replace(/^\+91/, '');

  if (pathname?.startsWith('/admin')) return null;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/95 text-slate-950 shadow-[0_2px_18px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:h-[74px] sm:gap-3 sm:px-6 lg:px-8 xl:max-w-[1280px]">
        <Link href="/" className="group flex min-w-0 shrink-0 items-center" aria-label="ToursTaxi home">
          <span className="flex items-center gap-2 rounded-lg bg-[#12233f] py-1 pl-1.5 pr-2.5 text-[clamp(14px,4.8vw,19px)] font-black italic leading-none tracking-wide text-white shadow-sm transition-colors group-hover:bg-[#0f1c33] sm:text-xl">
            <img src="/icon.svg" alt="" className="h-7 w-7 rounded-md sm:h-8 sm:w-8" />
            TOURS<span className="text-[#5eead4]">TAXI</span>
          </span>
        </Link>

        <a href={`tel:${callNumber}`} className="hidden h-9 min-w-0 items-center justify-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-2 text-[11px] font-bold text-teal-800 max-[359px]:w-9 max-[359px]:px-0 min-[390px]:px-2.5 min-[390px]:text-xs sm:h-11 md:flex md:items-stretch md:overflow-hidden md:rounded-md md:p-0">
          <span className="hidden items-center gap-1.5 bg-white px-3 text-slate-950 md:flex">
            <Phone className="h-4 w-4 text-teal-600" /> 24x7
          </span>
          <Phone className="h-4 w-4 md:hidden" />
          <span className="truncate max-[359px]:hidden md:bg-teal-600 md:px-3 md:py-2 md:text-white">{callLabel}</span>
        </a>

        <nav className="hidden flex-1 items-center justify-center gap-1 xl:flex">
          {visibleNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${active ? 'text-teal-700' : 'text-slate-700 hover:bg-teal-50 hover:text-teal-700'}`}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <Link href="/blog" className="text-sm font-semibold text-slate-800 hover:text-teal-700">Blog</Link>
          <Link href={session ? dashboardHref : '/login'}>
            <Button className="h-10 rounded-md bg-[#12233f] px-5 text-white hover:bg-[#0f1c33]">
              {session ? <LayoutDashboard className="mr-2 h-4 w-4" /> : <LogIn className="mr-2 h-4 w-4" />}
              {session ? 'Dashboard' : 'Login'}
            </Button>
          </Link>
        </div>

        <Link href={session ? dashboardHref : '/login'} className="shrink-0 lg:hidden">
          <Button className="h-9 rounded-md bg-slate-950 px-3 text-xs font-bold text-white hover:bg-slate-800 min-[390px]:px-3.5 sm:h-10 sm:text-sm">
            {session ? 'Dashboard' : 'Login'}
          </Button>
        </Link>

        <button onClick={() => setOpen(!open)} className="flex shrink-0 rounded-md p-2 text-slate-900 lg:hidden" aria-label="Toggle menu" aria-expanded={open}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-slate-200 bg-white lg:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">{item.label}</Link>
              ))}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link href="/blog"><Button variant="outline" className="w-full">Blog</Button></Link>
                <Link href={session ? dashboardHref : '/login'}><Button className="w-full bg-[#12233f] hover:bg-[#0f1c33]">{session ? 'Dashboard' : 'Login'}</Button></Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

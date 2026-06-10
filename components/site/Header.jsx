'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Phone, LogIn, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { COMPANY, NAV } from '@/lib/data';
import { usePathname } from 'next/navigation';

export default function Header() {
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

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white text-slate-950 shadow-[0_2px_18px_rgba(15,23,42,0.08)]">
      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center" aria-label="ToursTaxi home">
          <span className="rounded-md bg-sky-500 px-2.5 py-1 text-2xl font-black italic leading-none tracking-wide text-white shadow-sm transition-colors group-hover:bg-sky-600">
            TOURS<span className="text-slate-950">TAXI</span>
          </span>
        </Link>

        <a href={`tel:${COMPANY.phoneRaw}`} className="hidden items-stretch overflow-hidden rounded-md border border-sky-500 text-sm font-semibold md:flex">
          <span className="flex items-center gap-1.5 bg-white px-3 text-slate-950">
            <Phone className="h-4 w-4 text-sky-500" /> 24x7
          </span>
          <span className="bg-sky-500 px-3 py-2 text-white">{COMPANY.phone.replace('+91 ', '')}</span>
        </a>

        <nav className="hidden items-center gap-1 xl:flex">
          {visibleNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${active ? 'text-sky-600' : 'text-slate-700 hover:bg-slate-100 hover:text-sky-600'}`}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/blog" className="text-sm font-semibold text-slate-800 hover:text-sky-600">Blog</Link>
          <Link href={session ? dashboardHref : '/login'}>
            <Button className="h-10 rounded-full bg-sky-500 px-5 text-white hover:bg-sky-600">
              {session ? <LayoutDashboard className="mr-2 h-4 w-4" /> : <LogIn className="mr-2 h-4 w-4" />}
              {session ? 'Dashboard' : 'Login'}
            </Button>
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className="rounded-md p-2 text-slate-900 lg:hidden" aria-label="Toggle menu">
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
                <a href={`tel:${COMPANY.phoneRaw}`} className="col-span-2 rounded-md bg-sky-50 px-3 py-2 text-center text-sm font-bold text-sky-700">{COMPANY.phone}</a>
                <Link href="/blog"><Button variant="outline" className="w-full">Blog</Button></Link>
                <Link href={session ? dashboardHref : '/login'}><Button className="w-full bg-sky-500 hover:bg-sky-600">{session ? 'Dashboard' : 'Login'}</Button></Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

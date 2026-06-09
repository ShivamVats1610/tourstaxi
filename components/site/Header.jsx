'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Car, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NAV } from '@/lib/data';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/85 backdrop-blur-md shadow-[0_4px_20px_-8px_rgba(15,23,42,0.15)]' : 'bg-transparent'}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 to-orange-500 flex items-center justify-center shadow-lg shadow-sky-500/30 group-hover:rotate-6 transition-transform">
              <Car className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <div className={`font-extrabold text-lg tracking-tight ${scrolled ? 'text-slate-900' : 'text-white drop-shadow'}`}>Tours<span className="text-orange-500">Taxi</span></div>
              <div className={`text-[10px] uppercase tracking-[0.18em] ${scrolled ? 'text-slate-500' : 'text-white/80'}`}>Premium Cab Rentals</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={`relative px-3 py-2 text-sm font-medium rounded-md transition-colors ${active ? 'text-sky-600' : scrolled ? 'text-slate-700 hover:text-sky-600' : 'text-white/90 hover:text-white'}`}>
                  {item.label}
                  {active && (
                    <motion.span layoutId="nav-pill" className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-sky-500 to-orange-500" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {session ? (
            <Link href={dashboardHref}>
              <Button variant="outline" className="border-slate-300 hover:border-sky-500 hover:text-sky-600 bg-white/70 backdrop-blur">
                Dashboard
              </Button>
            </Link>
            ) : (
            <Link href="/login">
              <Button variant="outline" className="border-slate-300 hover:border-sky-500 hover:text-sky-600 bg-white/70 backdrop-blur">
                <LogIn className="h-4 w-4 mr-2" />Login
              </Button>
            </Link>
            )}
            
            <Link href="/#book">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30">Book Now</Button>
            </Link>
          </div>

          <button onClick={() => setOpen(!open)} className={`lg:hidden p-2 rounded-md ${scrolled ? 'text-slate-900' : 'text-white'}`}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="lg:hidden bg-white border-t border-slate-200 overflow-hidden">
            <div className="px-4 py-4 flex flex-col gap-1">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100 font-medium">{item.label}</Link>
              ))}
              <div className="flex gap-2 mt-2">
                <Link href={session ? dashboardHref : '/login'} className="flex-1"><Button variant="outline" className="w-full">{session ? 'Dashboard' : 'Login'}</Button></Link>
               
                <Link href="/#book" className="flex-1"><Button className="w-full bg-orange-500 hover:bg-orange-600">Book Now</Button></Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

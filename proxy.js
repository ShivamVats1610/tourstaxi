import { NextResponse } from 'next/server';
import { SESSION_COOKIE, parseSessionToken } from './lib/session-token';

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const session = parseSessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  const protectedRoute = pathname.startsWith('/admin') || pathname.startsWith('/customer') || pathname === '/dashboard';

  if (protectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname.startsWith('/admin') && session?.role !== 'admin') {
    return NextResponse.redirect(new URL('/customer/dashboard', request.url));
  }

  if (pathname.startsWith('/customer') && session?.role === 'admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  if ((pathname === '/login' || pathname === '/register') && session) {
    return NextResponse.redirect(new URL(session.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/customer/:path*', '/dashboard', '/login', '/register'],
};

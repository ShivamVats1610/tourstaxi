import './globals.css';
import { Inter } from 'next/font/google';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import { Toaster } from 'sonner';
import BookingProvider from '@/lib/booking-context';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'ToursTaxi — Premium Cab Booking & Rajasthan Tours',
  description: 'Book outstation cabs, airport transfers and curated Rajasthan tour packages with ToursTaxi. Verified drivers, transparent pricing, 24×7 support. 100+ cities.',
  keywords: 'cab booking, ranthambore taxi, jaipur taxi, golden triangle tour, outstation cab, ToursTaxi'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-slate-50 text-slate-900">
        <BookingProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </BookingProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}

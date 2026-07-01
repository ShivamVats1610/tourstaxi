import './globals.css';
import { Inter } from 'next/font/google';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import WhatsAppButton from '@/components/site/WhatsAppButton';
import { Toaster } from 'sonner';
import BookingProvider from '@/lib/booking-context';
import { listCabs } from '@/lib/crm';
import { getPricingSettings } from '@/lib/pricing-settings';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'ToursTaxi - Premium Cab Booking & Rajasthan Tours',
  description: 'Book outstation cabs, airport transfers and curated Rajasthan tour packages with ToursTaxi. Verified drivers, transparent pricing, 24x7 support. 100+ cities.',
  keywords: 'cab booking, ranthambore taxi, jaipur taxi, golden triangle tour, outstation cab, ToursTaxi',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg'
  }
};

export default async function RootLayout({ children }) {
  const [cabs, settings] = await Promise.all([
    listCabs({ fallbackToFleet: false }),
    getPricingSettings()
  ]);

  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-slate-50 font-sans text-slate-900 antialiased">
        <BookingProvider cabs={cabs}>
          <Header settings={settings} />
          <main className="min-h-screen">{children}</main>
          <WhatsAppButton settings={settings} />
          <Footer settings={settings} />
        </BookingProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast: 'tourstaxi-toast',
              title: 'tourstaxi-toast-title',
              description: 'tourstaxi-toast-description',
              success: 'tourstaxi-toast-success',
              error: 'tourstaxi-toast-error'
            }
          }}
        />
      </body>
    </html>
  );
}

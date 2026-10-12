import { SITE_URL, PUBLIC_PAGES, businessSchema } from '@/lib/seo';
import { COMPANY } from '@/lib/data';
import JsonLd from '@/components/site/JsonLd';
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
  metadataBase: new URL(SITE_URL),
  title: { default: 'ToursTaxi | Sawai Madhopur Taxi & Rajasthan Tours', template: '%s | ToursTaxi' },
  description: PUBLIC_PAGES['/'][1],
  applicationName: 'ToursTaxi',
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
  icons: { icon: '/icon.png', shortcut: '/icon.png', apple: '/apple-icon.png' },
};

export default async function RootLayout({ children }) {
  const [cabs, settings] = await Promise.all([
    listCabs({ fallbackToFleet: false }),
    getPricingSettings()
  ]);

  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-slate-50 font-sans text-slate-900 antialiased">
        <JsonLd data={businessSchema(COMPANY, settings)} />
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

import PaymentClient from './payment-client';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'UPI Payment | ToursTaxi', robots: { index: false, follow: false } };

export default async function PaymentPage({ params }) {
  const { bookingId } = await params;
  return <PaymentClient bookingId={bookingId} />;
}

import PaymentClient from './payment-client';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'UPI Payment | ToursTaxi' };

export default async function PaymentPage({ params }) {
  const { bookingId } = await params;
  return <PaymentClient bookingId={bookingId} />;
}

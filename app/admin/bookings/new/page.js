import { listAdminBookings } from '@/lib/crm';
import { BookingTable } from '../../_components';

export const metadata = { title: 'New Bookings | ToursTaxi Admin' };
export const dynamic = 'force-dynamic';

export default async function NewBookingsPage() {
  const bookings = await listAdminBookings();
  const today = dateKey(new Date());
  const activeBookings = bookings.filter((booking) => (
    dateKey(booking.pickupDate) >= today &&
    !['completed', 'cancelled'].includes(booking.status)
  ));
  return <BookingTable bookings={activeBookings} title="Customer New Bookings" />;
}

function dateKey(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
}

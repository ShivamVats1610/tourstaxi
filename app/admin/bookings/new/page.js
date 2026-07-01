import { listAdminBookings } from '@/lib/crm';
import { BookingTable } from '../../_components';

export const metadata = { title: 'New Bookings | ToursTaxi Admin' };
export const dynamic = 'force-dynamic';

export default async function NewBookingsPage() {
  const bookings = await listAdminBookings();
  const activeBookings = bookings.filter((booking) => (
    !['completed', 'cancelled'].includes(booking.status)
  ));
  return <BookingTable bookings={activeBookings} title="Customer New Bookings" />;
}

import { listAdminBookings } from '@/lib/crm';
import { BookingTable } from '../../_components';

export const metadata = { title: 'Old Bookings | ToursTaxi Admin' };
export const dynamic = 'force-dynamic';

export default async function OldBookingsPage() {
  const bookings = await listAdminBookings();
  const oldBookings = bookings.filter((booking) => ['completed', 'cancelled'].includes(booking.status));
  return <BookingTable bookings={oldBookings} title="Customer Old Bookings" />;
}

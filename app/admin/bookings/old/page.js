import { listAdminBookings } from '@/lib/crm';
import { BookingTable } from '../../_components';
import { isOldBooking, todayDateValue } from '@/lib/booking-groups';

export const metadata = { title: 'Old Bookings | ToursTaxi Admin' };
export const dynamic = 'force-dynamic';

export default async function OldBookingsPage() {
  const bookings = await listAdminBookings();
  const today = todayDateValue();
  const oldBookings = bookings.filter((booking) => isOldBooking(booking, today));
  return <BookingTable bookings={oldBookings} title="Customer Old Bookings" tone="old" />;
}

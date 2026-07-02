import { listAdminBookings } from '@/lib/crm';
import { BookingTable } from '../../_components';
import { isNewBooking, todayDateValue } from '@/lib/booking-groups';

export const metadata = { title: 'New Bookings | ToursTaxi Admin' };
export const dynamic = 'force-dynamic';

export default async function NewBookingsPage() {
  const bookings = await listAdminBookings();
  const today = todayDateValue();
  const activeBookings = bookings.filter((booking) => isNewBooking(booking, today));
  return <BookingTable bookings={activeBookings} title="Customer New Bookings" />;
}

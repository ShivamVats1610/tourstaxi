import { listAdminBookings } from '@/lib/crm';
import { BookingTable } from '../../_components';
import { isNewBooking, todayDateValue } from '@/lib/booking-groups';
import { filterBookingsBySearch } from '@/lib/booking-search';

export const metadata = { title: 'New Bookings | ToursTaxi Admin' };
export const dynamic = 'force-dynamic';

export default async function NewBookingsPage({ searchParams }) {
  const query = String((await searchParams)?.q || '').trim();
  const bookings = await listAdminBookings();
  const today = todayDateValue();
  const activeBookings = filterBookingsBySearch(bookings.filter((booking) => isNewBooking(booking, today)), query);
  return <BookingTable bookings={activeBookings} title="Customer New Bookings" searchQuery={query} />;
}

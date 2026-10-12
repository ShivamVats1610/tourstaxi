import { listAdminBookings } from '@/lib/crm';
import { BookingTable } from '../../_components';
import { isOldBooking, todayDateValue } from '@/lib/booking-groups';
import { filterBookingsBySearch } from '@/lib/booking-search';

export const metadata = { title: 'Old Bookings | ToursTaxi Admin' };
export const dynamic = 'force-dynamic';

export default async function OldBookingsPage({ searchParams }) {
  const query = String((await searchParams)?.q || '').trim();
  const bookings = await listAdminBookings();
  const today = todayDateValue();
  const oldBookings = filterBookingsBySearch(bookings.filter((booking) => isOldBooking(booking, today)), query);
  return <BookingTable bookings={oldBookings} title="Customer Old Bookings" tone="old" searchQuery={query} />;
}

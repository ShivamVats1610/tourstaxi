import { CalendarClock, Car, IndianRupee, Phone, Users } from 'lucide-react';
import { adminStats, listAdminBookings, listCabs, listUsers } from '@/lib/crm';
import { getPricingSettings } from '@/lib/pricing-settings';
import { isNewBooking, todayDateValue } from '@/lib/booking-groups';
import { BookingTable, Notice, PricingSettingsForm, Stat, money } from '../_components';
import AdminBookingNotifier from './AdminBookingNotifier';

export const metadata = { title: 'Admin Dashboard | ToursTaxi' };
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [stats, bookings, cabs, users, pricingSettings] = await Promise.all([
    adminStats(),
    listAdminBookings(),
    listCabs({ includeInactive: true }),
    listUsers(),
    getPricingSettings(),
  ]);
  const activeCabs = cabs.filter((cab) => cab.status !== 'inactive').length;
  const revenue = bookings.reduce((sum, booking) => sum + Number(booking.fare?.total || 0), 0);
  const latest = bookings[0];
  const today = todayDateValue();
  const activeBookings = bookings.filter((booking) => isNewBooking(booking, today));

  return (
    <div className="grid gap-5">
      <AdminBookingNotifier latestBookingId={latest?.bookingId || ''} latestCreatedAt={latest?.createdAt ? String(latest.createdAt) : ''} />
      {stats.dbUnavailable && <Notice text="CRM data is temporarily unavailable while the database connection is restored." />}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Stat icon={CalendarClock} label="Bookings" value={stats.bookings} hint={`${stats.newBookings} new`} href="/admin/bookings/new" />
        <Stat icon={Car} label="Active Cabs" value={activeCabs} hint={`${cabs.length} total`} href="/admin/cars" />
        <Stat icon={Users} label="Customers" value={stats.users} hint={`${users.length} accounts`} href="/admin/customers" />
        <Stat icon={Phone} label="Assigned" value={stats.assignedBookings} hint="Driver follow-up" href="/admin/bookings/new" />
        <Stat icon={IndianRupee} label="Fare Value" value={money(revenue)} hint="Visible bookings" href="/admin/bookings/old" />
      </div>
      <PricingSettingsForm settings={pricingSettings} />
      <BookingTable bookings={activeBookings.slice(0, 10)} title="Latest Active Bookings" />
    </div>
  );
}

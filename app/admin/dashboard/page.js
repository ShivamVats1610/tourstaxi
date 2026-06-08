import { CalendarClock, Car, IndianRupee, LogOut, Phone, Sparkles, Users } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';
import { requireUser } from '@/lib/auth';
import { adminStats, listAdminBookings } from '@/lib/crm';

export const metadata = { title: 'Admin Dashboard | ToursTaxi' };
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const user = await requireUser('admin');
  const [stats, bookings] = await Promise.all([adminStats(), listAdminBookings()]);

  return (
    <DashboardShell user={user} title="Admin Dashboard">
      {(user.dbUnavailable || stats.dbUnavailable) && (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 shadow-lg shadow-amber-900/5">
          Booking and customer data is temporarily unavailable while the database connection is restored.
        </div>
      )}
      <div className="grid gap-3 md:grid-cols-4">
        <Stat icon={CalendarClock} label="Total Bookings" value={stats.bookings} />
        <Stat icon={Car} label="New Requests" value={stats.newBookings} />
        <Stat icon={Users} label="Customers" value={stats.users} />
        <Stat icon={Phone} label="Assigned" value={stats.assignedBookings} />
      </div>

      <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-bold text-slate-950">Booking Pipeline</h2>
          <p className="text-sm text-slate-500">Latest customer enquiries from the website booking flow.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Booking</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Trip</th>
                <th className="px-5 py-3">Cab</th>
                <th className="px-5 py-3">Fare</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((booking) => (
                <tr key={booking.id} className="align-top">
                  <td className="px-5 py-4">
                    <div className="font-mono font-bold text-slate-950">{booking.bookingId}</div>
                    <div className="text-xs text-slate-500">{formatDate(booking.createdAt)}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-900">{booking.customer.name}</div>
                    <div className="text-xs text-slate-500">{booking.customer.phone}</div>
                    <div className="text-xs text-slate-500">{booking.customer.email || 'No email'}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-semibold capitalize text-slate-900">{booking.tripType?.replace('-', ' ')}</div>
                    <div className="text-xs text-slate-500">{booking.pickup} to {booking.tripType === 'local' ? booking.rental : booking.drop}</div>
                    <div className="text-xs text-slate-500">{booking.pickupDate} at {booking.pickupTime}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-700">{booking.vehicleName || booking.vehicleSlug}</td>
                  <td className="px-5 py-4 font-bold text-slate-950">
                    {booking.fare?.total ? <span className="inline-flex items-center"><IndianRupee className="h-3.5 w-3.5" />{booking.fare.total.toLocaleString()}</span> : '-'}
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-sky-700">{booking.status}</span>
                  </td>
                </tr>
              ))}
              {!bookings.length && (
                <tr>
                  <td colSpan="6" className="px-5 py-10 text-center text-slate-500">No bookings yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardShell>
  );
}

function DashboardShell({ user, title, children }) {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden pt-28 pb-20 text-white">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1625037669075-e5472e080265?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85" alt="ToursTaxi admin dashboard" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-sky-900/65" />
          <div className="absolute inset-0 bg-grid opacity-40" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-orange-400" /> {title}
              </div>
              <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">Welcome, {user.name}</h1>
              <p className="mt-3 max-w-2xl text-white/75">Manage ToursTaxi bookings, customers, fares, and request status from the same polished site experience.</p>
            </div>
            <form action={logoutAction}>
              <button className="inline-flex h-11 items-center rounded-md border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur hover:bg-white hover:text-slate-950">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="relative -mt-12 px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </section>
    </main>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xl shadow-slate-900/10">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-500">{label}</div>
        <Icon className="h-5 w-5 text-sky-500" />
      </div>
      <div className="mt-3 text-3xl font-extrabold text-slate-950">{value}</div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

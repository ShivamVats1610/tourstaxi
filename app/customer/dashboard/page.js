import Link from 'next/link';
import { ArrowRight, CalendarClock, Car, LogOut, Mail, MapPin, Phone, Sparkles, User } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';
import { updateProfileAction } from '@/app/actions/crm';
import { requireUser } from '@/lib/auth';
import { listCustomerBookings } from '@/lib/crm';

export const metadata = { title: 'Customer Dashboard | ToursTaxi' };
export const dynamic = 'force-dynamic';

export default async function CustomerDashboard() {
  const user = await requireUser('customer');
  const bookings = await listCustomerBookings(user);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden pt-28 pb-20 text-white">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1625037669075-e5472e080265?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85" alt="ToursTaxi cab dashboard" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-sky-900/65" />
          <div className="absolute inset-0 bg-grid opacity-40" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-orange-400" /> Customer Dashboard
              </div>
              <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">Welcome, {user.name}</h1>
              <p className="mt-3 max-w-2xl text-white/75">Track your ToursTaxi bookings, upcoming ride requests, fare status, and account details in one place.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/#book" className="inline-flex h-11 items-center rounded-md bg-orange-500 px-4 text-sm font-bold text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600">
                Book Ride <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <form action={logoutAction}>
                <button className="inline-flex h-11 items-center rounded-md border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur hover:bg-white hover:text-slate-950">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="relative -mt-12 px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
        {user.dbUnavailable && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 shadow-lg shadow-amber-900/5">
            Booking data is temporarily unavailable while the database connection is restored.
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-3">
          <Summary icon={CalendarClock} label="Total Trips" value={bookings.length} />
          <Summary icon={Car} label="Active Requests" value={bookings.filter((booking) => booking.status !== 'completed').length} />
          <Summary icon={Phone} label="Profile Phone" value={user.phone || 'Not set'} small />
        </div>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/10">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="font-bold text-slate-950">My Profile</h2>
            <p className="text-sm text-slate-500">Keep your contact details updated for booking confirmations and driver calls.</p>
          </div>
          <form action={updateProfileAction} className="mt-4 grid gap-3 md:grid-cols-4">
            <Labeled icon={User} label="Name"><input name="name" defaultValue={user.name || ''} className="h-10 rounded-md border border-slate-200 px-3 text-sm" /></Labeled>
            <Labeled icon={Mail} label="Email"><input name="email" type="email" defaultValue={user.email || ''} className="h-10 rounded-md border border-slate-200 px-3 text-sm" /></Labeled>
            <Labeled icon={Phone} label="Phone"><input name="phone" defaultValue={user.phone || ''} className="h-10 rounded-md border border-slate-200 px-3 text-sm" /></Labeled>
            <button className="mt-5 h-10 rounded-md bg-slate-950 px-4 text-sm font-bold text-white hover:bg-slate-800">Update Profile</button>
          </form>
        </section>

        <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-slate-950">My Bookings</h2>
            <p className="text-sm text-slate-500">Bookings connected to your account email, phone, or active login.</p>
          </div>
          <div className="grid gap-3 p-4">
            {bookings.map((booking) => (
              <article key={booking.id} className="rounded-xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="font-mono text-sm font-bold text-sky-700">{booking.bookingId}</div>
                    <h3 className="mt-1 font-bold text-slate-950">{booking.vehicleName || booking.vehicleSlug}</h3>
                    <div className="mt-2 flex items-start gap-2 text-sm text-slate-600">
                      <MapPin className="mt-0.5 h-4 w-4 text-orange-500" />
                      <span>{booking.pickup} to {booking.tripType === 'local' ? booking.rental : booking.drop}</span>
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-sky-700">{booking.status}</span>
                    <div className="mt-3 text-sm font-semibold text-slate-900">{booking.pickupDate} at {booking.pickupTime}</div>
                    <div className="text-sm text-slate-500">{booking.fare?.total ? `Rs ${booking.fare.total.toLocaleString()}` : 'Fare pending'}</div>
                  </div>
                </div>
              </article>
            ))}
            {!bookings.length && (
              <div className="rounded-lg border border-dashed border-slate-300 px-5 py-10 text-center text-slate-500">
                You do not have bookings yet.
              </div>
            )}
          </div>
        </section>
        </div>
      </section>
    </main>
  );
}

function Labeled({ icon: Icon, label, children }) {
  return (
    <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
      <span className="flex items-center gap-1.5"><Icon className="h-3.5 w-3.5 text-sky-500" /> {label}</span>
      {children}
    </label>
  );
}

function Summary({ icon: Icon, label, value, small }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xl shadow-slate-900/10">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-500">{label}</div>
        <Icon className="h-5 w-5 text-sky-500" />
      </div>
      <div className={`mt-3 font-extrabold text-slate-950 ${small ? 'text-xl' : 'text-3xl'}`}>{value}</div>
    </div>
  );
}

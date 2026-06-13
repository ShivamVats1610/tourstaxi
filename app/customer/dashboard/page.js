import Link from 'next/link';
import { ArrowRight, CalendarClock, Car, Clock, LogOut, Mail, MapPin, Phone, Route, Sparkles, User } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';
import { updateProfileAction } from '@/app/actions/crm';
import { requireUser } from '@/lib/auth';
import { listCustomerBookings } from '@/lib/crm';

export const metadata = { title: 'Customer Dashboard | ToursTaxi' };
export const dynamic = 'force-dynamic';

export default async function CustomerDashboard() {
  const user = await requireUser('customer');
  const bookings = await listCustomerBookings(user);
  const activeBookings = bookings.filter((booking) => !['completed', 'cancelled'].includes(booking.status)).length;
  const totalFare = bookings.reduce((sum, booking) => sum + Number(booking.fare?.total || 0), 0);

  return (
    <main className="min-h-screen bg-[#f7faf9]">
      <section className="border-b border-slate-200 bg-[#12233f] px-4 pb-20 pt-20 text-white sm:px-6 sm:pb-24 sm:pt-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Customer Dashboard
              </div>
              <h1 className="text-3xl font-black leading-tight sm:text-5xl">My Trips</h1>
              <p className="mt-3 max-w-2xl text-sm font-medium text-slate-300">Welcome, {user.name}. Track ride requests, fare status, pickup details, and your contact profile in one place.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/#book" className="inline-flex h-10 items-center rounded-md bg-amber-400 px-4 text-sm font-black text-slate-950 hover:bg-amber-300 sm:h-11">
                Book Ride <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <form action={logoutAction}>
                <button className="inline-flex h-11 items-center rounded-md border border-white/20 bg-white/10 px-4 text-sm font-bold text-white hover:bg-white hover:text-slate-950">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="relative -mt-12 px-3 pb-12 sm:-mt-16 sm:px-6 sm:pb-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {user.dbUnavailable && <Notice text="Booking data is temporarily unavailable while the database connection is restored." />}

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Summary icon={CalendarClock} label="Total Trips" value={bookings.length} />
            <Summary icon={Car} label="Active Requests" value={activeBookings} />
            <Summary icon={Phone} label="Profile Phone" value={user.phone || 'Not set'} small />
            <Summary icon={Route} label="Fare Value" value={money(totalFare)} />
          </div>

          <div className="mt-4 grid gap-4 lg:mt-6 lg:grid-cols-[320px_1fr]">
            <BookingsPanel bookings={bookings} />
            <ProfilePanel user={user} />
          </div>
        </div>
      </section>
    </main>
  );
}

function ProfilePanel({ user }) {
  return (
    <section className="h-fit rounded-lg border border-slate-200 bg-white shadow-sm lg:sticky lg:top-24">
      <div className="border-b border-slate-200 px-4 py-3 sm:px-5 sm:py-4">
        <h2 className="font-black text-slate-950">Profile</h2>
        <p className="text-sm font-medium text-slate-600">Keep contact details ready for driver calls.</p>
      </div>
      <form action={updateProfileAction} className="grid gap-3 p-4 sm:p-5">
        <Labeled icon={User} label="Name">
          <input name="name" defaultValue={user.name || ''} className="h-10 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-950 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15" />
        </Labeled>
        <Labeled icon={Mail} label="Email">
          <input name="email" type="email" defaultValue={user.email || ''} className="h-10 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-950 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15" />
        </Labeled>
        <Labeled icon={Phone} label="Phone">
          <input name="phone" defaultValue={user.phone || ''} className="h-10 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-950 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15" />
        </Labeled>
        <button className="h-10 rounded-md bg-[#12233f] px-4 text-sm font-black text-white hover:bg-[#0f1c33]">Update Profile</button>
      </form>
    </section>
  );
}

function BookingsPanel({ bookings }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3 sm:px-5 sm:py-4">
        <h2 className="font-black text-slate-950">My Bookings</h2>
        <p className="text-sm font-medium text-slate-600">Bookings connected to your phone, email, or login.</p>
      </div>
      <div className="grid gap-3 p-3 sm:p-4">
        {bookings.map((booking) => (
          <article key={booking.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:border-teal-200 hover:shadow-md sm:p-4">
            <div className="grid gap-4 xl:grid-cols-[1fr_auto]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-black text-teal-700">{booking.bookingId}</span>
                  <StatusBadge status={booking.status} />
                </div>
                <h3 className="mt-2 text-lg font-black text-slate-950 sm:text-xl">{booking.vehicleName || booking.vehicleSlug || 'Vehicle pending'}</h3>
                <div className="mt-3 grid gap-2 text-sm font-medium text-slate-700 md:grid-cols-2">
                  <span className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /> {booking.pickup} to {booking.tripType === 'local' ? booking.rental : booking.drop}</span>
                  <span className="flex items-center gap-2"><Clock className="h-4 w-4 shrink-0 text-teal-600" /> {booking.pickupDate || '-'} at {booking.pickupTime || '-'}</span>
                  <span className="flex items-center gap-2"><Car className="h-4 w-4 shrink-0 text-teal-600" /> {labelTrip(booking.tripType)}</span>
                  <span className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0 text-teal-600" /> Support will call after confirmation</span>
                </div>
              </div>
              <div className="rounded-md bg-teal-50 p-3 xl:min-w-44 xl:text-right">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Fare</div>
                <div className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">{booking.fare?.total ? money(booking.fare.total) : 'Pending'}</div>
                <div className="mt-2 text-xs font-semibold text-slate-600">{booking.passengers || 'Passengers not set'}</div>
              </div>
            </div>
          </article>
        ))}
        {!bookings.length && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-white text-teal-700 shadow-sm"><Car className="h-6 w-6" /></div>
            <div className="mt-3 font-black text-slate-950">No bookings yet</div>
            <p className="mt-1 text-sm font-medium text-slate-600">Your ride requests will appear here after booking.</p>
            <Link href="/#book" className="mt-4 inline-flex h-10 items-center rounded-md bg-amber-400 px-4 text-sm font-black text-slate-950 hover:bg-amber-300">
              Book your first ride
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function Labeled({ icon: Icon, label, children }) {
  return (
    <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
      <span className="flex items-center gap-1.5"><Icon className="h-3.5 w-3.5 text-teal-600" /> {label}</span>
      {children}
    </label>
  );
}

function Summary({ icon: Icon, label, value, small }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold text-slate-600 sm:text-sm">{label}</div>
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-50 text-teal-700 sm:h-10 sm:w-10"><Icon className="h-4 w-4 sm:h-5 sm:w-5" /></span>
      </div>
      <div className={`mt-2 font-black text-slate-950 sm:mt-3 ${small ? 'text-base sm:text-xl' : 'text-2xl sm:text-3xl'}`}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const value = String(status || 'new');
  const tones = {
    new: 'bg-amber-50 text-amber-700 ring-amber-200',
    assigned: 'bg-teal-50 text-teal-700 ring-teal-200',
    confirmed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    completed: 'bg-slate-950 text-white ring-slate-950',
    cancelled: 'bg-red-50 text-red-700 ring-red-200'
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wide ring-1 ${tones[value] || tones.new}`}>{value}</span>;
}

function Notice({ text }) {
  return <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800 shadow-sm">{text}</div>;
}

function labelTrip(value) {
  return String(value || 'one-way').replace('-', ' ');
}

function money(value) {
  return `Rs ${Number(value || 0).toLocaleString('en-IN')}`;
}

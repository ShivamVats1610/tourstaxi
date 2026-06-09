import { CalendarClock, Car, LogOut, Phone, Sparkles, Trash2, Upload, Users } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';
import { deleteBookingAction, deleteCabAction, deleteUserAction, saveCabAction, updateBookingAction, updateUserAction } from '@/app/actions/crm';
import { requireUser } from '@/lib/auth';
import { adminStats, listAdminBookings, listCabs, listUsers } from '@/lib/crm';

export const metadata = { title: 'Admin CRM | ToursTaxi' };
export const dynamic = 'force-dynamic';

const STATUSES = ['new', 'assigned', 'confirmed', 'completed', 'cancelled'];

export default async function AdminDashboard() {
  const user = await requireUser('admin');
  const [stats, bookings, cabs, users] = await Promise.all([adminStats(), listAdminBookings(), listCabs({ includeInactive: true }), listUsers()]);

  return (
    <DashboardShell user={user}>
      {(user.dbUnavailable || stats.dbUnavailable) && <Notice text="CRM data is temporarily unavailable while the database connection is restored." />}
      <div className="grid gap-3 md:grid-cols-4">
        <Stat icon={CalendarClock} label="Total Bookings" value={stats.bookings} />
        <Stat icon={Car} label="New Requests" value={stats.newBookings} />
        <Stat icon={Users} label="Customers" value={stats.users} />
        <Stat icon={Phone} label="Assigned" value={stats.assignedBookings} />
      </div>

      <CabManager cabs={cabs} />
      <Bookings bookings={bookings} />
      <Customers users={users} />
    </DashboardShell>
  );
}

function CabManager({ cabs }) {
  return (
    <section className="mt-6 grid gap-4 lg:grid-cols-[420px_1fr]">
      <Panel title="Add Cab" subtitle="Upload Cloudinary cab image and pricing details.">
        <CabForm />
      </Panel>
      <Panel title="Fleet CRM" subtitle="Edit, pause, delete, and update cab prices shown on the website.">
        <div className="grid gap-3">
          {cabs.map((cab) => (
            <details key={cab.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <summary className="cursor-pointer list-none">
                <div className="flex items-center gap-3">
                  <img src={cab.image} alt={cab.name} className="h-16 w-20 rounded-md object-cover bg-slate-200" />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-950">{cab.name}</div>
                    <div className="text-xs font-medium text-slate-700">{cab.category} · Rs {cab.pricePerKm}/km · Rs {cab.startPrice} start</div>
                  </div>
                  <span className="rounded-full bg-white px-2 py-1 text-xs font-bold uppercase text-slate-800 ring-1 ring-slate-200">{cab.status}</span>
                </div>
              </summary>
              <div className="mt-4 border-t border-slate-200 pt-4">
                <CabForm cab={cab} />
                <form action={deleteCabAction} className="mt-2">
                  <input type="hidden" name="id" value={cab.id} />
                  <DangerButton label="Delete cab" />
                </form>
              </div>
            </details>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function CabForm({ cab = {} }) {
  return (
    <form action={saveCabAction} className="grid gap-3">
      <input type="hidden" name="id" defaultValue={cab.id || ''} />
      <Field name="name" label="Cab Name" defaultValue={cab.name} placeholder="e.g. Swift Dzire" required />
      <Field name="slug" label="Slug" defaultValue={cab.slug} placeholder="e.g. swift-dzire" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field name="category" label="Category" defaultValue={cab.category} placeholder="e.g. Sedan" />
        <Field name="badge" label="Badge" defaultValue={cab.badge} placeholder="e.g. Best Value" />
        <Field name="seats" label="Seats" type="number" defaultValue={cab.seats || 4} placeholder="e.g. 4" />
        <Field name="luggage" label="Luggage" defaultValue={cab.luggage} placeholder="e.g. 2 Bags" />
        <Field name="pricePerKm" label="Price Per Km" type="number" defaultValue={cab.pricePerKm || 0} placeholder="e.g. 12" />
        <Field name="startPrice" label="Start Price" type="number" defaultValue={cab.startPrice || 0} placeholder="e.g. 1499" />
      </div>
      <Field name="image" label="Current Image URL" defaultValue={cab.image} placeholder="e.g. https://res.cloudinary.com/.../swift-dzire.jpg" />
      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
        <span className="mb-1 flex items-center gap-1.5"><Upload className="h-3.5 w-3.5" /> Upload Cab Image</span>
        <input name="imageFile" type="file" accept="image/*" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 file:mr-3 file:rounded file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white" />
      </label>
      <Field name="features" label="Features" defaultValue={cab.features?.join?.(', ') || ''} placeholder="e.g. Music System, Push-Back Seats, USB Charging" />
      <textarea name="description" defaultValue={cab.description || ''} placeholder="e.g. Comfortable sedan for city, airport, and outstation trips." className="min-h-20 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-500" />
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-900"><input type="checkbox" name="ac" defaultChecked={cab.ac !== false} /> AC</label>
        <select name="status" defaultValue={cab.status || 'active'} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-950 sm:col-span-2">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <button className="h-10 rounded-md bg-slate-950 px-4 text-sm font-bold text-white hover:bg-slate-800">Save Cab</button>
    </form>
  );
}

function Bookings({ bookings }) {
  return (
    <Panel title="Booking Pipeline" subtitle="Update fare, status, notes, or remove test enquiries." className="mt-6">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm text-slate-950">
          <thead className="bg-slate-100 text-[11px] uppercase tracking-wider text-slate-700">
            <tr><th className="px-4 py-3">Booking</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Trip</th><th className="px-4 py-3">Fare / Status</th><th className="px-4 py-3">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.map((booking) => (
              <tr key={booking.id} className="align-top">
                <td className="px-4 py-4"><div className="font-mono font-bold text-slate-950">{booking.bookingId}</div><div className="text-xs font-medium text-slate-700">{formatDate(booking.createdAt)}</div></td>
                <td className="px-4 py-4"><b className="text-slate-950">{booking.customer.name}</b><div className="text-xs font-medium text-slate-700">{booking.customer.phone}</div><div className="text-xs font-medium text-slate-700">{booking.customer.email || 'No email'}</div></td>
                <td className="px-4 py-4"><b className="capitalize text-slate-950">{booking.tripType?.replace('-', ' ')}</b><div className="text-xs font-medium text-slate-700">{booking.pickup} to {booking.tripType === 'local' ? booking.rental : booking.drop}</div><div className="text-xs font-medium text-slate-700">{booking.vehicleName || booking.vehicleSlug}</div></td>
                <td className="px-4 py-4">
                  <form action={updateBookingAction} className="grid gap-2">
                    <input type="hidden" name="id" value={booking.id} />
                    <input name="totalFare" type="number" defaultValue={booking.fare?.total || ''} className="h-9 rounded-md border border-slate-300 bg-white px-2 font-semibold text-slate-950 placeholder:text-slate-500" />
                    <select name="status" defaultValue={booking.status} className="h-9 rounded-md border border-slate-300 bg-white px-2 font-semibold text-slate-950">
                      {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                    <input name="notes" defaultValue={booking.notes || ''} placeholder="Admin notes" className="h-9 rounded-md border border-slate-300 bg-white px-2 font-medium text-slate-950 placeholder:text-slate-500" />
                    <button className="h-9 rounded-md bg-sky-600 px-3 text-xs font-bold text-white">Update</button>
                  </form>
                </td>
                <td className="px-4 py-4"><form action={deleteBookingAction}><input type="hidden" name="id" value={booking.id} /><DangerButton label="Delete" /></form></td>
              </tr>
            ))}
            {!bookings.length && <tr><td colSpan="5" className="px-5 py-10 text-center font-medium text-slate-700">No bookings yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function Customers({ users }) {
  return (
    <Panel title="Customers & Admins" subtitle="Edit customers, delete stale accounts, or promote trusted users to admin." className="mt-6">
      <div className="grid gap-3 md:grid-cols-2">
        {users.map((item) => (
          <form key={item.id} action={updateUserAction} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <input type="hidden" name="id" value={item.id} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field name="name" label="Name" defaultValue={item.name} />
              <Field name="phone" label="Phone" defaultValue={item.phone} />
              <Field name="email" label="Email" defaultValue={item.email} />
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Role
                <select name="role" defaultValue={item.role} className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950">
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="h-9 rounded-md bg-slate-950 px-3 text-xs font-bold text-white">Save User</button>
              <button formAction={deleteUserAction} className="inline-flex h-9 items-center rounded-md border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-700"><Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete</button>
            </div>
          </form>
        ))}
      </div>
    </Panel>
  );
}

function Field({ label, ...props }) {
  return <label className="text-xs font-bold uppercase tracking-wider text-slate-700">{label}<input {...props} className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-medium normal-case tracking-normal text-slate-950 placeholder:text-slate-500" /></label>;
}

function Panel({ title, subtitle, children, className = '' }) {
  return <section className={`overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-900/10 ${className}`}><div className="border-b border-slate-200 px-5 py-4"><h2 className="font-bold text-slate-950">{title}</h2><p className="text-sm font-medium text-slate-700">{subtitle}</p></div><div className="p-5">{children}</div></section>;
}

function DashboardShell({ user, children }) {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden pt-28 pb-20 text-white">
        <div className="absolute inset-0"><img src="https://images.unsplash.com/photo-1625037669075-e5472e080265?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85" alt="ToursTaxi admin dashboard" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-sky-900/65" /></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur"><Sparkles className="h-3.5 w-3.5 text-orange-400" /> Admin CRM</div><h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">Welcome, {user.name}</h1><p className="mt-3 max-w-2xl text-white/75">Manage bookings, cabs, prices, customers, and admin access from one professional workspace.</p></div>
            <form action={logoutAction}><button className="inline-flex h-11 items-center rounded-md border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur hover:bg-white hover:text-slate-950"><LogOut className="mr-2 h-4 w-4" /> Logout</button></form>
          </div>
        </div>
      </section>
      <section className="relative -mt-12 px-4 pb-16 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl">{children}</div></section>
    </main>
  );
}

function Stat({ icon: Icon, label, value }) {
  return <div className="rounded-lg border border-slate-100 bg-white p-5 shadow-xl shadow-slate-900/10"><div className="flex items-center justify-between"><div className="text-sm font-semibold text-slate-700">{label}</div><Icon className="h-5 w-5 text-sky-500" /></div><div className="mt-3 text-3xl font-extrabold text-slate-950">{value}</div></div>;
}

function DangerButton({ label }) {
  return <button className="inline-flex h-9 items-center rounded-md border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-700"><Trash2 className="mr-1.5 h-3.5 w-3.5" /> {label}</button>;
}

function Notice({ text }) {
  return <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 shadow-lg shadow-amber-900/5">{text}</div>;
}

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

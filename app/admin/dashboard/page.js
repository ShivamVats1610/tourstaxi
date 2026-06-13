import { CalendarClock, Car, CheckCircle2, IndianRupee, LogOut, Phone, Plus, Sparkles, Trash2, Upload, Users } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';
import { deleteBookingAction, deleteCabAction, deleteUserAction, saveCabAction, updateBookingAction, updateUserAction } from '@/app/actions/crm';
import { requireUser } from '@/lib/auth';
import { adminStats, listAdminBookings, listCabs, listUsers } from '@/lib/crm';
import ToastSubmitButton from '@/components/ui/toast-submit-button';
import AdminBookingNotifier from './AdminBookingNotifier';

export const metadata = { title: 'Admin CRM | ToursTaxi' };
export const dynamic = 'force-dynamic';

const STATUSES = ['new', 'assigned', 'confirmed', 'completed', 'cancelled'];

export default async function AdminDashboard() {
  const user = await requireUser('admin');
  const [stats, bookings, cabs, users] = await Promise.all([
    adminStats(),
    listAdminBookings(),
    listCabs({ includeInactive: true }),
    listUsers()
  ]);
  const activeCabs = cabs.filter((cab) => cab.status !== 'inactive').length;
  const revenue = bookings.reduce((sum, booking) => sum + Number(booking.fare?.total || 0), 0);

  return (
    <DashboardShell user={user}>
      <AdminBookingNotifier latestBookingId={bookings[0]?.bookingId || ''} latestCreatedAt={bookings[0]?.createdAt ? String(bookings[0].createdAt) : ''} />
      {(user.dbUnavailable || stats.dbUnavailable) && <Notice text="CRM data is temporarily unavailable while the database connection is restored." />}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <Stat icon={CalendarClock} label="Bookings" value={stats.bookings} hint={`${stats.newBookings} new`} />
        <Stat icon={Car} label="Active Cabs" value={activeCabs} hint={`${cabs.length} total`} />
        <Stat icon={Users} label="Customers" value={stats.users} hint={`${users.length} accounts`} />
        <Stat icon={Phone} label="Assigned" value={stats.assignedBookings} hint="Driver follow-up" />
        <Stat icon={IndianRupee} label="Fare Value" value={money(revenue)} hint="Visible bookings" />
      </div>

      <CabManager cabs={cabs} />
      <Bookings bookings={bookings} />
      <Customers users={users} />
    </DashboardShell>
  );
}

function CabManager({ cabs }) {
  return (
    <section className="mt-4 grid gap-4 xl:mt-6 xl:grid-cols-[380px_1fr]">
      <Panel title="Add Cab" subtitle="Create a website-ready cab with price, image, and package details." icon={Plus}>
        <CabForm />
      </Panel>

      <Panel title="Fleet CRM" subtitle="Edit pricing, pause vehicles, and keep cab details consistent across the site." icon={Car}>
        <div className="grid gap-3">
          {cabs.map((cab) => (
            <details key={cab.id} className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <summary className="cursor-pointer list-none p-4 transition hover:bg-slate-50">
                <div className="grid gap-3 sm:grid-cols-[92px_1fr_auto] sm:items-center">
                  <div className="flex h-20 items-center justify-center rounded-md bg-slate-100 p-2">
                    {cab.image ? <img src={cab.image} alt={cab.name} className="max-h-full max-w-full object-contain" /> : <Car className="h-8 w-8 text-slate-400" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black text-slate-950">{cab.name || 'Unnamed cab'}</h3>
                      <StatusBadge status={cab.status || 'active'} />
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-700">
                      {cab.category || 'Category not set'} | {cab.seats || 4} seats | Rs {cab.pricePerKm || 0}/km | Local Rs {cab.localPricePerKm || cab.pricePerKm || 0}/km | 4/40 Rs {cab.local4hrPrice || 'auto'} | 8/80 Rs {cab.local8hrPrice || 'auto'} | 12/120 Rs {cab.local12hrPrice || 'auto'} | {(cab.fuelOptions || []).join(', ') || 'fuel not set'}
                    </div>
                    <div className="mt-1 truncate text-xs font-medium text-slate-500">{cab.features?.join?.(', ') || 'No features added yet'}</div>
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wide text-teal-700">Open editor</div>
                </div>
              </summary>
              <div className="border-t border-slate-200 bg-slate-50 p-4">
                <CabForm cab={cab} />
                <form action={deleteCabAction} className="mt-3">
                  <input type="hidden" name="id" value={cab.id} />
                  <DangerButton label="Delete cab" />
                </form>
              </div>
            </details>
          ))}
          {!cabs.length && <EmptyState title="No cabs yet" text="Add your first cab to start showing fleet options on the website." />}
        </div>
      </Panel>
    </section>
  );
}

function CabForm({ cab = {} }) {
  return (
    <form action={saveCabAction} className="grid gap-3">
      <input type="hidden" name="id" defaultValue={cab.id || ''} />
      <Field name="name" label="Cab Name" defaultValue={cab.name} placeholder="Swift Dzire" required />
      <Field name="slug" label="Slug" defaultValue={cab.slug} placeholder="swift-dzire" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field name="category" label="Category" defaultValue={cab.category} placeholder="Sedan" />
        <Field name="badge" label="Badge" defaultValue={cab.badge} placeholder="Best Value" />
        <Field name="seats" label="Seats" type="number" min="1" defaultValue={cab.seats || 4} />
        <Field name="luggage" label="Luggage" defaultValue={cab.luggage} placeholder="2 Bags" />
        <Field name="pricePerKm" label="Price Per Km" type="number" min="0" step="0.1" defaultValue={cab.pricePerKm || 0} />
        <Field name="localPricePerKm" label="Local Price Per Km" type="number" min="0" step="0.1" defaultValue={cab.localPricePerKm || cab.pricePerKm || 0} />
        <Field name="startPrice" label="Start Price" type="number" min="0" defaultValue={cab.startPrice || 0} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field name="local4hrPrice" label="4hrs | 40km Price" type="number" min="0" defaultValue={cab.local4hrPrice || ''} placeholder="Auto from local/km" />
        <Field name="local8hrPrice" label="8hrs | 80km Price" type="number" min="0" defaultValue={cab.local8hrPrice || ''} placeholder="Auto from local/km" />
        <Field name="local12hrPrice" label="12hrs | 120km Price" type="number" min="0" defaultValue={cab.local12hrPrice || ''} placeholder="Auto from local/km" />
      </div>
      <Field name="image" label="Image URL" defaultValue={cab.image} placeholder="https://res.cloudinary.com/.../cab.jpg" />
      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
        <span className="mb-1 flex items-center gap-1.5"><Upload className="h-3.5 w-3.5 text-teal-600" /> Upload Cab Image</span>
        <input name="imageFile" type="file" accept="image/*" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 file:mr-3 file:rounded-md file:border-0 file:bg-slate-950 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white" />
      </label>
      <Field name="features" label="Features" defaultValue={cab.features?.join?.(', ') || ''} placeholder="Music System, Push-Back Seats, USB Charging" />
      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
        Description
        <textarea name="description" defaultValue={cab.description || ''} placeholder="Comfortable cab for city, airport, and outstation trips." className="mt-1 min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium normal-case tracking-normal text-slate-950 placeholder:text-slate-500" />
      </label>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_2fr]">
        <label className="flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold text-slate-950">
          <input type="checkbox" name="ac" defaultChecked={cab.ac !== false} className="accent-teal-600" /> AC cab
        </label>
        <div className="flex h-10 items-center gap-3 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold text-slate-950">
          <label className="flex items-center gap-1.5"><input type="checkbox" name="fuelOptions" value="cng" defaultChecked={!cab.fuelOptions?.length || cab.fuelOptions?.includes('cng')} className="accent-teal-600" /> CNG</label>
          <label className="flex items-center gap-1.5"><input type="checkbox" name="fuelOptions" value="diesel" defaultChecked={!cab.fuelOptions?.length || cab.fuelOptions?.includes('diesel')} className="accent-teal-600" /> Diesel</label>
        </div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Status
          <select name="status" defaultValue={cab.status || 'active'} className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold normal-case tracking-normal text-slate-950">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
      </div>
      <ToastSubmitButton message="Saving cab details" description="Fleet details are being updated." className="inline-flex h-11 items-center justify-center rounded-md bg-[#12233f] px-4 text-sm font-black text-white transition hover:bg-[#0f1c33]">
        <CheckCircle2 className="mr-2 h-4 w-4" /> Save Cab
      </ToastSubmitButton>
    </form>
  );
}

function Bookings({ bookings }) {
  return (
    <Panel title="Booking Pipeline" subtitle="Update fare, assign status, add notes, and remove test enquiries." icon={CalendarClock} className="mt-6">
      <div className="grid gap-3 lg:hidden">
        {bookings.map((booking) => (
          <article key={booking.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-mono text-sm font-black text-teal-700">{booking.bookingId}</div>
                <div className="mt-1 text-xs font-medium text-slate-600">{formatDate(booking.createdAt)}</div>
              </div>
              <StatusBadge status={booking.status} />
            </div>
            <div className="mt-3">
              <b className="text-slate-950">{booking.customer?.name || 'Guest'}</b>
              <div className="text-xs font-medium text-slate-700">{booking.customer?.phone || 'No phone'}</div>
              <div className="mt-2 text-xs font-medium text-slate-700">{booking.pickup} to {booking.tripType === 'local' ? booking.rental : booking.drop}</div>
              <div className="mt-1 text-xs font-semibold text-slate-900">{booking.vehicleName || booking.vehicleSlug || 'Vehicle pending'}</div>
              <div className="mt-2 text-lg font-black text-teal-700">{booking.fare?.total ? money(booking.fare.total) : 'Pending'}</div>
              <FareBreakdown fare={booking.fare} />
            </div>
            <form action={updateBookingAction} className="mt-3 grid gap-2">
              <input type="hidden" name="id" value={booking.id} />
              <div className="grid grid-cols-2 gap-2">
                <input name="totalFare" type="number" min="0" defaultValue={booking.fare?.total || ''} placeholder="Total fare" className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm font-semibold text-slate-950 placeholder:text-slate-500" />
                <select name="status" defaultValue={booking.status} className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm font-semibold capitalize text-slate-950">
                  {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
              <input name="notes" defaultValue={booking.notes || ''} placeholder="Admin notes" className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm font-medium text-slate-950 placeholder:text-slate-500" />
              <div className="flex gap-2">
                <ToastSubmitButton message="Updating booking" description="Booking changes are being saved." className="h-9 flex-1 rounded-md bg-teal-700 px-3 text-xs font-black text-white hover:bg-teal-800">Update</ToastSubmitButton>
                <ToastSubmitButton formAction={deleteBookingAction} message="Deleting booking" description="Removing this booking from CRM." className="inline-flex h-9 items-center rounded-md border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-700 hover:bg-red-100"><Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete</ToastSubmitButton>
              </div>
            </form>
          </article>
        ))}
        {!bookings.length && <EmptyState title="No bookings yet" text="New website booking enquiries will appear here." />}
      </div>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1040px] text-left text-sm text-slate-950">
          <thead className="bg-slate-100 text-[11px] uppercase tracking-wider text-slate-700">
            <tr>
              <th className="px-4 py-3">Booking</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Trip</th>
              <th className="px-4 py-3">Fare</th>
              <th className="px-4 py-3">Manage</th>
              <th className="px-4 py-3">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.map((booking) => (
              <tr key={booking.id} className="align-top transition hover:bg-slate-50">
                <td className="px-4 py-4">
                  <div className="font-mono font-black text-slate-950">{booking.bookingId}</div>
                  <div className="mt-1 text-xs font-medium text-slate-600">{formatDate(booking.createdAt)}</div>
                  <StatusBadge status={booking.status} className="mt-2" />
                </td>
                <td className="px-4 py-4">
                  <b className="text-slate-950">{booking.customer?.name || 'Guest'}</b>
                  <div className="text-xs font-medium text-slate-700">{booking.customer?.phone || 'No phone'}</div>
                  <div className="text-xs font-medium text-slate-700">{booking.customer?.email || 'No email'}</div>
                </td>
                <td className="px-4 py-4">
                  <b className="capitalize text-slate-950">{booking.tripType?.replace('-', ' ') || 'Trip'}</b>
                  <div className="mt-1 max-w-sm text-xs font-medium text-slate-700">{booking.pickup} to {booking.tripType === 'local' ? booking.rental : booking.drop}</div>
                  <div className="mt-1 text-xs font-semibold text-slate-900">{booking.vehicleName || booking.vehicleSlug || 'Vehicle pending'}</div>
                  <div className="text-xs font-medium text-slate-600">{booking.pickupDate || '-'} at {booking.pickupTime || '-'}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-lg font-black text-teal-700">{booking.fare?.total ? money(booking.fare.total) : 'Pending'}</div>
                  <div className="text-xs font-medium text-slate-600">{booking.passengers || 'Passengers not set'}</div>
                  <FareBreakdown fare={booking.fare} />
                </td>
                <td className="px-4 py-4">
                  <form action={updateBookingAction} className="grid min-w-48 gap-2">
                    <input type="hidden" name="id" value={booking.id} />
                    <input name="totalFare" type="number" min="0" defaultValue={booking.fare?.total || ''} placeholder="Total fare" className="h-9 rounded-md border border-slate-300 bg-white px-2 font-semibold text-slate-950 placeholder:text-slate-500" />
                    <select name="status" defaultValue={booking.status} className="h-9 rounded-md border border-slate-300 bg-white px-2 font-semibold capitalize text-slate-950">
                      {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                    <input name="notes" defaultValue={booking.notes || ''} placeholder="Admin notes" className="h-9 rounded-md border border-slate-300 bg-white px-2 font-medium text-slate-950 placeholder:text-slate-500" />
                    <ToastSubmitButton message="Updating booking" description="Booking changes are being saved." className="h-9 rounded-md bg-teal-700 px-3 text-xs font-black text-white hover:bg-teal-800">Update Booking</ToastSubmitButton>
                  </form>
                </td>
                <td className="px-4 py-4">
                  <form action={deleteBookingAction}>
                    <input type="hidden" name="id" value={booking.id} />
                    <DangerButton label="Delete" />
                  </form>
                </td>
              </tr>
            ))}
            {!bookings.length && <tr><td colSpan="6" className="px-5 py-10"><EmptyState title="No bookings yet" text="New website booking enquiries will appear here." /></td></tr>}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function FareBreakdown({ fare }) {
  if (!fare) return <div className="mt-2 text-xs font-medium text-slate-500">Fare breakdown pending</div>;
  const rows = [
    ['Actual Distance', formatKm(fare.actualDistance)],
    ['Minimum Distance', formatKm(fare.minimumDistance)],
    ['Chargeable Distance', formatKm(fare.chargeableDistance)],
    ['Vehicle Rate', `Rs ${fare.vehicleRate || 0}/KM`],
    ['Estimated Fare', money(fare.estimatedFare || fare.total)],
    ['Trip Days', fare.tripDays || 1]
  ];
  return (
    <div className="mt-2 grid gap-1 rounded-md bg-slate-50 p-2 text-[11px] font-semibold text-slate-700">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-2">
          <span>{label}</span>
          <b className="text-slate-950">{value}</b>
        </div>
      ))}
      {fare.minimumApplied && <div className="mt-1 rounded bg-amber-50 px-2 py-1 text-amber-700">Minimum billing of 250 KM per day has been applied.</div>}
    </div>
  );
}

function Customers({ users }) {
  return (
    <Panel title="Customers & Admins" subtitle="Edit customer records and manage trusted admin access." icon={Users} className="mt-6">
      <div className="grid gap-3 lg:grid-cols-2">
        {users.map((item) => (
          <form key={item.id} action={updateUserAction} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <input type="hidden" name="id" value={item.id} />
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="font-black text-slate-950">{item.name || 'Unnamed user'}</div>
                <div className="text-xs font-semibold text-slate-500">{item.email || 'No email'}</div>
              </div>
              <StatusBadge status={item.role || 'customer'} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field name="name" label="Name" defaultValue={item.name} />
              <Field name="phone" label="Phone" defaultValue={item.phone} />
              <Field name="email" label="Email" type="email" defaultValue={item.email} />
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Role
                <select name="role" defaultValue={item.role} className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold normal-case tracking-normal text-slate-950">
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <ToastSubmitButton message="Saving user" description="Customer details are being updated." className="h-9 rounded-md bg-[#12233f] px-3 text-xs font-black text-white hover:bg-[#0f1c33]">Save User</ToastSubmitButton>
              <button formAction={deleteUserAction} className="inline-flex h-9 items-center rounded-md border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-700 hover:bg-red-100"><Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete</button>
            </div>
          </form>
        ))}
        {!users.length && <EmptyState title="No users found" text="Registered customers and admins will appear here." />}
      </div>
    </Panel>
  );
}

function DashboardShell({ user, children }) {
  return (
    <main className="min-h-screen bg-[#f7faf9]">
      <section className="border-b border-slate-200 bg-[#12233f] px-4 pb-20 pt-20 text-white sm:px-6 sm:pb-24 sm:pt-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Admin CRM
              </div>
              <h1 className="text-3xl font-black leading-tight sm:text-5xl">Operations Dashboard</h1>
              <p className="mt-3 max-w-2xl text-sm font-medium text-slate-300">Welcome, {user.name}. Manage bookings, fleet inventory, pricing, and customer records from one focused workspace.</p>
            </div>
            <form action={logoutAction}>
              <button className="inline-flex h-11 items-center rounded-md border border-white/20 bg-white/10 px-4 text-sm font-bold text-white hover:bg-white hover:text-slate-950">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </button>
            </form>
          </div>
        </div>
      </section>
      <section className="relative -mt-12 px-3 pb-12 sm:-mt-16 sm:px-6 sm:pb-16 lg:px-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </section>
    </main>
  );
}

function Stat({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold text-slate-600 sm:text-sm">{label}</div>
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-50 text-teal-700 sm:h-10 sm:w-10"><Icon className="h-4 w-4 sm:h-5 sm:w-5" /></span>
      </div>
      <div className="mt-2 text-2xl font-black text-slate-950 sm:mt-3 sm:text-3xl">{value}</div>
      {hint && <div className="mt-1 text-xs font-semibold text-slate-500">{hint}</div>}
    </div>
  );
}

function Panel({ title, subtitle, icon: Icon, children, className = '' }) {
  return (
    <section className={`overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>
      <div className="flex items-start gap-3 border-b border-slate-200 bg-white px-5 py-4">
        {Icon && <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md bg-[#12233f] text-white"><Icon className="h-4 w-4" /></span>}
        <div>
          <h2 className="font-black text-slate-950">{title}</h2>
          <p className="text-sm font-medium text-slate-600">{subtitle}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
      {label}
      <input {...props} className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-medium normal-case tracking-normal text-slate-950 outline-none placeholder:text-slate-500 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15" />
    </label>
  );
}

function StatusBadge({ status, className = '' }) {
  const value = String(status || 'new');
  const tones = {
    active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    inactive: 'bg-slate-100 text-slate-600 ring-slate-200',
    new: 'bg-amber-50 text-amber-700 ring-amber-200',
    assigned: 'bg-teal-50 text-teal-700 ring-teal-200',
    confirmed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    completed: 'bg-slate-950 text-white ring-slate-950',
    cancelled: 'bg-red-50 text-red-700 ring-red-200',
    admin: 'bg-teal-50 text-teal-700 ring-teal-200',
    customer: 'bg-slate-100 text-slate-700 ring-slate-200'
  };
  return <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wide ring-1 ${tones[value] || tones.new} ${className}`}>{value}</span>;
}

function DangerButton({ label }) {
  return <button className="inline-flex h-9 items-center rounded-md border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-700 hover:bg-red-100"><Trash2 className="mr-1.5 h-3.5 w-3.5" /> {label}</button>;
}

function Notice({ text }) {
  return <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800 shadow-sm">{text}</div>;
}

function EmptyState({ title, text }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
      <div className="font-black text-slate-950">{title}</div>
      <p className="mt-1 text-sm font-medium text-slate-600">{text}</p>
    </div>
  );
}

function money(value) {
  return `Rs ${Number(value || 0).toLocaleString('en-IN')}`;
}

function formatKm(value) {
  return `${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 1 })} km`;
}

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

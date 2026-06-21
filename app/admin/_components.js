import Link from 'next/link';
import { CalendarClock, Car, CheckCircle2, IndianRupee, LayoutDashboard, LogOut, Plus, Settings, Trash2, Upload, Users } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';
import { deleteBookingAction, deleteCabAction, deleteUserAction, saveCabAction, updateBookingAction, updatePricingSettingsAction, updateUserAction } from '@/app/actions/crm';
import ToastSubmitButton from '@/components/ui/toast-submit-button';

export const STATUSES = ['new', 'assigned', 'confirmed', 'completed', 'cancelled'];

export const ADMIN_NAV = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'New Bookings', href: '/admin/bookings/new', icon: CalendarClock },
  { label: 'Old Bookings', href: '/admin/bookings/old', icon: CheckCircle2 },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Cars', href: '/admin/cars', icon: Car },
  { label: 'Fare Settings', href: '/admin/pricing', icon: Settings },
];

export function AdminShell({ user, children }) {
  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950 lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-3 py-3 sm:px-4 lg:block lg:p-5">
          <div className="min-w-0">
            <div className="text-xs font-black uppercase tracking-wider text-teal-700">ToursTaxi</div>
            <div className="mt-0.5 truncate text-xl font-black lg:text-2xl">Admin Panel</div>
          </div>
          <form action={logoutAction} className="lg:mt-6">
            <button className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 hover:bg-slate-100">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </button>
          </form>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-3 py-3 [scrollbar-width:none] sm:px-4 lg:grid lg:gap-1 lg:overflow-visible lg:p-3">
          {ADMIN_NAV.map(({ label, href, icon: Icon }) => (
            <Link key={href} href={href} className="inline-flex h-11 shrink-0 items-center rounded-md px-3 text-sm font-bold text-slate-700 hover:bg-teal-50 hover:text-teal-800">
              <Icon className="mr-2 h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="min-w-0 overflow-hidden">
        <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-sm font-bold text-slate-500">Welcome, {user.name}</div>
            <h1 className="mt-1 text-2xl font-black leading-tight sm:text-3xl">Operations Dashboard</h1>
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-3 py-4 sm:px-5 lg:px-6">{children}</div>
      </section>
    </main>
  );
}

export function Notice({ text }) {
  return <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">{text}</div>;
}

export function Stat({ icon: Icon, label, value, hint, href }) {
  return (
    <Link href={href || '#'} className="block min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-200 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-slate-600">{label}</div>
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-50 text-teal-700"><Icon className="h-5 w-5" /></span>
      </div>
      <div className="mt-3 truncate text-3xl font-black">{value}</div>
      {hint && <div className="mt-1 text-xs font-semibold text-slate-500">{hint}</div>}
    </Link>
  );
}

export function Panel({ title, subtitle, icon: Icon, children, className = '' }) {
  return (
    <section className={`min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>
      <div className="flex items-start gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
        {Icon && <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-teal-700 text-white"><Icon className="h-4 w-4" /></span>}
        <div className="min-w-0">
          <h2 className="font-black">{title}</h2>
          {subtitle && <p className="text-sm font-medium text-slate-600">{subtitle}</p>}
        </div>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function BookingTable({ bookings, title = 'Bookings' }) {
  return (
    <Panel title={title} subtitle="Update fare, status, notes, and remove test enquiries." icon={CalendarClock}>
      <div className="grid gap-3 xl:hidden">
        {bookings.map((booking) => (
          <article key={booking.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-mono text-sm font-black">{booking.bookingId}</div>
                <div className="mt-1 text-xs font-medium text-slate-600">{formatDate(booking.createdAt)}</div>
              </div>
              <StatusBadge status={booking.status} />
            </div>
            <div className="mt-4 grid gap-3 text-sm">
              <div>
                <div className="font-black">{booking.customer?.name || 'Guest'}</div>
                <div className="break-words text-xs font-medium text-slate-700">{booking.customer?.phone || 'No phone'}</div>
                <div className="break-words text-xs font-medium text-slate-700">{booking.customer?.email || 'No email'}</div>
              </div>
              <div>
                <div className="font-black capitalize">{booking.tripType?.replace('-', ' ') || 'Trip'}</div>
                <div className="mt-1 break-words text-xs font-medium text-slate-700">{booking.pickup} to {booking.tripType === 'local' ? booking.rental : booking.drop}</div>
                <div className="mt-1 text-xs font-semibold">{booking.vehicleName || booking.vehicleSlug || 'Vehicle pending'}</div>
                <div className="text-xs font-medium text-slate-600">{booking.pickupDate || '-'} at {booking.pickupTime || '-'}</div>
              </div>
              <div>
                <div className="text-xl font-black text-teal-700">{booking.fare?.total ? money(booking.fare.total) : 'Pending'}</div>
                <FareBreakdown fare={booking.fare} />
              </div>
            </div>
            <form action={updateBookingAction} className="mt-4 grid gap-2 sm:grid-cols-2">
              <input type="hidden" name="id" value={booking.id} />
              <Input name="totalFare" type="number" min="0" defaultValue={booking.fare?.total || ''} placeholder="Total fare" />
              <select name="status" defaultValue={booking.status} className="h-10 rounded-md border border-slate-300 bg-white px-2 font-semibold capitalize">{STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select>
              <Input name="notes" defaultValue={booking.notes || ''} placeholder="Admin notes" />
              <div className="flex gap-2">
                <ToastSubmitButton message="Updating booking" description="Booking changes are being saved." className="h-10 flex-1 rounded-md bg-teal-700 px-3 text-xs font-black text-white hover:bg-teal-800">Update</ToastSubmitButton>
                <button formAction={deleteBookingAction} className="inline-flex h-10 items-center rounded-md border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-700 hover:bg-red-100"><Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete</button>
              </div>
            </form>
          </article>
        ))}
        {!bookings.length && <EmptyState title="No bookings found" text="Bookings will appear here as customers submit enquiries." />}
      </div>
      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full min-w-[920px] table-fixed text-left text-sm">
          <thead className="bg-slate-100 text-[11px] uppercase tracking-wider text-slate-700">
            <tr><th className="w-[17%] px-4 py-3">Booking</th><th className="w-[21%] px-4 py-3">Customer</th><th className="w-[28%] px-4 py-3">Trip</th><th className="w-[16%] px-4 py-3">Fare</th><th className="w-[14%] px-4 py-3">Manage</th><th className="w-[4%] px-4 py-3">Delete</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.map((booking) => (
              <tr key={booking.id} className="align-top hover:bg-slate-50">
                <td className="px-4 py-4"><div className="font-mono font-black">{booking.bookingId}</div><div className="mt-1 text-xs font-medium text-slate-600">{formatDate(booking.createdAt)}</div><StatusBadge status={booking.status} className="mt-2" /></td>
                <td className="break-words px-4 py-4"><b>{booking.customer?.name || 'Guest'}</b><div className="text-xs font-medium text-slate-700">{booking.customer?.phone || 'No phone'}</div><div className="text-xs font-medium text-slate-700">{booking.customer?.email || 'No email'}</div></td>
                <td className="break-words px-4 py-4"><b className="capitalize">{booking.tripType?.replace('-', ' ') || 'Trip'}</b><div className="mt-1 text-xs font-medium text-slate-700">{booking.pickup} to {booking.tripType === 'local' ? booking.rental : booking.drop}</div><div className="mt-1 text-xs font-semibold">{booking.vehicleName || booking.vehicleSlug || 'Vehicle pending'}</div><div className="text-xs font-medium text-slate-600">{booking.pickupDate || '-'} at {booking.pickupTime || '-'}</div></td>
                <td className="px-4 py-4"><div className="text-lg font-black text-teal-700">{booking.fare?.total ? money(booking.fare.total) : 'Pending'}</div><FareBreakdown fare={booking.fare} /></td>
                <td className="px-4 py-4">
                  <form action={updateBookingAction} className="grid min-w-48 gap-2">
                    <input type="hidden" name="id" value={booking.id} />
                    <Input name="totalFare" type="number" min="0" defaultValue={booking.fare?.total || ''} placeholder="Total fare" />
                    <select name="status" defaultValue={booking.status} className="h-9 rounded-md border border-slate-300 bg-white px-2 font-semibold capitalize">{STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select>
                    <Input name="notes" defaultValue={booking.notes || ''} placeholder="Admin notes" />
                    <ToastSubmitButton message="Updating booking" description="Booking changes are being saved." className="h-9 rounded-md bg-teal-700 px-3 text-xs font-black text-white hover:bg-teal-800">Update</ToastSubmitButton>
                  </form>
                </td>
                <td className="px-4 py-4"><DeleteForm id={booking.id} action={deleteBookingAction} label="Delete" /></td>
              </tr>
            ))}
            {!bookings.length && <tr><td colSpan="6" className="px-5 py-10"><EmptyState title="No bookings found" text="Bookings will appear here as customers submit enquiries." /></td></tr>}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function CabManager({ cabs }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
      <Panel title="Add Cab" subtitle="Create a website-ready cab with price, image, and package details." icon={Plus}><CabForm /></Panel>
      <Panel title="Fleet CRM" subtitle="Edit pricing, pause vehicles, and keep cab details consistent across the site." icon={Car}>
        <div className="grid gap-3">
          {cabs.map((cab) => (
            <details key={cab.id} className="rounded-lg border border-slate-200 bg-white">
              <summary className="cursor-pointer list-none p-4 hover:bg-slate-50">
                <div className="grid gap-3 sm:grid-cols-[92px_1fr_auto] sm:items-center">
                  <div className="flex h-20 items-center justify-center rounded-md bg-slate-100 p-2">{cab.image ? <img src={cab.image} alt={cab.name} className="max-h-full max-w-full object-contain" /> : <Car className="h-8 w-8 text-slate-400" />}</div>
                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{cab.name || 'Unnamed cab'}</h3><StatusBadge status={cab.status || 'active'} /></div><div className="mt-1 break-words text-sm font-semibold text-slate-700">{cab.category || 'Category not set'} | {cab.seats || 4} seats | Rs {cab.pricePerKm || 0}/km | Local Rs {cab.localPricePerKm || cab.pricePerKm || 0}/km</div><div className="mt-1 break-words text-xs font-medium text-slate-500">{cab.features?.join?.(', ') || 'No features added yet'}</div></div>
                  <div className="text-xs font-bold uppercase tracking-wide text-teal-700">Open editor</div>
                </div>
              </summary>
              <div className="border-t border-slate-200 bg-slate-50 p-4"><CabForm cab={cab} /><DeleteForm id={cab.id} action={deleteCabAction} label="Delete cab" className="mt-3" /></div>
            </details>
          ))}
          {!cabs.length && <EmptyState title="No cabs yet" text="Add your first cab to start showing fleet options." />}
        </div>
      </Panel>
    </div>
  );
}

function CabForm({ cab = {} }) {
  return (
    <form action={saveCabAction} className="grid gap-3">
      <input type="hidden" name="id" defaultValue={cab.id || ''} />
      <Field name="name" label="Cab Name" defaultValue={cab.name} placeholder="Swift Dzire" required />
      <Field name="slug" label="Slug" defaultValue={cab.slug} placeholder="swift-dzire" />
      <div className="grid gap-3 sm:grid-cols-2"><Field name="category" label="Category" defaultValue={cab.category} /><Field name="badge" label="Badge" defaultValue={cab.badge} /><Field name="seats" label="Seats" type="number" min="1" defaultValue={cab.seats || 4} /><Field name="luggage" label="Luggage" defaultValue={cab.luggage} /><Field name="pricePerKm" label="Price Per Km" type="number" min="0" step="0.1" defaultValue={cab.pricePerKm || 0} /><Field name="localPricePerKm" label="Local Price Per Km" type="number" min="0" step="0.1" defaultValue={cab.localPricePerKm || cab.pricePerKm || 0} /><Field name="startPrice" label="Start Price" type="number" min="0" defaultValue={cab.startPrice || 0} /></div>
      <div className="grid gap-3 sm:grid-cols-3"><Field name="local4hrPrice" label="4hrs | 40km Price" type="number" min="0" defaultValue={cab.local4hrPrice || ''} /><Field name="local8hrPrice" label="8hrs | 80km Price" type="number" min="0" defaultValue={cab.local8hrPrice || ''} /><Field name="local12hrPrice" label="12hrs | 120km Price" type="number" min="0" defaultValue={cab.local12hrPrice || ''} /></div>
      <Field name="image" label="Image URL" defaultValue={cab.image} />
      <label className="text-xs font-bold uppercase tracking-wider text-slate-700"><span className="mb-1 flex items-center gap-1.5"><Upload className="h-3.5 w-3.5 text-teal-600" /> Upload Cab Image</span><input name="imageFile" type="file" accept="image/*" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-950 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white" /></label>
      <Field name="features" label="Features" defaultValue={cab.features?.join?.(', ') || ''} />
      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Description<textarea name="description" defaultValue={cab.description || ''} className="mt-1 min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium normal-case tracking-normal" /></label>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_2fr]"><label className="flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold"><input type="checkbox" name="ac" defaultChecked={cab.ac !== false} className="accent-teal-600" /> AC cab</label><div className="flex h-10 items-center gap-3 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold"><label><input type="checkbox" name="fuelOptions" value="cng" defaultChecked={!cab.fuelOptions?.length || cab.fuelOptions?.includes('cng')} className="accent-teal-600" /> CNG</label><label><input type="checkbox" name="fuelOptions" value="diesel" defaultChecked={!cab.fuelOptions?.length || cab.fuelOptions?.includes('diesel')} className="accent-teal-600" /> Diesel</label></div><label className="text-xs font-bold uppercase tracking-wider text-slate-700">Status<select name="status" defaultValue={cab.status || 'active'} className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold normal-case"><option value="active">Active</option><option value="inactive">Inactive</option></select></label></div>
      <ToastSubmitButton message="Saving cab details" description="Fleet details are being updated." className="inline-flex h-11 items-center justify-center rounded-md bg-[#12233f] px-4 text-sm font-black text-white hover:bg-[#0f1c33]"><CheckCircle2 className="mr-2 h-4 w-4" /> Save Cab</ToastSubmitButton>
    </form>
  );
}

export function Customers({ users }) {
  return (
    <Panel title="Customers & Admins" subtitle="Edit customer records, booking totals, and trusted admin access." icon={Users}>
      <div className="grid gap-3 lg:grid-cols-2">
        {users.map((item) => (
          <form key={item.id} action={updateUserAction} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <input type="hidden" name="id" value={item.id} />
            <div className="mb-3 flex items-start justify-between gap-3"><div className="min-w-0"><div className="font-black">{item.name || 'Unnamed user'}</div><div className="break-words text-xs font-semibold text-slate-500">{item.email || 'No email'}</div></div><div className="flex shrink-0 flex-col items-end gap-2"><StatusBadge status={item.role || 'customer'} /><span className="inline-flex rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-teal-700 ring-1 ring-teal-200">{item.bookingCount || 0} bookings</span></div></div>
            <div className="mb-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2"><div className="text-[11px] font-black uppercase tracking-wider text-slate-500">Total Bookings</div><div className="mt-1 text-2xl font-black text-slate-950">{Number(item.bookingCount || 0).toLocaleString('en-IN')}</div></div>
            <div className="grid gap-3 sm:grid-cols-2"><Field name="name" label="Name" defaultValue={item.name} /><Field name="phone" label="Phone" defaultValue={item.phone} /><Field name="email" label="Email" type="email" defaultValue={item.email} /><label className="text-xs font-bold uppercase tracking-wider text-slate-700">Role<select name="role" defaultValue={item.role} className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold normal-case"><option value="customer">Customer</option><option value="admin">Admin</option></select></label></div>
            <div className="mt-3 flex flex-wrap gap-2"><ToastSubmitButton message="Saving user" description="Customer details are being updated." className="h-9 rounded-md bg-[#12233f] px-3 text-xs font-black text-white hover:bg-[#0f1c33]">Save User</ToastSubmitButton><button formAction={deleteUserAction} className="inline-flex h-9 items-center rounded-md border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-700 hover:bg-red-100"><Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete</button></div>
          </form>
        ))}
        {!users.length && <EmptyState title="No users found" text="Registered customers and admins will appear here." />}
      </div>
    </Panel>
  );
}

export function PricingSettingsForm({ settings }) {
  return (
    <Panel title="Fare Calculation Settings" subtitle="Control minimum kilometer rules and advance payment from the admin panel." icon={IndianRupee}>
      <form action={updatePricingSettingsAction} className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Field name="minimumBillingKmPerDay" label="Default Minimum KM" type="number" min="0" defaultValue={settings.minimumBillingKmPerDay} />
          <Field name="oneWayMinimumKm" label="One Way Minimum KM" type="number" min="0" defaultValue={settings.oneWayMinimumKm} />
          <Field name="airportMinimumKm" label="Airport Minimum KM" type="number" min="0" defaultValue={settings.airportMinimumKm} />
          <Field name="roundTripMinimumKmPerDay" label="Round Trip KM Per Day" type="number" min="0" defaultValue={settings.roundTripMinimumKmPerDay} />
          <Field name="localMinimumKm" label="Local Minimum KM" type="number" min="0" defaultValue={settings.localMinimumKm} />
          <Field name="advancePercent" label="Advance Payment %" type="number" min="0" max="100" step="1" defaultValue={settings.advancePercent} />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Field name="oneWayBaseFare" label="One Way Base Fare" type="number" min="0" defaultValue={settings.oneWayBaseFare} />
          <Field name="roundTripBaseFare" label="Round Trip Base Fare" type="number" min="0" defaultValue={settings.roundTripBaseFare} />
          <Field name="airportBaseFare" label="Airport Base Fare" type="number" min="0" defaultValue={settings.airportBaseFare} />
          <Field name="localBaseFare" label="Local Base Fare" type="number" min="0" defaultValue={settings.localBaseFare} />
          <Field name="driverAllowancePerDay" label="Driver Allowance Per Day" type="number" min="0" defaultValue={settings.driverAllowancePerDay} />
          <Field name="gstPercent" label="GST %" type="number" min="0" max="100" step="0.1" defaultValue={settings.gstPercent} />
          <Field name="dieselSurchargePerKm" label="Diesel Surcharge Per KM" type="number" min="0" step="0.1" defaultValue={settings.dieselSurchargePerKm} />
        </div>
        <div className="break-words rounded-lg border border-teal-100 bg-teal-50 p-4 text-sm font-semibold text-teal-950">Car rates come from Add Cab. These rules add minimum KM, base fare, driver allowance, GST, diesel surcharge, and advance payment across one way, round trip, local, and airport bookings.</div>
        <ToastSubmitButton message="Saving fare settings" description="Fare calculation policy is being updated." className="h-11 w-full rounded-md bg-teal-700 px-4 text-sm font-black text-white hover:bg-teal-800 sm:w-fit">Save Fare Settings</ToastSubmitButton>
      </form>
    </Panel>
  );
}

function FareBreakdown({ fare }) {
  if (!fare) return <div className="mt-2 text-xs font-medium text-slate-500">Fare breakdown pending</div>;
  return <div className="mt-2 grid gap-1 rounded-md bg-slate-50 p-2 text-[11px] font-semibold text-slate-700"><Row label="Actual" value={formatKm(fare.actualDistance)} /><Row label="Minimum" value={formatKm(fare.minimumDistance)} /><Row label="Chargeable" value={formatKm(fare.chargeableDistance)} /><Row label="Rate" value={`Rs ${fare.vehicleRate || 0}/KM`} />{!!fare.base && <Row label="Base" value={money(fare.base)} />}{!!fare.driver && <Row label="Driver" value={money(fare.driver)} />}{!!fare.fuelSurcharge && <Row label="Fuel" value={money(fare.fuelSurcharge)} />}{!!fare.gst && <Row label="GST" value={money(fare.gst)} />}{fare.minimumApplied && <div className="mt-1 rounded bg-amber-50 px-2 py-1 text-amber-700">Minimum billing rule applied.</div>}</div>;
}

function Row({ label, value }) {
  return <div className="flex justify-between gap-2"><span>{label}</span><b>{value}</b></div>;
}

function Field({ label, ...props }) {
  return <label className="min-w-0 text-xs font-bold uppercase tracking-wider text-slate-700">{label}<input {...props} className="mt-1 h-10 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium normal-case tracking-normal outline-none placeholder:text-slate-500 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15" /></label>;
}

function Input(props) {
  return <input {...props} className="h-10 min-w-0 rounded-md border border-slate-300 bg-white px-2 font-medium outline-none placeholder:text-slate-500" />;
}

function StatusBadge({ status, className = '' }) {
  const value = String(status || 'new');
  const tones = { active: 'bg-emerald-50 text-emerald-700 ring-emerald-200', inactive: 'bg-slate-100 text-slate-600 ring-slate-200', new: 'bg-amber-50 text-amber-700 ring-amber-200', assigned: 'bg-teal-50 text-teal-700 ring-teal-200', confirmed: 'bg-emerald-50 text-emerald-700 ring-emerald-200', completed: 'bg-slate-950 text-white ring-slate-950', cancelled: 'bg-red-50 text-red-700 ring-red-200', admin: 'bg-teal-50 text-teal-700 ring-teal-200', customer: 'bg-slate-100 text-slate-700 ring-slate-200' };
  return <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wide ring-1 ${tones[value] || tones.new} ${className}`}>{value}</span>;
}

function DeleteForm({ id, action, label, className = '' }) {
  return <form action={action} className={className}><input type="hidden" name="id" value={id} /><button className="inline-flex h-9 items-center rounded-md border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-700 hover:bg-red-100"><Trash2 className="mr-1.5 h-3.5 w-3.5" /> {label}</button></form>;
}

function EmptyState({ title, text }) {
  return <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center"><div className="font-black">{title}</div><p className="mt-1 text-sm font-medium text-slate-600">{text}</p></div>;
}

export function money(value) {
  return `Rs ${Number(value || 0).toLocaleString('en-IN')}`;
}

export function formatKm(value) {
  return `${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 1 })} km`;
}

export function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

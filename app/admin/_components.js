import Link from 'next/link';
import { BookOpen, CalendarClock, Car, CheckCircle2, IndianRupee, LayoutDashboard, LogOut, Map, Plus, Settings, Trash2, Upload, Users } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';
import { deleteBlogPostAction, deleteBookingAction, deleteCabAction, deletePopularRouteAction, deleteTourPackageAction, deleteUserAction, saveBlogPostAction, saveCabAction, savePopularRouteAction, saveTourPackageAction, updateBookingAction, updatePricingSettingsAction, updateUserAction, verifyUpiPaymentAction } from '@/app/actions/crm';
import ToastSubmitButton from '@/components/ui/toast-submit-button';

export const STATUSES = ['pending_payment', 'pending_verification', 'payment_rejected', 'new', 'assigned', 'confirmed', 'completed', 'cancelled'];

export const ADMIN_NAV = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'New Bookings', href: '/admin/bookings/new', icon: CalendarClock },
  { label: 'Old Bookings', href: '/admin/bookings/old', icon: CheckCircle2 },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Cars', href: '/admin/cars', icon: Car },
  { label: 'Routes', href: '/admin/routes', icon: Map },
  { label: 'Tour Packages', href: '/admin/tour-packages', icon: Map },
  { label: 'Blog', href: '/admin/blog', icon: BookOpen },
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
  const pendingPayments = bookings.filter((booking) => ['pending_payment', 'pending_verification', 'rejected'].includes(booking.paymentStatus) || ['pending_payment', 'pending_verification', 'payment_rejected'].includes(booking.status));
  return (
    <Panel title={title} subtitle="Update fare, status, notes, and remove test enquiries." icon={CalendarClock}>
      {!!pendingPayments.length && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <div className="font-black text-amber-950">Pending Payments</div>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {pendingPayments.map((booking) => (
              <article key={`payment-${booking.id}`} className="rounded-md border border-amber-200 bg-white p-3 text-sm shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-mono font-black">{booking.bookingId}</div>
                    <div className="font-bold">{booking.customer?.name || 'Guest'} | {booking.customer?.phone || 'No phone'}</div>
                    <div className="text-xs font-semibold text-slate-600">{booking.pickupDate || '-'} at {formatClock(booking.pickupTime)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-teal-700">{money(booking.paymentAmount || booking.fare?.total)}</div>
                    <StatusBadge status={booking.paymentStatus || 'pending'} />
                  </div>
                </div>
                {booking.paymentScreenshot ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a href={booking.paymentScreenshot} target="_blank" rel="noopener noreferrer" className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-700">View Screenshot</a>
                    <a href={booking.paymentScreenshot} download className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-700">Download</a>
                  </div>
                ) : <div className="mt-3 rounded bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500">No screenshot uploaded yet.</div>}
                <form action={verifyUpiPaymentAction} className="mt-3 grid gap-2">
                  <input type="hidden" name="id" value={booking.id} />
                  <Input name="notes" defaultValue={booking.notes || ''} placeholder="Admin payment notes" />
                  <div className="flex gap-2">
                    <button name="decision" value="approve" className="h-9 flex-1 rounded-md bg-emerald-600 px-3 text-xs font-black text-white hover:bg-emerald-700">Approve Payment</button>
                    <button name="decision" value="reject" className="h-9 flex-1 rounded-md bg-red-600 px-3 text-xs font-black text-white hover:bg-red-700">Reject Payment</button>
                  </div>
                </form>
              </article>
            ))}
          </div>
        </div>
      )}
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
                <div className="text-xs font-medium text-slate-600">{booking.pickupDate || '-'} at {formatClock(booking.pickupTime)}</div>
                <div className="text-xs font-medium text-slate-600">{booking.passengers || 'Passengers not set'}</div>
                <BookingExtras booking={booking} />
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
                <td className="break-words px-4 py-4"><b className="capitalize">{booking.tripType?.replace('-', ' ') || 'Trip'}</b><div className="mt-1 text-xs font-medium text-slate-700">{booking.pickup} to {booking.tripType === 'local' ? booking.rental : booking.drop}</div><div className="mt-1 text-xs font-semibold">{booking.vehicleName || booking.vehicleSlug || 'Vehicle pending'}</div><div className="text-xs font-medium text-slate-600">{booking.pickupDate || '-'} at {formatClock(booking.pickupTime)}</div><div className="text-xs font-medium text-slate-600">{booking.passengers || 'Passengers not set'}</div><BookingExtras booking={booking} /></td>
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

export function TourPackageManager({ packages }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
      <Panel title="Add Tour Package" subtitle="Create cards for the tour packages page." icon={Plus}><TourPackageForm /></Panel>
      <Panel title="Tour Packages" subtitle="Edit images, pricing, inclusions, and publish status." icon={Map}>
        <div className="grid gap-3">
          {packages.map((item) => (
            <details key={item.id} className="rounded-lg border border-slate-200 bg-white">
              <summary className="cursor-pointer list-none p-4 hover:bg-slate-50">
                <div className="grid gap-3 sm:grid-cols-[112px_1fr_auto] sm:items-center">
                  <div className="h-20 overflow-hidden rounded-md bg-slate-100">{item.image ? <img src={item.image} alt={item.title} className="h-full w-full object-cover" /> : <Map className="m-auto mt-6 h-8 w-8 text-slate-400" />}</div>
                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{item.title || 'Untitled package'}</h3><StatusBadge status={item.status || 'active'} /></div><div className="mt-1 text-sm font-semibold text-slate-700">{item.duration || '-'} | Rs {Number(item.price || 0).toLocaleString('en-IN')} | {item.tag || 'No tag'}</div><div className="mt-1 line-clamp-2 text-xs font-medium text-slate-500">{item.description || 'No description added yet'}</div></div>
                  <div className="text-xs font-bold uppercase tracking-wide text-teal-700">Open editor</div>
                </div>
              </summary>
              <div className="border-t border-slate-200 bg-slate-50 p-4"><TourPackageForm item={item} /><DeleteForm id={item.id} action={deleteTourPackageAction} label="Delete package" className="mt-3" /></div>
            </details>
          ))}
          {!packages.length && <EmptyState title="No packages yet" text="Add your first tour package to show it on the website." />}
        </div>
      </Panel>
    </div>
  );
}

function TourPackageForm({ item = {} }) {
  return (
    <form action={saveTourPackageAction} className="grid gap-3">
      <input type="hidden" name="id" defaultValue={item.id || ''} />
      <Field name="title" label="Package Title" defaultValue={item.title} placeholder="Ranthambore Tiger Safari" required />
      <Field name="slug" label="Slug" defaultValue={item.slug} placeholder="ranthambore-safari" />
      <div className="grid gap-3 sm:grid-cols-2"><Field name="duration" label="Duration" defaultValue={item.duration} placeholder="2 Days / 1 Night" /><Field name="price" label="Starts At Price" type="number" min="0" defaultValue={item.price || 0} /><Field name="tag" label="Tag" defaultValue={item.tag} placeholder="Wildlife" /><label className="text-xs font-bold uppercase tracking-wider text-slate-700">Status<select name="status" defaultValue={item.status || 'active'} className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold normal-case"><option value="active">Active</option><option value="inactive">Inactive</option></select></label></div>
      <Field name="image" label="Image URL" defaultValue={item.image} />
      <label className="text-xs font-bold uppercase tracking-wider text-slate-700"><span className="mb-1 flex items-center gap-1.5"><Upload className="h-3.5 w-3.5 text-teal-600" /> Upload Package Image</span><input name="imageFile" type="file" accept="image/*" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-950 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white" /></label>
      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Description<textarea name="description" defaultValue={item.description || ''} className="mt-1 min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium normal-case tracking-normal" /></label>
      <Field name="inclusions" label="Inclusions" defaultValue={item.inclusions?.join?.(', ') || ''} placeholder="2 Jungle Safaris, AC Resort Stay, Breakfast" />
      <ToastSubmitButton message="Saving tour package" description="Package details are being updated." className="inline-flex h-11 items-center justify-center rounded-md bg-[#12233f] px-4 text-sm font-black text-white hover:bg-[#0f1c33]"><CheckCircle2 className="mr-2 h-4 w-4" /> Save Package</ToastSubmitButton>
    </form>
  );
}

export function BlogManager({ posts }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
      <Panel title="Add Blog Post" subtitle="Create cards and articles for the blog page." icon={Plus}><BlogPostForm /></Panel>
      <Panel title="Blog Posts" subtitle="Edit article cards, hero images, categories, and content." icon={BookOpen}>
        <div className="grid gap-3">
          {posts.map((post) => (
            <details key={post.id} className="rounded-lg border border-slate-200 bg-white">
              <summary className="cursor-pointer list-none p-4 hover:bg-slate-50">
                <div className="grid gap-3 sm:grid-cols-[112px_1fr_auto] sm:items-center">
                  <div className="h-20 overflow-hidden rounded-md bg-slate-100">{post.image ? <img src={post.image} alt={post.title} className="h-full w-full object-cover" /> : <BookOpen className="m-auto mt-6 h-8 w-8 text-slate-400" />}</div>
                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{post.title || 'Untitled post'}</h3><StatusBadge status={post.status || 'active'} /></div><div className="mt-1 text-sm font-semibold text-slate-700">{post.category || 'No category'} | {post.date || '-'} | {post.readMin || 0} min</div><div className="mt-1 line-clamp-2 text-xs font-medium text-slate-500">{post.excerpt || 'No excerpt added yet'}</div></div>
                  <div className="text-xs font-bold uppercase tracking-wide text-teal-700">Open editor</div>
                </div>
              </summary>
              <div className="border-t border-slate-200 bg-slate-50 p-4"><BlogPostForm post={post} /><DeleteForm id={post.id} action={deleteBlogPostAction} label="Delete post" className="mt-3" /></div>
            </details>
          ))}
          {!posts.length && <EmptyState title="No blog posts yet" text="Add your first article to show it on the blog." />}
        </div>
      </Panel>
    </div>
  );
}

export function RouteManager({ routes }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
      <Panel title="Add Popular Route" subtitle="Create route cards for the popular routes page." icon={Plus}><RouteForm /></Panel>
      <Panel title="Popular Routes" subtitle="Edit route images, distance, duration, fares, and publish status." icon={Map}>
        <div className="grid gap-3">
          {routes.map((route) => (
            <details key={route.id} className="rounded-lg border border-slate-200 bg-white">
              <summary className="cursor-pointer list-none p-4 hover:bg-slate-50">
                <div className="grid gap-3 sm:grid-cols-[112px_1fr_auto] sm:items-center">
                  <div className="h-20 overflow-hidden rounded-md bg-slate-100">{route.image ? <img src={route.image} alt={`${route.from} to ${route.to}`} className="h-full w-full object-cover" /> : <Map className="m-auto mt-6 h-8 w-8 text-slate-400" />}</div>
                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{route.from || 'From'} to {route.to || 'To'}</h3><StatusBadge status={route.status || 'active'} /></div><div className="mt-1 text-sm font-semibold text-slate-700">{route.distance || '-'} | {route.duration || '-'} | Rs {Number(route.price || 0).toLocaleString('en-IN')}</div><div className="mt-1 text-xs font-medium text-slate-500">{route.slug || 'No slug'}</div></div>
                  <div className="text-xs font-bold uppercase tracking-wide text-teal-700">Open editor</div>
                </div>
              </summary>
              <div className="border-t border-slate-200 bg-slate-50 p-4"><RouteForm route={route} /><DeleteForm id={route.id} action={deletePopularRouteAction} label="Delete route" className="mt-3" /></div>
            </details>
          ))}
          {!routes.length && <EmptyState title="No routes yet" text="Add your first route to show it on the popular routes page." />}
        </div>
      </Panel>
    </div>
  );
}

function RouteForm({ route = {} }) {
  return (
    <form action={savePopularRouteAction} className="grid gap-3">
      <input type="hidden" name="id" defaultValue={route.id || ''} />
      <div className="grid gap-3 sm:grid-cols-2"><Field name="from" label="From City" defaultValue={route.from} placeholder="Jaipur" required /><Field name="to" label="To City" defaultValue={route.to} placeholder="Ranthambore" required /></div>
      <Field name="slug" label="Slug" defaultValue={route.slug} placeholder="jaipur-ranthambore" />
      <div className="grid gap-3 sm:grid-cols-2"><Field name="distance" label="Distance" defaultValue={route.distance} placeholder="180 km" /><Field name="duration" label="Duration" defaultValue={route.duration} placeholder="4h" /><Field name="price" label="Cab From Price" type="number" min="0" defaultValue={route.price || 0} /><label className="text-xs font-bold uppercase tracking-wider text-slate-700">Status<select name="status" defaultValue={route.status || 'active'} className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold normal-case"><option value="active">Active</option><option value="inactive">Inactive</option></select></label></div>
      <Field name="image" label="Image URL" defaultValue={route.image} />
      <label className="text-xs font-bold uppercase tracking-wider text-slate-700"><span className="mb-1 flex items-center gap-1.5"><Upload className="h-3.5 w-3.5 text-teal-600" /> Upload Route Image</span><input name="imageFile" type="file" accept="image/*" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-950 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white" /></label>
      <ToastSubmitButton message="Saving popular route" description="Route details are being updated." className="inline-flex h-11 items-center justify-center rounded-md bg-[#12233f] px-4 text-sm font-black text-white hover:bg-[#0f1c33]"><CheckCircle2 className="mr-2 h-4 w-4" /> Save Route</ToastSubmitButton>
    </form>
  );
}

function BlogPostForm({ post = {} }) {
  return (
    <form action={saveBlogPostAction} className="grid gap-3">
      <input type="hidden" name="id" defaultValue={post.id || ''} />
      <Field name="title" label="Post Title" defaultValue={post.title} placeholder="Best Time to Visit Ranthambore" required />
      <Field name="slug" label="Slug" defaultValue={post.slug} placeholder="best-time-to-visit-ranthambore" />
      <div className="grid gap-3 sm:grid-cols-2"><Field name="category" label="Category" defaultValue={post.category} placeholder="Wildlife" /><Field name="author" label="Author" defaultValue={post.author} placeholder="ToursTaxi Team" /><Field name="date" label="Display Date" defaultValue={post.date} placeholder="12 May 2025" /><Field name="readMin" label="Read Minutes" type="number" min="1" defaultValue={post.readMin || 5} /></div>
      <Field name="image" label="Image URL" defaultValue={post.image} />
      <label className="text-xs font-bold uppercase tracking-wider text-slate-700"><span className="mb-1 flex items-center gap-1.5"><Upload className="h-3.5 w-3.5 text-teal-600" /> Upload Blog Image</span><input name="imageFile" type="file" accept="image/*" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-950 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white" /></label>
      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Excerpt<textarea name="excerpt" defaultValue={post.excerpt || ''} className="mt-1 min-h-20 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium normal-case tracking-normal" /></label>
      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Article Content<textarea name="content" defaultValue={post.content || ''} className="mt-1 min-h-40 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium normal-case tracking-normal" placeholder="Write article paragraphs. Use blank lines between paragraphs." /></label>
      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Status<select name="status" defaultValue={post.status || 'active'} className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold normal-case"><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
      <ToastSubmitButton message="Saving blog post" description="Blog content is being updated." className="inline-flex h-11 items-center justify-center rounded-md bg-[#12233f] px-4 text-sm font-black text-white hover:bg-[#0f1c33]"><CheckCircle2 className="mr-2 h-4 w-4" /> Save Post</ToastSubmitButton>
    </form>
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
            <div className="mb-3 flex items-start justify-between gap-3"><div className="min-w-0"><div className="font-black">{item.name || 'Unnamed user'}</div><div className="break-words text-xs font-semibold text-slate-500">{item.email || 'No email'}</div></div><div className="flex shrink-0 flex-col items-end gap-2"><StatusBadge status={item.role || 'customer'} /></div></div>
            <details className="mb-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <summary className="cursor-pointer list-none">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-wider text-slate-500">Total Bookings</div>
                    <div className="mt-1 text-2xl font-black text-slate-950">{Number(item.bookingCount || 0).toLocaleString('en-IN')}</div>
                  </div>
                  <span className="rounded-md border border-teal-200 bg-white px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-teal-700">View</span>
                </div>
              </summary>
              <div className="mt-3 grid gap-2 border-t border-slate-200 pt-3">
                {(item.bookings || []).map((booking) => (
                  <div key={booking.id || booking.bookingId} className="rounded-md border border-slate-200 bg-white p-3 text-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-black text-slate-950">{booking.bookingId || 'Booking'}</div>
                        <div className="mt-1 break-words font-semibold text-slate-700">{booking.pickup || '-'} to {booking.tripType === 'local' ? booking.rental : booking.drop || '-'}</div>
                      </div>
                      <StatusBadge status={booking.status || 'new'} />
                    </div>
                    <div className="mt-2 grid gap-1 text-slate-600 sm:grid-cols-2">
                      <div><b>Trip:</b> {booking.tripType?.replace('-', ' ') || '-'}</div>
                      <div><b>Pickup:</b> {booking.pickupDate || '-'} {formatClock(booking.pickupTime)}</div>
                      {booking.returnDate && <div><b>Return:</b> {booking.returnDate} {formatClock(booking.returnTime)}</div>}
                      <div><b>Cab:</b> {booking.vehicleName || booking.vehicleSlug || '-'}</div>
                      <div><b>Passengers:</b> {booking.passengers || '-'}</div>
                      <div><b>Fare:</b> {booking.fare?.total ? money(booking.fare.total) : 'Pending'}</div>
                    </div>
                  </div>
                ))}
                {!item.bookings?.length && <div className="rounded-md border border-dashed border-slate-300 bg-white px-3 py-4 text-center text-xs font-bold text-slate-500">No bookings found for this customer.</div>}
              </div>
            </details>
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
          <Field name="roundTripDiscountPercent" label="Round Trip Discount %" type="number" min="0" max="100" step="1" defaultValue={settings.roundTripDiscountPercent} />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Field name="oneWayBaseFare" label="One Way Base Fare" type="number" min="0" defaultValue={settings.oneWayBaseFare} />
          <Field name="roundTripBaseFare" label="Round Trip Base Fare" type="number" min="0" defaultValue={settings.roundTripBaseFare} />
          <Field name="airportBaseFare" label="Airport Base Fare" type="number" min="0" defaultValue={settings.airportBaseFare} />
          <Field name="localBaseFare" label="Local Base Fare" type="number" min="0" defaultValue={settings.localBaseFare} />
          <Field name="driverAllowancePerDay" label="Driver Allowance Per Day" type="number" min="0" defaultValue={settings.driverAllowancePerDay} />
          <Field name="gstPercent" label="GST %" type="number" min="0" max="100" step="0.1" defaultValue={settings.gstPercent} />
          <Field name="dieselSurchargePerKm" label="Diesel Car Guarantee Per KM" type="number" min="0" step="0.1" defaultValue={settings.dieselSurchargePerKm} />
          <Field name="carrierAddonPrice" label="Luggage Carrier Add-on" type="number" min="0" defaultValue={settings.carrierAddonPrice} />
          <Field name="newCarAddonPrice" label="New Car Promise Add-on" type="number" min="0" defaultValue={settings.newCarAddonPrice} />
          <Field name="languageAddonPrice" label="Language Chauffeur Add-on" type="number" min="0" defaultValue={settings.languageAddonPrice} />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <TextField name="serviceCities" label="Service Available Cities" defaultValue={settings.serviceCities?.join?.('\n') || ''} placeholder={`Jaipur\nKota\nSawai Madhopur`} />
          <TextField name="holidays" label="Holiday Dates / Notes" defaultValue={settings.holidays?.join?.('\n') || ''} placeholder={`2026-08-15 Independence Day\n2026-10-20 Diwali`} />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Field name="facebookUrl" label="Facebook Page" defaultValue={settings.facebookUrl} placeholder="https://facebook.com/..." />
          <Field name="instagramUrl" label="Instagram" defaultValue={settings.instagramUrl} placeholder="https://instagram.com/..." />
          <Field name="youtubeUrl" label="YouTube" defaultValue={settings.youtubeUrl} placeholder="https://youtube.com/..." />
          <Field name="xUrl" label="X Account" defaultValue={settings.xUrl} placeholder="https://x.com/..." />
          <Field name="googleBusinessUrl" label="Google Business Profile" defaultValue={settings.googleBusinessUrl} placeholder="https://g.page/..." />
          <Field name="whatsappNumber" label="WhatsApp Number" defaultValue={settings.whatsappNumber} placeholder="+918955458128" />
          <Field name="callingNumber" label="Calling Mobile Number" defaultValue={settings.callingNumber} placeholder="+918955458128" />
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

function BookingExtras({ booking }) {
  const options = booking.selectedOptions || {};
  const fare = booking.fare || {};
  const addons = Array.isArray(options.addons) ? options.addons : Array.isArray(fare.selectedAddons) ? fare.selectedAddons : [];
  const addonText = addons.map((addon) => addon.label || addon.id || addon).filter(Boolean).join(', ');
  const fuel = options.fuelType ? (options.fuelType === 'diesel' ? 'Diesel' : 'CNG') : '';
  const rows = [
    fuel && `Fuel: ${fuel}`,
    options.languagePreference && `Language: ${options.languagePreference}`,
    addonText && `Add-ons: ${addonText}`,
    booking.stops?.filter(Boolean).length ? `Stops: ${booking.stops.filter(Boolean).join(' | ')}` : '',
    booking.customer?.dropAddress && `Drop address: ${booking.customer.dropAddress}`,
  ].filter(Boolean);
  if (!rows.length) return null;
  return <div className="mt-2 grid gap-1 rounded-md bg-teal-50 p-2 text-[11px] font-bold text-teal-900">{rows.map((row) => <div key={row}>{row}</div>)}</div>;
}

function Row({ label, value }) {
  return <div className="flex justify-between gap-2"><span>{label}</span><b>{value}</b></div>;
}

function Field({ label, ...props }) {
  return <label className="min-w-0 text-xs font-bold uppercase tracking-wider text-slate-700">{label}<input {...props} className="mt-1 h-10 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium normal-case tracking-normal outline-none placeholder:text-slate-500 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15" /></label>;
}

function TextField({ label, ...props }) {
  return <label className="min-w-0 text-xs font-bold uppercase tracking-wider text-slate-700">{label}<textarea {...props} className="mt-1 min-h-28 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium normal-case tracking-normal outline-none placeholder:text-slate-500 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15" /></label>;
}

function Input(props) {
  return <input {...props} className="h-10 min-w-0 rounded-md border border-slate-300 bg-white px-2 font-medium outline-none placeholder:text-slate-500" />;
}

function StatusBadge({ status, className = '' }) {
  const value = String(status || 'new');
  const tones = { active: 'bg-emerald-50 text-emerald-700 ring-emerald-200', inactive: 'bg-slate-100 text-slate-600 ring-slate-200', pending: 'bg-amber-50 text-amber-700 ring-amber-200', pending_payment: 'bg-amber-50 text-amber-700 ring-amber-200', pending_verification: 'bg-sky-50 text-sky-700 ring-sky-200', payment_rejected: 'bg-red-50 text-red-700 ring-red-200', rejected: 'bg-red-50 text-red-700 ring-red-200', paid: 'bg-emerald-50 text-emerald-700 ring-emerald-200', new: 'bg-amber-50 text-amber-700 ring-amber-200', assigned: 'bg-teal-50 text-teal-700 ring-teal-200', confirmed: 'bg-emerald-50 text-emerald-700 ring-emerald-200', completed: 'bg-slate-950 text-white ring-slate-950', cancelled: 'bg-red-50 text-red-700 ring-red-200', admin: 'bg-teal-50 text-teal-700 ring-teal-200', customer: 'bg-slate-100 text-slate-700 ring-slate-200' };
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

export function formatClock(value) {
  if (!value) return '-';
  const [hours, minutes = '00'] = String(value).split(':');
  const date = new Date();
  date.setHours(Number(hours) || 0, Number(minutes) || 0, 0, 0);
  return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

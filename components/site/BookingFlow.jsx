'use client';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeftRight, Briefcase, Calendar, Check, ChevronDown, Clock, Copy, Headphones, MapPin, Phone, ShieldCheck, Star, User, X } from 'lucide-react';
import { toast } from 'sonner';

const TRIP_LABELS = {
  'one-way': 'One way',
  'round-trip': 'Round trip',
  local: 'Local',
  airport: 'Airport'
};

const ADDONS = [
  { id: 'carrier', label: 'Cab with Luggage Carrier', price: 149, tag: 'Most Popular' },
  { id: 'diesel', label: 'Diesel Car Guarantee', priceText: 'Rs 1.1/km' },
  { id: 'new-car', label: 'New Car Promise - Model that is 2023 or newer', price: 249 },
  { id: 'language', label: 'Chauffeurs who know your language', price: 199 }
];

function todayValue() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

function nextPickupTimeValue() {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 30);
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function money(value) {
  return `Rs ${Number(value || 0).toLocaleString('en-IN')}`;
}

function prettyDate(value) {
  if (!value) return '';
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function tripDistance(tripType) {
  if (tripType === 'local') return 80;
  if (tripType === 'airport') return 35;
  if (tripType === 'round-trip') return 500;
  return 125;
}

export default function BookingFlow({ open, prefill = {}, onClose, cabs = [] }) {
  const [view, setView] = useState('cars');
  const [data, setData] = useState({});
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [payment, setPayment] = useState('part');
  const [bookingId, setBookingId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    const minDate = todayValue();
    const minTime = nextPickupTimeValue();
    const prefillDate = prefill.date || minDate;
    const prefillTime = prefill.time || '07:00';

    setView(prefill.startStep >= 2 ? 'cars' : 'details');
    setData({
      tripType: prefill.tripType || 'one-way',
      pickup: prefill.pickup || '',
      drop: prefill.drop || '',
      date: prefillDate,
      time: prefillDate === minDate && prefillTime < minTime ? minTime : prefillTime,
      returnDate: prefill.returnDate || '',
      rental: prefill.rental || '8 hrs / 80 km',
      passengers: prefill.passengers || '2 Passengers',
      vehicleSlug: prefill.vehicleSlug || '',
      name: '',
      phone: '',
      email: '',
      address: '',
      dropAddress: '',
      notes: ''
    });
    setSelectedAddons([]);
    setPayment('part');
    setBookingId('');
    setSubmitting(false);
  }, [open, prefill]);

  const fleet = useMemo(() => (Array.isArray(cabs) ? cabs.filter((cab) => cab.status !== 'inactive') : []), [cabs]);
  const vehicle = useMemo(() => fleet.find((cab) => cab.slug === data.vehicleSlug) || null, [fleet, data.vehicleSlug]);

  const fare = useMemo(() => {
    if (!vehicle) return null;
    const distance = tripDistance(data.tripType);
    const base = vehicle.startPrice > 0 ? vehicle.startPrice : vehicle.pricePerKm * distance;
    const driver = data.tripType === 'round-trip' ? 600 : 300;
    const toll = data.tripType === 'local' ? 0 : 200;
    const subtotal = base + driver + toll;
    const gst = Math.round(subtotal * 0.05);
    const addons = selectedAddons.reduce((sum, id) => sum + (ADDONS.find((item) => item.id === id)?.price || 0), 0);
    const total = subtotal + gst + addons;
    return { distance, base, driver, toll, gst, addons, total, payLater: Math.max(total - Math.round(total * 0.25), 0), partPay: Math.round(total * 0.25) };
  }, [vehicle, data.tripType, selectedAddons]);

  const set = (key, value) => setData((current) => ({ ...current, [key]: value }));

  const routeLabel = data.tripType === 'local'
    ? `${data.pickup || 'Pickup city'} - Local rental`
    : `${data.pickup || 'Pickup'} - ${data.drop || 'Drop'}`;

  const submit = async () => {
    if (!data.name || !data.phone || !data.address || !vehicle || !fare) {
      toast.error('Please add name, phone and pickup location.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          vehicleName: vehicle.name,
          fare: { ...fare, selectedAddons, paymentOption: payment }
        })
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.errors?.[0] || result.error || 'Unable to confirm booking');
        return;
      }
      setBookingId(result.booking.bookingId);
      setView('confirmed');
    } catch {
      toast.error('Unable to connect to booking server');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[94vh] max-w-[1500px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
        <button onClick={onClose} className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow hover:bg-slate-100" aria-label="Close booking">
          <X className="h-5 w-5" />
        </button>

        {view === 'confirmed' ? (
          <Confirmed bookingId={bookingId} data={data} vehicle={vehicle} fare={fare} onClose={onClose} />
        ) : (
          <div className="max-h-[94vh] overflow-y-auto bg-white">
            <TripBar data={data} routeLabel={routeLabel} onModify={() => setView('details')} />
            {view === 'details' && (
              <ModifyPanel data={data} set={set} onContinue={() => setView('cars')} />
            )}
            {view === 'cars' && (
              <CabSelection
                fleet={fleet}
                data={data}
                set={set}
                routeLabel={routeLabel}
                onCheckout={(slug) => {
                  set('vehicleSlug', slug);
                  setView('checkout');
                }}
              />
            )}
            {view === 'checkout' && (
              <Checkout
                data={data}
                set={set}
                routeLabel={routeLabel}
                vehicle={vehicle}
                fare={fare}
                selectedAddons={selectedAddons}
                setSelectedAddons={setSelectedAddons}
                payment={payment}
                setPayment={setPayment}
                onBack={() => setView('cars')}
                onSubmit={submit}
                submitting={submitting}
              />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function TripBar({ data, routeLabel, onModify }) {
  return (
    <div className="bg-sky-50 px-4 py-4 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-4 text-slate-900 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto] md:items-center">
        <div>
          <div className="text-xs text-black">Home &gt; Select Car</div>
          <div className="mt-3 text-xl font-black">{routeLabel}</div>
        </div>
        <Info label="Trip Type" value={TRIP_LABELS[data.tripType] || 'One way'} />
        <Info label="Pick up" value={prettyDate(data.date)} />
        <Info label="Time" value={data.time || '07:00'} />
        <Button variant="outline" onClick={onModify} className="rounded-full bg-white text-sky-600">Modify Booking</Button>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-sm text-slate-600">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}

function ModifyPanel({ data, set, onContinue }) {
  const minDate = todayValue();
  const minTime = data.date === minDate ? nextPickupTimeValue() : undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-5">
          <Field label="From" icon={MapPin}><Input value={data.pickup} onChange={(event) => set('pickup', event.target.value)} /></Field>
          <Field label={data.tripType === 'local' ? 'Package' : 'To'} icon={MapPin}><Input value={data.tripType === 'local' ? data.rental : data.drop} onChange={(event) => set(data.tripType === 'local' ? 'rental' : 'drop', event.target.value)} /></Field>
          <Field label="Pickup Date" icon={Calendar}><Input type="date" min={minDate} value={data.date} onChange={(event) => set('date', event.target.value)} /></Field>
          <Field label="Pickup Time" icon={Clock}><Input type="time" min={minTime} value={data.time} onChange={(event) => set('time', event.target.value)} /></Field>
          <Button onClick={onContinue} className="self-end bg-orange-500 font-black hover:bg-orange-600">Explore Cabs</Button>
        </div>
      </div>
    </div>
  );
}

function CabSelection({ fleet, data, routeLabel, onCheckout }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
      <FeatureStrip />
      <div className="mt-5 space-y-4">
        {!fleet.length && <div className="rounded-lg border border-slate-200 p-6 text-slate-600">No active cabs are available right now.</div>}
        {fleet.map((cab, index) => (
          <CabCard key={cab.slug} cab={cab} data={data} routeLabel={routeLabel} index={index} onCheckout={onCheckout} />
        ))}
      </div>
    </div>
  );
}

function FeatureStrip() {
  return (
    <div className="grid overflow-hidden rounded-md bg-gradient-to-r from-sky-500 to-sky-800 text-white shadow-sm md:grid-cols-3">
      <StripItem icon="Rs" title="Book Now" text="at Zero Cost" />
      <StripItem icon={<ShieldCheck className="h-10 w-10" />} title="Free Cancellations" text="Upto 1 Hour" />
      <StripItem icon={<Headphones className="h-10 w-10" />} title="24x7 Customer" text="Support" />
    </div>
  );
}

function StripItem({ icon, title, text }) {
  return (
    <div className="flex items-center justify-center gap-4 px-6 py-5 font-bold">
      <div className="text-5xl font-black leading-none">{icon}</div>
      <div>{title}<br />{text}</div>
    </div>
  );
}

function CabCard({ cab, data, index, routeLabel, onCheckout }) {
  const distance = tripDistance(data.tripType);
  const base = cab.startPrice > 0 ? cab.startPrice : cab.pricePerKm * distance;
  const taxes = Math.round((base + 300 + (data.tripType === 'local' ? 0 : 200)) * 0.05);
  const total = base + 300 + (data.tripType === 'local' ? 0 : 200) + taxes;
  const oldPrice = Math.round(total * 1.07);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-5 p-5 lg:grid-cols-[280px_1fr_240px] lg:items-center">
        <div className="flex h-44 items-center justify-center rounded bg-slate-50 p-3">
          <img src={cab.image} alt={cab.name} className="max-h-full max-w-full object-contain" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-2xl font-black text-slate-800">{cab.name}</h3>
            <span className="rounded bg-slate-950 px-2 py-1 text-xs font-bold text-white">4.8 <Star className="inline h-3 w-3 fill-yellow-400 text-yellow-400" /></span>
          </div>
          <p className="mt-1 text-sm italic text-slate-600">or equivalent | {cab.seats} seater AC Cab</p>
          <div className="mt-4 grid gap-3 text-sm text-slate-800 sm:grid-cols-2">
            <span className="flex items-center gap-2"><User className="h-5 w-5 text-sky-500" /> Driver allowance included</span>
            <span className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-sky-500" /> {cab.luggage}</span>
            <span className="flex items-center gap-2"><Check className="h-5 w-5 text-emerald-500" /> {distance} kms included</span>
            <span className="flex items-center gap-2"><ArrowLeftRight className="h-5 w-5 text-sky-500" /> Post limit: Rs {cab.pricePerKm || 16}/km</span>
          </div>
          <div className="mt-4 text-sm font-bold">Select Fuel Type</div>
          <div className="mt-2 flex gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="radio" defaultChecked name={`fuel-${cab.slug}`} className="accent-orange-500" /> CNG</label>
            <label className="flex items-center gap-2"><input type="radio" name={`fuel-${cab.slug}`} className="accent-orange-500" /> Diesel</label>
          </div>
          <details className="mt-4 text-sm text-sky-600">
            <summary className="cursor-pointer font-semibold">Inclusions and Exclusions</summary>
            <div className="mt-2 text-slate-600">Includes base fare, fuel, driver allowance and GST. Excludes extra pickups, parking and distance beyond package limit.</div>
          </details>
        </div>
        <div className="text-left lg:text-right">
          <div className="text-sm font-bold text-emerald-600">7% OFF <span className="text-slate-400 line-through">{money(oldPrice)}</span></div>
          <div className="mt-3 text-4xl font-black text-sky-500">{money(total)}</div>
          <div className="mt-1 text-sm text-black">+ {money(taxes)} Charges and Taxes</div>
          <Button onClick={() => onCheckout(cab.slug)} className="mt-5 h-12 rounded bg-orange-500 px-8 text-lg font-black uppercase hover:bg-orange-600">Select Car</Button>
        </div>
      </div>
      <div className="bg-sky-100 px-5 py-3 text-sm font-bold text-slate-900">New Car Promise - Model that is 2023 or newer @ Rs 249</div>
    </motion.div>
  );
}

function Checkout({ data, set, routeLabel, vehicle, fare, selectedAddons, setSelectedAddons, payment, setPayment, onBack, onSubmit, submitting }) {
  if (!vehicle || !fare) return null;

  const toggleAddon = (id) => {
    setSelectedAddons((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-7 lg:grid-cols-[1fr_440px] sm:px-8">
      <div className="space-y-5">
        <button onClick={onBack} className="text-sm font-bold text-sky-600">Back to cabs</button>
        <Section title="Review Your Booking" tone="blue">
          <div className="text-2xl text-black">{routeLabel} <span className="text-base font-normal text-black">({TRIP_LABELS[data.tripType]})</span></div>
          <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
            <div>Car Type: <b>{vehicle.name} or Equivalent</b></div>
            <div>Fuel Type: <b>CNG</b></div>
            <div>Pickup: <b>{prettyDate(data.date)}, {data.time}</b></div>
            <div>Kms included: <b>{fare.distance} kms</b></div>
          </div>
        </Section>

        <Section title="Contact & Pickup Details">
          <div className="grid gap-4 sm:grid-cols-[1fr_110px_1fr]">
            <Input value={data.name} onChange={(event) => set('name', event.target.value)} placeholder="Full Name" className="h-14 bg-slate-100 font-semibold text-black placeholder:text-black" />
            <select className="h-14 rounded-md border border-slate-200 bg-slate-500 px-3 font-semibold"><option>+91</option></select>
            <Input value={data.phone} onChange={(event) => set('phone', event.target.value)} placeholder="Mobile No." className="h-14 bg-slate-100 font-semibold text-black placeholder:text-black" />
            <Input value={data.email} onChange={(event) => set('email', event.target.value)} placeholder="Email ID" className="h-14 bg-slate-100 font-semibold text-black placeholder:text-black sm:col-span-3" />
            <Input value={data.address} onChange={(event) => set('address', event.target.value)} placeholder="Pickup Location" className="h-14 bg-slate-100 font-semibold text-black placeholder:text-black sm:col-span-3" />
            <Input value={data.dropAddress} onChange={(event) => set('dropAddress', event.target.value)} placeholder="Drop Location" className="h-14 bg-slate-100 font-semibold text-black placeholder:text-black sm:col-span-3" />
            <Textarea value={data.notes} onChange={(event) => set('notes', event.target.value)} placeholder="Any notes for driver" className="bg-slate-100 sm:col-span-3" />
          </div>
        </Section>

        <Section title="Personalize Your Journey" subtitle="Enhance your travel experience with our premium add-ons">
          <div className="space-y-3">
            {ADDONS.map((addon) => (
  <button
    key={addon.id}
    onClick={() => toggleAddon(addon.id)}
    className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm"
  >
    <span className="flex items-center gap-4">
      <span
        className={`h-7 w-7 rounded-md border-2 ${
          selectedAddons.includes(addon.id)
            ? 'border-sky-500 bg-sky-500 text-white'
            : 'border-sky-300'
        }`}
      >
        {selectedAddons.includes(addon.id) && (
          <Check className="m-1 h-4 w-4" />
        )}
      </span>

      <b className="text-black !text-black">
        {addon.label}
      </b>

      {addon.tag && (
        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-600">
          {addon.tag}
        </span>
      )}
    </span>

    <b className="text-black !text-black">
      {addon.priceText || money(addon.price)}
    </b>
  </button>
))}
          </div>
        </Section>

        <Section title="Inclusions/Exclusions">
          <div className="grid gap-5 text-sm sm:grid-cols-2 text-black">
            <List title="Inclusions" items={['Base Fare and Fuel Charges', 'Driver Allowance', 'GST (5%)', 'State Tax & Toll', 'AC cab']} good />
            <List title="Exclusions" items={[`Beyond package km charged at Rs ${vehicle.pricePerKm || 16}/km after ${fare.distance} km`, 'Multiple pickups/drops', 'Parking at actuals']} />
          </div>
          <details className="mt-5 border-t border-slate-100 pt-4 font-bold">
            <summary className="flex cursor-pointer items-center justify-between text-black">Read Terms and Conditions <ChevronDown className="h-4 w-4" /></summary>
            <p className="mt-3 text-sm font-normal text-slate-600">Free cancellation is available up to 1 hour before departure. Final driver and cab details are shared after confirmation.</p>
          </details>
        </Section>
      </div>

      <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-xl lg:sticky lg:top-24">
        <div className="mb-5 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 font-bold text-yellow-900">Free cancellation till 1 hr of departure</div>
        <h3 className="text-2xl text-black">Payment Options</h3>
        <PaymentOption active={payment === 'zero'} onClick={() => setPayment('zero')} title="Book at zero" subtitle={`Pay ${money(fare.total)} Later`} price="Rs 0" />
        <PaymentOption active={payment === 'part'} onClick={() => setPayment('part')} title="Part Pay" subtitle="Pay 25% now and rest to the driver" price={money(fare.partPay)} />
        <PaymentOption active={payment === 'full'} onClick={() => setPayment('full')} title="Full Pay" subtitle="Full amount" price={money(fare.total)} />
        <div className="mt-5 border-t border-slate-100 pt-5">
          <div className="text-black">Coupon & Offers</div>
          <div className="mt-3 flex gap-2"><Input placeholder="ENTER A COUPON" /><Button className="bg-sky-500 hover:bg-sky-600">APPLY</Button></div>
        </div>
        <Button onClick={onSubmit} disabled={submitting} className="mt-5 h-14 w-full rounded-lg bg-orange-500 text-lg font-black uppercase hover:bg-orange-600">
          {submitting ? 'Proceeding...' : 'Proceed'}
        </Button>
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer font-bold text-sky-600">View Fare Break up</summary>
          <div className="mt-3 space-y-2 text-slate-700">
            <FareRow label="Base fare" value={fare.base} />
            <FareRow label="Driver allowance" value={fare.driver} />
            <FareRow label="Taxes" value={fare.gst} />
            <FareRow label="Add-ons" value={fare.addons} />
            <FareRow label="Total" value={fare.total} bold />
          </div>
        </details>
      </aside>
    </div>
  );
}

function Section({ title, subtitle, tone, children }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className={`${tone === 'blue' ? 'bg-sky-500 text-white' : 'border-b border-slate-100 bg-white text-slate-950'} px-5 py-4`}>
        <h2 className="text-xl font-black">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-black">{subtitle}</p>}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function PaymentOption({ active, onClick, title, subtitle, price }) {
  return (
    <button
      onClick={onClick}
      className={`mt-4 flex w-full items-center justify-between rounded-lg border p-4 text-left ${
        active
          ? 'border-sky-300 bg-sky-50 ring-2 ring-sky-100'
          : 'border-slate-200 bg-white'
      }`}
    >
      <span className="flex items-center gap-4">
        <span
          className={`h-6 w-6 rounded-full border-2 ${
            active
              ? 'border-sky-500 bg-sky-500 ring-2 ring-sky-200'
              : 'border-sky-400'
          }`}
        />
        <span>
          <b className="text-lg text-black">{title}</b>
          <br />
          <span className="text-sm text-black">{subtitle}</span>
        </span>
      </span>

      <b className="text-xl text-black">{price}</b>
    </button>
  );
}

function FareRow({ label, value, bold }) {
  return <div className={`flex justify-between ${bold ? 'border-t border-slate-100 pt-2 font-black' : ''}`}><span>{label}</span><span>{money(value)}</span></div>;
}

function List({ title, items, good }) {
  return (
    <div>
      <div className={`mb-3 font-bold ${good ? 'text-emerald-600' : 'text-red-500'}`}>{title}</div>
      <div className="space-y-3">
        {items.map((item) => <div key={item} className="flex gap-3"><span className={good ? 'text-emerald-500' : 'text-red-500'}>{good ? '✓' : '×'}</span>{item}</div>)}
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, children }) {
  return (
    <label>
      <span className="mb-2 flex items-center gap-2 text-sm font-black uppercase text-slate-600"><Icon className="h-4 w-4 text-sky-500" /> {label}</span>
      {children}
    </label>
  );
}

function Confirmed({ bookingId, data, vehicle, fare, onClose }) {
  return (
    <div className="bg-slate-50 p-6 text-center sm:p-10">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg"><Check className="h-10 w-10" /></div>
      <h2 className="mt-5 text-5xl text-black">Booking Confirmed</h2>
      <p className="mt-2 text-slate-600">Our travel expert will call you within 15 minutes with driver details.</p>
      <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 font-mono text-sm text-white">
        {bookingId || 'TTX000000'}
        <button onClick={() => { navigator.clipboard?.writeText(bookingId); toast.success('Booking ID copied'); }}><Copy className="h-4 w-4" /></button>
      </div>
      <div className="mx-auto mt-6 max-w-2xl rounded-lg border border-slate-200 bg-white p-5 text-left">
        <div className="grid gap-3 sm:grid-cols-2 text-slate-600">
          <Info label="Cab" value={vehicle?.name || '-'} />
          <Info label="Fare" value={fare ? money(fare.total) : '-'} />
          <Info label="Pickup" value={data.pickup || '-'} />
          <Info label="Date & Time" value={`${prettyDate(data.date)} ${data.time || ''}`} />
        </div>
      </div>
      <a href="tel:+918955458128" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-black text-slate-950 shadow"><Phone className="h-5 w-5" /> Talk to us</a>
      <div><Button onClick={onClose} className="mt-5 bg-orange-500 hover:bg-orange-600">Close</Button></div>
    </div>
  );
}

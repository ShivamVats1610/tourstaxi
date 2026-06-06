'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, ArrowLeft, X, MapPin, Calendar, Clock, Users, Repeat, Timer, Plane, ArrowRight as ARight, Check, Briefcase, Sparkles, ShieldCheck, Phone, Mail, User, FileText, Copy, PartyPopper } from 'lucide-react';
import { FLEET, PACKAGES } from '@/lib/data';
import { toast } from 'sonner';

const TRIP_TYPES = [
  { id: 'one-way', label: 'One Way', icon: ARight, desc: 'Pay only for one side. No return charges.' },
  { id: 'round-trip', label: 'Round Trip', icon: Repeat, desc: 'Multi-day outstation with the same cab.' },
  { id: 'local', label: 'Local Rental', icon: Timer, desc: 'Hourly packages within city limits.' },
  { id: 'airport', label: 'Airport Transfer', icon: Plane, desc: 'Flight-tracked airport pickups & drops.' }
];

const STEPS = ['Trip Type', 'Locations', 'Choose Cab', 'Fare Summary', 'Your Details', 'Confirmed'];

const genBookingId = () => 'TTX' + Math.random().toString(36).slice(2, 8).toUpperCase() + Math.floor(10 + Math.random() * 89);

export default function BookingFlow({ open, prefill = {}, onClose }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});
  const [bookingId, setBookingId] = useState('');

  // Hydrate on open with prefill
  useEffect(() => {
    if (open) {
      queueMicrotask(() => {
        setStep(prefill.startStep ?? 0);
        setData({
          tripType: prefill.tripType || 'one-way',
          pickup: prefill.pickup || '',
          drop: prefill.drop || '',
          date: prefill.date || '',
          time: prefill.time || '10:00',
          returnDate: prefill.returnDate || '',
          rental: prefill.rental || '8 hrs / 80 km',
          passengers: prefill.passengers || '2 Passengers',
          vehicleSlug: prefill.vehicleSlug || '',
          packageSlug: prefill.packageSlug || '',
          name: '', phone: '', email: '', address: '', notes: ''
        });
        setBookingId('');
      });
    }
  }, [open, prefill]);

  const vehicle = useMemo(() => FLEET.find(v => v.slug === data.vehicleSlug) || null, [data.vehicleSlug]);
  const pkg = useMemo(() => PACKAGES.find(p => p.slug === data.packageSlug) || null, [data.packageSlug]);

  // Dummy fare
  const fare = useMemo(() => {
    if (!vehicle) return null;
    const distance = data.tripType === 'local' ? 80 : data.tripType === 'airport' ? 35 : data.tripType === 'round-trip' ? 500 : 250;
    const base = vehicle.pricePerKm * distance;
    const driver = data.tripType === 'round-trip' ? 600 : 300;
    const toll = data.tripType === 'local' ? 0 : 200;
    const subtotal = base + driver + toll;
    const gst = Math.round(subtotal * 0.05);
    const total = subtotal + gst;
    return { distance, base, driver, toll, gst, total };
  }, [vehicle, data.tripType]);

  const set = (k, v) => setData(d => ({ ...d, [k]: v }));

  const canNext = () => {
    if (step === 0) return !!data.tripType;
    if (step === 1) return !!data.pickup && (data.tripType === 'local' || !!data.drop) && !!data.date;
    if (step === 2) return !!data.vehicleSlug;
    if (step === 4) return !!data.name && !!data.phone;
    return true;
  };

  const next = () => {
    if (step === 4) {
      setBookingId(genBookingId());
      setStep(5);
      return;
    }
    setStep(s => Math.min(5, s + 1));
  };
  const back = () => setStep(s => Math.max(0, s - 1));

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden bg-white rounded-2xl border-0 shadow-2xl">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-sky-600 via-sky-700 to-orange-600 text-white p-5 sm:p-6">
          <button onClick={onClose} className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition"><X className="h-4 w-4" /></button>
          <div className="text-[11px] uppercase tracking-[0.18em] opacity-80">Step {step + 1} of {STEPS.length}</div>
          <h2 className="text-2xl font-extrabold mt-0.5">{STEPS[step]}</h2>
          <div className="mt-4 h-1.5 bg-white/15 rounded-full overflow-hidden">
            <motion.div className="h-full bg-white rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ ease: 'easeOut', duration: 0.4 }} />
          </div>
          <div className="hidden sm:flex mt-4 gap-1 text-[11px] uppercase tracking-wider opacity-90">
            {STEPS.map((s, i) => (
              <div key={s} className={`flex-1 text-center py-1 rounded ${i <= step ? 'opacity-100' : 'opacity-50'}`}>{s}</div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="relative px-5 sm:px-8 py-6 sm:py-8 min-h-[420px] max-h-[65vh] overflow-y-auto bg-slate-50">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
              {step === 0 && <Step1 value={data.tripType} onChange={(v) => set('tripType', v)} />}
              {step === 1 && <Step2 data={data} set={set} />}
              {step === 2 && <Step3 value={data.vehicleSlug} onChange={(v) => set('vehicleSlug', v)} />}
              {step === 3 && <Step4 vehicle={vehicle} fare={fare} data={data} />}
              {step === 4 && <Step5 data={data} set={set} />}
              {step === 5 && <Step6 bookingId={bookingId} data={data} vehicle={vehicle} fare={fare} pkg={pkg} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        {step < 5 && (
          <div className="border-t border-slate-200 bg-white px-5 sm:px-8 py-4 flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={back} disabled={step === 0} className="text-slate-600"><ArrowLeft className="h-4 w-4 mr-1.5" /> Back</Button>
            <Button onClick={next} disabled={!canNext()} className="h-11 px-6 bg-gradient-to-r from-sky-500 to-orange-500 hover:opacity-95 font-bold shadow-lg shadow-sky-500/30">
              {step === 4 ? <>Confirm Booking <Check className="h-4 w-4 ml-2" /></> : <>Continue <ArrowRight className="h-4 w-4 ml-2" /></>}
            </Button>
          </div>
        )}
        {step === 5 && (
          <div className="border-t border-slate-200 bg-white px-5 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-slate-600">A confirmation will be sent to your phone & email.</div>
            <Button onClick={onClose} className="h-11 px-6 bg-slate-900 hover:bg-slate-800 font-bold">Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Step 1: Trip type ---------------- */
function Step1({ value, onChange }) {
  return (
    <div>
      <p className="text-slate-600 mb-5">What kind of ride are you planning?</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {TRIP_TYPES.map(t => {
          const Icon = t.icon;
          const active = value === t.id;
          return (
            <button key={t.id} onClick={() => onChange(t.id)} className={`text-left p-5 rounded-2xl border-2 transition-all group ${active ? 'border-sky-500 bg-sky-50 shadow-lg shadow-sky-500/10' : 'border-slate-200 bg-white hover:border-sky-300'}`}>
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-3 transition ${active ? 'bg-gradient-to-br from-sky-500 to-orange-500 text-white shadow-lg shadow-sky-500/30' : 'bg-slate-100 text-slate-600 group-hover:bg-sky-100 group-hover:text-sky-600'}`}><Icon className="h-6 w-6" /></div>
              <div className="font-bold text-slate-900">{t.label}</div>
              <div className="text-sm text-slate-500 mt-0.5">{t.desc}</div>
              {active && <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-sky-700"><Check className="h-3.5 w-3.5" /> Selected</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Step 2: Locations ---------------- */
function Step2({ data, set }) {
  return (
    <div>
      <p className="text-slate-600 mb-5">Where are you headed?</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Labeled icon={MapPin} label="Pickup Location">
          <Input value={data.pickup} onChange={(e) => set('pickup', e.target.value)} placeholder="e.g. Sawai Madhopur Railway Station" />
        </Labeled>
        {data.tripType !== 'local' ? (
          <Labeled icon={MapPin} label="Drop Location">
            <Input value={data.drop} onChange={(e) => set('drop', e.target.value)} placeholder="e.g. Jaipur Airport" />
          </Labeled>
        ) : (
          <Labeled icon={Timer} label="Rental Package">
            <select value={data.rental} onChange={(e) => set('rental', e.target.value)} className="h-10 w-full rounded-md border border-slate-200 px-3 bg-white text-sm">
              {['4 hrs / 40 km', '8 hrs / 80 km', '12 hrs / 120 km'].map(o => <option key={o}>{o}</option>)}
            </select>
          </Labeled>
        )}
        <Labeled icon={Calendar} label="Pickup Date">
          <Input type="date" value={data.date} onChange={(e) => set('date', e.target.value)} />
        </Labeled>
        <Labeled icon={Clock} label="Pickup Time">
          <Input type="time" value={data.time} onChange={(e) => set('time', e.target.value)} />
        </Labeled>
        {data.tripType === 'round-trip' && (
          <Labeled icon={Calendar} label="Return Date">
            <Input type="date" value={data.returnDate} onChange={(e) => set('returnDate', e.target.value)} />
          </Labeled>
        )}
        <Labeled icon={Users} label="Passengers">
          <select value={data.passengers} onChange={(e) => set('passengers', e.target.value)} className="h-10 w-full rounded-md border border-slate-200 px-3 bg-white text-sm">
            {['1 Passenger', '2 Passengers', '3 Passengers', '4 Passengers', '5+ Passengers'].map(o => <option key={o}>{o}</option>)}
          </select>
        </Labeled>
      </div>
    </div>
  );
}

function Labeled({ icon: Icon, label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 flex items-center gap-1.5"><Icon className="h-3.5 w-3.5 text-sky-500" /> {label}</span>
      {children}
    </label>
  );
}

/* ---------------- Step 3: Vehicle ---------------- */
function Step3({ value, onChange }) {
  return (
    <div>
      <p className="text-slate-600 mb-5">Pick the cab that fits your trip.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {FLEET.map(v => {
          const active = value === v.slug;
          return (
            <button key={v.slug} onClick={() => onChange(v.slug)} className={`text-left rounded-2xl border-2 overflow-hidden transition-all group ${active ? 'border-sky-500 shadow-lg shadow-sky-500/10' : 'border-slate-200 hover:border-sky-300'} bg-white`}>
              <div className="flex gap-3">
                <div className="w-28 h-28 shrink-0 bg-slate-100 overflow-hidden">
                  <img src={v.image} alt={v.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex-1 p-3 pr-3">
                  <div className="text-[10px] uppercase text-sky-600 font-semibold tracking-wider">{v.category}</div>
                  <div className="font-bold text-slate-900 leading-tight">{v.name}</div>
                  <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{v.seats}</span>
                    <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{v.luggage}</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold">AC</span>
                  </div>
                  <div className="mt-1.5 text-[11px] text-slate-500 line-clamp-1">{v.features.slice(0, 2).join(' · ')}</div>
                  <div className="mt-1 flex items-center justify-between">
                    <div className="font-extrabold text-slate-900">₹{v.startPrice.toLocaleString()}</div>
                    {active ? <span className="text-xs font-bold text-sky-600 flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Picked</span> : <span className="text-xs text-slate-400">Select</span>}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Step 4: Fare ---------------- */
function Step4({ vehicle, fare, data }) {
  if (!vehicle || !fare) return <div className="text-slate-600">Please select a vehicle first.</div>;
  const rows = [
    { label: `Base Fare (${fare.distance} km × ₹${vehicle.pricePerKm}/km)`, val: fare.base },
    { label: 'Driver Allowance', val: fare.driver },
    { label: 'Toll & Parking', val: fare.toll },
    { label: 'GST @ 5%', val: fare.gst }
  ];
  return (
    <div>
      <div className="flex gap-4 bg-white rounded-2xl border border-slate-200 p-4 mb-5">
        <img src={vehicle.image} alt={vehicle.name} className="w-24 h-24 rounded-xl object-cover" />
        <div className="flex-1">
          <div className="text-[10px] uppercase text-sky-600 font-semibold tracking-wider">{vehicle.category}</div>
          <div className="font-bold text-slate-900">{vehicle.name}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-3"><MapPin className="h-3 w-3" />{data.pickup || 'Pickup'} → {data.drop || (data.tripType === 'local' ? data.rental : 'Drop')}</div>
          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3"><Calendar className="h-3 w-3" />{data.date || 'Date'} · <Clock className="h-3 w-3" />{data.time}</div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 font-semibold text-slate-900 flex items-center gap-2"><FileText className="h-4 w-4 text-sky-500" /> Fare Breakdown</div>
        <div className="divide-y divide-slate-100">
          {rows.map((r, i) => (
            <motion.div key={r.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="px-5 py-3 flex items-center justify-between text-sm">
              <span className="text-slate-600">{r.label}</span>
              <span className="font-semibold text-slate-900">₹{r.val.toLocaleString()}</span>
            </motion.div>
          ))}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="px-5 py-4 flex items-center justify-between bg-gradient-to-r from-sky-50 to-orange-50">
            <span className="font-bold text-slate-900">Total Fare</span>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-sky-600 to-orange-500 bg-clip-text text-transparent">₹{fare.total.toLocaleString()}</span>
          </motion.div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Verified driver</span>
        <span className="inline-flex items-center gap-1"><Sparkles className="h-3.5 w-3.5 text-orange-500" /> Sanitised cab</span>
        <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-sky-500" /> Free cancellation • 4 hrs before pickup</span>
      </div>
    </div>
  );
}

/* ---------------- Step 5: Customer ---------------- */
function Step5({ data, set }) {
  return (
    <div>
      <p className="text-slate-600 mb-5">Just a few details and we are set!</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Labeled icon={User} label="Full Name *"><Input value={data.name} onChange={(e) => set('name', e.target.value)} placeholder="Your full name" /></Labeled>
        <Labeled icon={Phone} label="Phone Number *"><Input type="tel" value={data.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+91 9XXXXXXXXX" /></Labeled>
        <Labeled icon={Mail} label="Email Address"><Input type="email" value={data.email} onChange={(e) => set('email', e.target.value)} placeholder="name@example.com" /></Labeled>
        <Labeled icon={MapPin} label="Detailed Pickup Address"><Input value={data.address} onChange={(e) => set('address', e.target.value)} placeholder="House/Hotel, Street, Landmark" /></Labeled>
        <div className="sm:col-span-2">
          <Labeled icon={FileText} label="Notes for the driver (optional)">
            <Textarea rows={3} value={data.notes} onChange={(e) => set('notes', e.target.value)} placeholder="e.g. Baby seat needed, vegetarian driver preferred..." />
          </Labeled>
        </div>
      </div>
      <div className="mt-5 bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 text-sm text-sky-900 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-sky-600" /> No payment required now. Pay only after the cab is assigned.
      </div>
    </div>
  );
}

/* ---------------- Step 6: Confirmation ---------------- */
function Step6({ bookingId, data, vehicle, fare }) {
  return (
    <div className="text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }} className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center shadow-xl shadow-emerald-500/30 mb-4">
        <Check className="h-10 w-10 text-white" strokeWidth={3} />
      </motion.div>
      <motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-2xl sm:text-3xl font-extrabold text-slate-900">
        Booking Confirmed! <PartyPopper className="inline h-6 w-6 text-orange-500" />
      </motion.h3>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-2 text-slate-600">Your cab is reserved. Our team will call within 15 minutes.</motion.p>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-mono">
        Booking ID: <span className="font-bold">{bookingId}</span>
        <button onClick={() => { navigator.clipboard?.writeText(bookingId); toast.success('Booking ID copied'); }} className="hover:text-orange-400"><Copy className="h-3.5 w-3.5" /></button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-6 text-left bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 font-semibold text-slate-900">Booking Summary</div>
        <div className="p-5 grid sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
          <Row label="Trip Type" value={data.tripType?.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())} />
          <Row label="Cab" value={vehicle?.name} />
          <Row label="Pickup" value={data.pickup} />
          <Row label="Drop" value={data.tripType === 'local' ? data.rental : data.drop} />
          <Row label="Date & Time" value={`${data.date || '-'} · ${data.time}`} />
          <Row label="Passengers" value={data.passengers} />
          <Row label="Booked By" value={`${data.name} (${data.phone})`} />
          <Row label="Total Fare" value={fare ? `₹${fare.total.toLocaleString()}` : '-'} highlight />
        </div>
      </motion.div>
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
      <div className={highlight ? 'text-lg font-extrabold text-orange-600' : 'text-slate-900 font-semibold'}>{value || '—'}</div>
    </div>
  );
}

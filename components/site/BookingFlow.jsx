'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeftRight, Briefcase, Calendar, Check, ChevronDown, Clock, Copy, Headphones, Phone, Plus, ShieldCheck, Star, Trash2, User, X } from 'lucide-react';
import { toast } from 'sonner';
import LocationAutocomplete from '@/components/site/booking/LocationAutocomplete';
import RouteMap from '@/components/site/booking/RouteMap';
import FareCalculator from '@/components/site/booking/FareCalculator';
import { calculateMinimumBillingFare, vehicleRate } from '@/lib/fare-policy';

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

const LOCAL_PACKAGES = [
  { id: '4h40', label: '4 HRS | 40 KM', value: '4 hrs / 40 km', km: 40, priceKey: 'local4hrPrice' },
  { id: '8h80', label: '8 HRS | 80 KM', value: '8 hrs / 80 km', km: 80, priceKey: 'local8hrPrice' },
  { id: '12h120', label: '12 HRS | 120 KM', value: '12 hrs / 120 km', km: 120, priceKey: 'local12hrPrice' }
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
  const amount = Number(value || 0);
  return `${amount < 0 ? '-' : ''}Rs ${Math.abs(amount).toLocaleString('en-IN')}`;
}

function prettyDate(value) {
  if (!value) return '';
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatKm(value) {
  const km = Number(value || 0);
  return `${km.toLocaleString('en-IN', { maximumFractionDigits: 1 })} km`;
}

function formatDuration(minutes) {
  const total = Number(minutes || 0);
  if (!total) return '-';
  const hrs = Math.floor(total / 60);
  const mins = total % 60;
  if (!hrs) return `${mins} min`;
  return `${hrs} hr${hrs > 1 ? 's' : ''}${mins ? ` ${mins} min` : ''}`;
}

function dateTimeValue(date, time) {
  return `${date || todayValue()}T${time || '07:00'}`;
}

function splitDateTime(value) {
  const [nextDate, nextTime = '07:00'] = String(value || '').split('T');
  return { nextDate, nextTime: nextTime.slice(0, 5) };
}

function routeDistance(data) {
  if (data.tripType === 'local') {
    const selectedPackage = LOCAL_PACKAGES.find((item) => item.value === data.rental);
    const km = selectedPackage?.km || Number((data.rental || '').match(/\d+\s*hrs\s*\/\s*(\d+)/i)?.[1]);
    return km || 80;
  }
  const roadKm = Number(data.distanceKm) || 0;
  if (data.tripType === 'airport') return roadKm || 35;
  return data.tripType === 'round-trip' ? roadKm * 2 : roadKm;
}

function cabFare(cab, data, selectedAddons = []) {
  if (['one-way', 'round-trip', 'airport'].includes(data.tripType)) {
    const addonObjects = selectedAddons.map((id) => ADDONS.find((item) => item.id === id)).filter(Boolean);
    return calculateMinimumBillingFare(cab, data, addonObjects);
  }

  const distance = routeDistance(data);
  const selectedLocalPackage = data.tripType === 'local' ? LOCAL_PACKAGES.find((item) => item.value === data.rental) : null;
  const packagePrice = selectedLocalPackage ? Number(cab[selectedLocalPackage.priceKey]) : 0;
  const tripRate = data.tripType === 'local' ? cab.localPricePerKm : cab.pricePerKm;
  const cabRatePerKm = Number(tripRate) > 0 ? Number(tripRate) : vehicleRate(cab);
  const cabDistanceFare = packagePrice > 0 ? packagePrice : Math.round(distance * cabRatePerKm);
  const allowedFuel = fuelOptions(cab);
  const activeFuel = allowedFuel.includes(data.fuelType) ? data.fuelType : allowedFuel[0];
  const fuelSurchargePerKm = activeFuel === 'diesel' ? 1.1 : 0;
  const fuelSurcharge = Math.round(distance * fuelSurchargePerKm);
  const addons = selectedAddons.reduce((sum, id) => sum + (ADDONS.find((item) => item.id === id)?.price || 0), 0);
  const total = cabDistanceFare + fuelSurcharge + addons;
  return {
    actualDistance: distance,
    minimumDistance: 0,
    chargeableDistance: distance,
    vehicleRate: cabRatePerKm + fuelSurchargePerKm,
    estimatedFare: cabDistanceFare + fuelSurcharge,
    tripDays: 1,
    minimumApplied: false,
    distance,
    durationMinutes: data.durationMinutes || 0,
    base: 0,
    ratePerKm: packagePrice > 0 ? Math.round(packagePrice / Math.max(distance, 1)) + fuelSurchargePerKm : cabRatePerKm + fuelSurchargePerKm,
    distanceFare: cabDistanceFare + fuelSurcharge,
    fuelSurcharge,
    driver: 0,
    toll: 0,
    discount: 0,
    gst: 0,
    addons,
    total,
    totalFare: total,
    payLater: Math.max(total - Math.round(total * 0.25), 0),
    partPay: Math.round(total * 0.25),
    oldPrice: total
  };
}

function fuelOptions(cab) {
  const options = Array.isArray(cab?.fuelOptions) && cab.fuelOptions.length ? cab.fuelOptions : ['cng', 'diesel'];
  return [...new Set(options.map((item) => String(item).toLowerCase()).filter((item) => ['cng', 'diesel'].includes(item)))];
}

function fuelLabel(value) {
  return value === 'diesel' ? 'Diesel' : 'CNG';
}

export default function BookingFlow({ open, prefill = {}, onClose, cabs = [] }) {
  const [view, setView] = useState('cars');
  const [data, setData] = useState({});
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [payment, setPayment] = useState('part');
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    const minDate = todayValue();
    const minTime = nextPickupTimeValue();
    const prefillDate = prefill.date || minDate;
    const prefillTime = prefill.time || '07:00';

    // Reset the modal to the latest booking request whenever it opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setView(prefill.startStep >= 2 ? 'cars' : 'details');
    setData({
      tripType: prefill.tripType || 'one-way',
      pickup: prefill.pickup || '',
      drop: prefill.drop || '',
      date: prefillDate,
      time: prefillDate === minDate && prefillTime < minTime ? minTime : prefillTime,
      returnDate: prefill.returnDate || '',
      returnTime: prefill.returnTime || '18:00',
      stops: Array.isArray(prefill.stops) ? prefill.stops : [],
      stopCoordinates: Array.isArray(prefill.stopCoordinates) ? prefill.stopCoordinates : [],
      rental: prefill.rental || '8 hrs / 80 km',
      passengers: prefill.passengers || '2 Passengers',
      vehicleSlug: prefill.vehicleSlug || '',
      fuelType: prefill.fuelType || 'cng',
      distanceKm: prefill.distanceKm || null,
      durationMinutes: prefill.durationMinutes || null,
      routeGeometry: prefill.routeGeometry || null,
      pickupCoordinates: prefill.pickupCoordinates || null,
      dropCoordinates: prefill.dropCoordinates || null,
      name: '',
      phone: '',
      email: '',
      address: '',
      dropAddress: '',
      notes: ''
    });
    setSelectedAddons([]);
    setPayment('part');
    setPaymentStarted(false);
    setBookingId('');
    setSubmitting(false);
  }, [open, prefill]);

  const fleet = useMemo(() => (Array.isArray(cabs) ? cabs.filter((cab) => cab.status !== 'inactive') : []), [cabs]);
  const vehicle = useMemo(() => fleet.find((cab) => cab.slug === data.vehicleSlug) || null, [fleet, data.vehicleSlug]);

  const fare = useMemo(() => {
    if (!vehicle) return null;
    return cabFare(vehicle, data, selectedAddons);
  }, [vehicle, data, selectedAddons]);

  const set = useCallback((key, value) => setData((current) => ({
    ...current,
    [key]: value,
    ...(key === 'pickup' ? { pickupCoordinates: null, distanceKm: null, durationMinutes: null, routeGeometry: null } : {}),
    ...(key === 'drop' ? { dropCoordinates: null, distanceKm: null, durationMinutes: null, routeGeometry: null } : {})
  })), []);

  const selectLocation = useCallback((type, location) => {
    setData((current) => ({
      ...current,
      [type]: location.label,
      [`${type}Coordinates`]: location.coordinates,
      distanceKm: null,
      durationMinutes: null,
      routeGeometry: null
    }));
  }, []);

  const handleRouteChange = useCallback((route) => {
    setData((current) => ({
      ...current,
      distanceKm: route?.distanceKm || null,
      durationMinutes: route?.durationMinutes || null,
      routeGeometry: route?.geometry || null
    }));
  }, []);

  const routeLabel = data.tripType === 'local'
    ? `${data.pickup || 'Pickup'} - ${data.drop || 'Drop'}`
    : `${data.pickup || 'Pickup'} - ${data.drop || 'Drop'}`;

  const submit = async () => {
    if (!data.name || !data.phone || !data.address || !vehicle || !fare) {
      toast.error('Please add name, phone and pickup location.');
      return;
    }

    const paymentAmount = payment === 'full' ? fare.total : payment === 'part' ? fare.partPay : 0;
    if (paymentAmount > 0 && !paymentStarted) {
      openUpiPayment(paymentAmount, `TTX-${Date.now()}`, payment);
      setPaymentStarted(true);
      toast.info('Complete UPI payment, then return here and confirm your booking.');
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
          fare: { ...fare, selectedAddons, paymentOption: payment, advancePaid: paymentAmount }
        })
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.errors?.[0] || result.error || 'Unable to confirm booking');
        return;
      }
      setBookingId(result.booking.bookingId);
      toast.success('Booking request received', {
        description: `Reference ${result.booking.bookingId}. Our team will call shortly.`
      });
      setView('confirmed');
    } catch {
      toast.error('Unable to connect to booking server');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[96vh] w-[calc(100vw-16px)] max-w-[1500px] overflow-hidden rounded-lg border border-slate-200 bg-white p-0 shadow-2xl sm:w-[calc(100vw-32px)]">
        <button onClick={onClose} className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow hover:bg-slate-100" aria-label="Close booking">
          <X className="h-5 w-5" />
        </button>

        {view === 'confirmed' ? (
          <Confirmed bookingId={bookingId} data={data} vehicle={vehicle} fare={fare} onClose={onClose} />
        ) : (
          <div className="max-h-[96vh] overflow-y-auto bg-slate-50">
            <TripBar data={data} routeLabel={routeLabel} onModify={() => setView('details')} />
            {view === 'details' && (
              <ModifyPanel data={data} set={set} onSelectLocation={selectLocation} onContinue={() => {
                if (!data.pickup?.trim() || !data.drop?.trim()) {
                  toast.error('Please enter pickup location and drop location.');
                  return;
                }
                setView('cars');
              }} />
            )}
            {view === 'cars' && (
              <CabSelection
                fleet={fleet}
                data={data}
                set={set}
                routeLabel={routeLabel}
                onCheckout={(slug) => {
                  const cab = fleet.find((item) => item.slug === slug);
                  const allowed = fuelOptions(cab);
                  setData((current) => ({
                    ...current,
                    vehicleSlug: slug,
                    fuelType: allowed.includes(current.fuelType) ? current.fuelType : allowed[0] || 'cng',
                    address: current.address || current.pickup || '',
                    dropAddress: current.dropAddress || current.drop || ''
                  }));
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
                setPayment={(nextPayment) => {
                  setPayment(nextPayment);
                  setPaymentStarted(false);
                }}
                paymentStarted={paymentStarted}
                onBack={() => setView('cars')}
                onSubmit={submit}
                submitting={submitting}
              />
            )}
            <FareCalculator
              compact
              pickupCoordinates={data.pickupCoordinates}
              dropCoordinates={data.tripType === 'local' ? null : data.dropCoordinates}
              pickupLabel={data.pickup || ''}
              dropLabel={data.tripType === 'local' ? '' : data.drop || ''}
              onRouteChange={handleRouteChange}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function openUpiPayment(amount, bookingId, paymentOption) {
  const params = new URLSearchParams({
    pa: 'merchant1305070.augp@aubank',
    pn: 'ToursTaxi',
    am: String(Math.max(Number(amount || 0), 1)),
    cu: 'INR',
    tn: `ToursTaxi ${paymentOption === 'full' ? 'full payment' : 'advance'} ${bookingId}`
  });
  window.location.href = `upi://pay?${params.toString()}`;
}

function TripBar({ data, routeLabel, onModify }) {
  return (
    <div className="bg-slate-950 px-4 py-3 text-white sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-[1.5fr_2fr_auto] md:items-center">
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wide text-teal-200">Select Car</div>
          <div className="mt-1 truncate text-base font-black leading-tight sm:text-lg">{routeLabel}</div>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-md bg-white/5 p-2 md:bg-transparent md:p-0">
          <Info label="Trip Type" value={TRIP_LABELS[data.tripType] || 'One way'} invert />
          <Info label="Pick up" value={prettyDate(data.date)} invert />
          <Info label="Time" value={`${data.time || '07:00'}${data.returnTime ? ` / ${data.returnTime}` : ''}`} invert />
        </div>
        <Button variant="outline" onClick={onModify} className="h-10 rounded-md border-white/20 bg-white text-slate-950">Modify</Button>
      </div>
    </div>
  );
}

function Info({ label, value, invert = false }) {
  return (
    <div className="min-w-0">
      <div className={`text-[11px] font-bold uppercase tracking-wide ${invert ? 'text-white/60' : 'text-slate-600'}`}>{label}</div>
      <div className={`truncate text-xs font-bold sm:text-sm ${invert ? 'text-white' : 'text-slate-950'}`}>{value}</div>
    </div>
  );
}

function ModifyPanel({ data, set, onSelectLocation, onContinue }) {
  const minDate = todayValue();
  const minTime = data.date === minDate ? nextPickupTimeValue() : undefined;
  const canAddStop = ['one-way', 'round-trip', 'airport'].includes(data.tripType);
  const updateStop = (index, value) => {
    set('stops', (data.stops || []).map((stop, itemIndex) => itemIndex === index ? value : stop));
    set('stopCoordinates', (data.stopCoordinates || []).map((coordinates, itemIndex) => itemIndex === index ? null : coordinates));
  };
  const selectStop = (index, location) => {
    set('stops', (data.stops || []).map((stop, itemIndex) => itemIndex === index ? location.label : stop));
    set('stopCoordinates', (data.stopCoordinates || []).map((coordinates, itemIndex) => itemIndex === index ? location.coordinates : coordinates));
  };
  const removeStop = (index) => {
    set('stops', (data.stops || []).filter((_, itemIndex) => itemIndex !== index));
    set('stopCoordinates', (data.stopCoordinates || []).filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-8 sm:py-6">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 lg:grid-cols-5">
          <LocationAutocomplete label={data.tripType === 'local' ? 'Pickup Location' : 'From'} value={data.pickup || ''} placeholder="Pickup location" onValueChange={(value) => set('pickup', value)} onSelect={(location) => onSelectLocation('pickup', location)} showCurrentLocation />
          <LocationAutocomplete label={data.tripType === 'local' ? 'Drop Location' : 'To'} value={data.drop || ''} placeholder="Drop location" onValueChange={(value) => set('drop', value)} onSelect={(location) => onSelectLocation('drop', location)} />
          <div className="grid gap-3 rounded-lg bg-slate-50 p-3 lg:col-span-2">
            <DateTimeField
              label="Pickup Date & Time"
              date={data.date}
              time={data.time}
              minDate={minDate}
              minTime={minTime}
              onChange={(value) => {
                const { nextDate, nextTime } = splitDateTime(value);
                set('date', nextDate);
                set('time', nextTime);
              }}
            />
            {data.tripType === 'round-trip' && (
              <DateTimeField
                label="Return Date & Time"
                date={data.returnDate || data.date}
                time={data.returnTime || '18:00'}
                minDate={data.date || minDate}
                onChange={(value) => {
                  const { nextDate, nextTime } = splitDateTime(value);
                  set('returnDate', nextDate);
                  set('returnTime', nextTime);
                }}
              />
            )}
          </div>
          <Button onClick={onContinue} className="h-11 self-end bg-amber-500 text-sm font-black text-slate-950 hover:bg-amber-400">Explore Cabs</Button>
        </div>
        {canAddStop && (
          <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-black text-slate-950">Stops on the way</div>
              <Button type="button" variant="outline" onClick={() => {
                set('stops', [...(data.stops || []), '']);
                set('stopCoordinates', [...(data.stopCoordinates || []), null]);
              }} className="h-9 rounded-md bg-white text-xs font-black"><Plus className="h-4 w-4" /> Add Stop</Button>
            </div>
            {(data.stops || []).map((stop, index) => (
              <div key={index} className="mt-3 flex gap-2">
                <LocationAutocomplete
                  label={`Stop ${index + 1}`}
                  value={stop}
                  onValueChange={(value) => updateStop(index, value)}
                  onSelect={(location) => selectStop(index, location)}
                  placeholder={`Stop ${index + 1} location`}
                  className="flex-1"
                />
                <button type="button" onClick={() => removeStop(index)} className="mt-6 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-red-200 bg-white text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
        {data.tripType === 'local' && <LocalPackageSelector data={data} set={set} />}
        {data.tripType !== 'local' && (
          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
            <RouteMap
              pickupCoordinates={data.pickupCoordinates}
              dropCoordinates={data.dropCoordinates}
              stopCoordinates={(data.stopCoordinates || []).filter(Boolean)}
              route={data.routeGeometry ? { distanceKm: data.distanceKm, durationMinutes: data.durationMinutes, geometry: data.routeGeometry } : null}
              className="min-h-[280px]"
            />
            <RouteSummary data={data} />
          </div>
        )}
      </div>
    </div>
  );
}

function CabSelection({ fleet, data, set, routeLabel, onCheckout }) {
  const selectedCab = fleet.find((cab) => cab.slug === data.vehicleSlug) || fleet[0] || null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
      {data.tripType === 'local' && <LocalPackageSelector data={data} set={set} fleet={fleet} className="mb-4" />}
      {!!fleet.length && (
        <CabOptionRail
          fleet={fleet}
          data={data}
          selectedSlug={selectedCab?.slug}
          onSelect={(slug) => {
            const cab = fleet.find((item) => item.slug === slug);
            const allowed = fuelOptions(cab);
            if (!allowed.includes(data.fuelType)) set('fuelType', allowed[0] || 'cng');
            set('vehicleSlug', slug);
          }}
        />
      )}
      <div className="mt-5 space-y-4">
        {!fleet.length && <div className="rounded-lg border border-slate-200 p-6 text-slate-600">No active cabs are available right now.</div>}
        {selectedCab && (
          <CabCard key={selectedCab.slug} cab={selectedCab} data={data} set={set} routeLabel={routeLabel} index={0} onCheckout={onCheckout} />
        )}
      </div>
      <div className="mt-5">
        <FeatureStrip />
      </div>
      {data.tripType !== 'local' && (
        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_360px]">
          <RouteMap
            pickupCoordinates={data.pickupCoordinates}
            dropCoordinates={data.dropCoordinates}
            stopCoordinates={(data.stopCoordinates || []).filter(Boolean)}
            route={data.routeGeometry ? { distanceKm: data.distanceKm, durationMinutes: data.durationMinutes, geometry: data.routeGeometry } : null}
            className="min-h-[240px] sm:min-h-[300px]"
          />
          <RouteSummary data={data} />
        </div>
      )}
    </div>
  );
}

function LocalPackageSelector({ data, set, fleet = [], className = '' }) {
  const selectedPackage = LOCAL_PACKAGES.find((item) => item.value === data.rental) || LOCAL_PACKAGES[1];

  return (
    <div className={`rounded-md border border-slate-200 bg-white p-2 shadow-sm ${className}`}>
      <div className="grid grid-cols-3 overflow-hidden rounded border border-slate-300 text-center text-xs font-black sm:text-sm">
        {LOCAL_PACKAGES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => set('rental', item.value)}
            className={`h-11 px-1 transition ${selectedPackage.id === item.id ? 'bg-sky-500 text-white' : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
            aria-pressed={selectedPackage.id === item.id}
          >
            {item.label}
          </button>
        ))}
      </div>
      {!!fleet.length && (
        <div className="mt-2 text-center text-xs font-semibold text-slate-500">
          Prices update from admin cab package rates or local per-km rate.
        </div>
      )}
    </div>
  );
}

function CabOptionRail({ fleet, data, selectedSlug, onSelect }) {
  return (
    <div className="mt-5 overflow-hidden border-b border-slate-100 bg-white">
      <div className="flex gap-4 overflow-x-auto px-1 pb-4 pt-1 [scrollbar-width:none] sm:gap-6">
        {fleet.map((cab) => {
          const fare = cabFare(cab, data);
          const active = cab.slug === selectedSlug;
          const allowedFuel = fuelOptions(cab);
          const fuel = allowedFuel.length > 1 ? 'CNG/DSL' : allowedFuel[0] === 'diesel' ? 'DSL' : 'CNG';
          const category = cab.category?.split(/[/|]/)[0]?.trim() || (cab.seats > 6 ? 'Traveller' : cab.seats > 4 ? 'SUV' : 'Sedan');

          return (
            <button
              key={cab.slug}
              type="button"
              onClick={() => onSelect(cab.slug)}
              className="group w-[104px] shrink-0 text-center sm:w-[132px]"
              aria-pressed={active}
            >
              <div className={`text-sm font-black leading-tight transition-colors ${active ? 'text-teal-700' : 'text-slate-500 group-hover:text-slate-800'}`}>
                {category}
              </div>
              <div className="relative mx-auto mt-2 h-[76px] w-[76px] sm:h-[92px] sm:w-[92px]">
                <span className={`absolute left-1/2 top-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-black text-white ${active ? 'bg-teal-700' : 'bg-slate-400'}`}>
                  {fuel}
                </span>
                <span className={`flex h-full w-full items-center justify-center rounded-full border-4 bg-white p-2 transition ${active ? 'border-teal-600 shadow-[0_0_0_4px_rgba(15,118,110,0.12)]' : 'border-slate-300 group-hover:border-teal-200'}`}>
                  <img src={cab.image} alt={cab.name} className="h-full w-full rounded-full object-contain" />
                </span>
              </div>
              <div className={`mt-2 text-sm font-black ${active ? 'text-teal-700' : 'text-slate-600'}`}>
                {money(fare.total)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FeatureStrip() {
  return (
    <div className="grid overflow-hidden rounded-md bg-slate-950 text-white shadow-sm sm:grid-cols-3">
      <StripItem icon="Rs" title="Book Now" text="at Zero Cost" />
      <StripItem icon={<ShieldCheck className="h-5 w-5 sm:h-8 sm:w-8" />} title="Free Cancellations" text="Upto 1 Hour" />
      <StripItem icon={<Headphones className="h-5 w-5 sm:h-8 sm:w-8" />} title="24x7 Customer" text="Support" />
    </div>
  );
}

function StripItem({ icon, title, text }) {
  return (
    <div className="flex items-center justify-center gap-3 border-b border-white/10 px-4 py-3 text-sm font-bold last:border-b-0 sm:border-b-0 sm:border-r sm:px-6 sm:py-5 sm:text-base sm:last:border-r-0">
      <div className="text-2xl font-black leading-none text-amber-300 sm:text-4xl">{icon}</div>
      <div>{title}<br /><span className="text-white/70">{text}</span></div>
    </div>
  );
}

function CabCard({ cab, data, set, index, onCheckout }) {
  const fare = cabFare(cab, data);
  const fuels = fuelOptions(cab);
  const activeFuel = fuels.includes(data.fuelType) ? data.fuelType : fuels[0];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-[minmax(0,0.95fr)_minmax(150px,1.15fr)] gap-2 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(280px,0.75fr)] sm:gap-5 sm:p-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center lg:gap-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-black text-slate-800 sm:text-2xl">{cab.name}</h3>
            <span className="rounded bg-slate-950 px-2 py-1 text-xs font-bold text-white">4.8 <Star className="inline h-3 w-3 fill-yellow-400 text-yellow-400" /></span>
          </div>
          <p className="mt-1 text-sm italic text-slate-600">or equivalent | {cab.seats} seater AC Cab</p>
          <div className="mt-3 text-sm font-bold text-emerald-600">5% OFF <span className="text-slate-400 line-through">{money(fare.oldPrice)}</span></div>
          <div className="mt-1 text-3xl font-black text-teal-700 sm:text-4xl">{money(fare.total)}</div>
          <div className="mt-1 text-sm text-black">+ {money(fare.gst)} Charges and Taxes</div>
          <div className="mt-4 grid gap-2 text-sm text-slate-800 sm:grid-cols-2">
            <span className="flex items-center gap-2"><User className="h-5 w-5 text-teal-600" /> Driver allowance included</span>
            <span className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-teal-600" /> {cab.luggage}</span>
            <span className="flex items-center gap-2"><Check className="h-5 w-5 text-emerald-500" /> {formatKm(fare.chargeableDistance || fare.distance)} included</span>
            <span className="flex items-center gap-2"><ArrowLeftRight className="h-5 w-5 text-teal-600" /> Post limit: Rs {cab.pricePerKm || 16}/km</span>
          </div>
          <div className="mt-4 text-sm font-bold text-black">Fuel Type</div>
          <div className="mt-2 flex gap-2 text-sm font-semibold text-black">
            {fuels.map((fuel) => (
              <label key={fuel} className={`flex h-9 items-center gap-2 rounded-md border px-3 ${activeFuel === fuel ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-slate-200 text-black'}`}>
                <input type="radio" checked={activeFuel === fuel} onChange={() => set('fuelType', fuel)} name={`fuel-${cab.slug}`} className="accent-amber-500" /> {fuelLabel(fuel)}
              </label>
            ))}
          </div>
          <details className="mt-4 text-sm text-teal-700">
            <summary className="cursor-pointer font-semibold">Inclusions and Exclusions</summary>
            <div className="mt-2 text-slate-600">Includes base fare, fuel, driver allowance and GST. Excludes extra pickups, parking and distance beyond package limit.</div>
          </details>
        </div>
        <div className="flex min-h-40 min-w-0 items-start justify-center overflow-visible sm:min-h-60 lg:min-h-72">
          <img src={cab.image} alt={cab.name} className="h-auto max-h-52 w-full max-w-[260px] object-contain sm:max-h-72 sm:max-w-[360px] lg:max-h-80 lg:max-w-[440px]" />
        </div>
      </div>
      <div className="px-4 pb-4 sm:px-5">
        <Button onClick={() => onCheckout(cab.slug)} className="h-12 w-full rounded bg-amber-500 px-6 text-sm font-black uppercase text-slate-950 hover:bg-amber-400">Select Car</Button>
      </div>
      <div className="bg-teal-50 px-5 py-3 text-sm font-bold text-slate-900">New Car Promise - Model that is 2023 or newer @ Rs 249</div>
    </motion.div>
  );
}

function Checkout({ data, set, routeLabel, vehicle, fare, selectedAddons, setSelectedAddons, payment, setPayment, paymentStarted, onBack, onSubmit, submitting }) {
  if (!vehicle || !fare) return null;

  const toggleAddon = (id) => {
    setSelectedAddons((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-5 px-3 py-5 lg:grid-cols-[1fr_420px] sm:px-8 sm:py-7">
      <div className="space-y-5">
        <button onClick={onBack} className="text-sm font-bold text-teal-700">Back to cabs</button>
        <Section title="Review Your Booking" tone="blue">
          <div className="text-lg font-black text-black sm:text-2xl">{routeLabel} <span className="text-sm font-normal text-black">({TRIP_LABELS[data.tripType]})</span></div>
          <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
            <div>Car Type: <b>{vehicle.name} or Equivalent</b></div>
            <div>Fuel Type: <b>{fuelLabel(data.fuelType)}</b></div>
            <div>Pickup: <b>{prettyDate(data.date)}, {data.time}</b></div>
            {data.tripType === 'round-trip' && <div>Return: <b>{prettyDate(data.returnDate)}, {data.returnTime || '-'}</b></div>}
            {!!data.stops?.length && <div className="sm:col-span-2">Stops: <b>{data.stops.filter(Boolean).join(' | ') || '-'}</b></div>}
            <div>Kms included: <b>{formatKm(fare.chargeableDistance || fare.distance)}</b></div>
            <div>Estimated time: <b>{formatDuration(fare.durationMinutes)}</b></div>
          </div>
        </Section>

        <FareSummary fare={fare} />

        <Section title="Contact & Pickup Details">
          <div className="grid gap-4 sm:grid-cols-[1fr_110px_1fr]">
            <Input value={data.name} onChange={(event) => set('name', event.target.value)} placeholder="Full Name" className="h-11 bg-slate-100 font-semibold text-black placeholder:text-black" />
            <select className="h-11 rounded-md border border-slate-200 bg-white px-3 font-semibold text-slate-950"><option>+91</option></select>
            <Input value={data.phone} onChange={(event) => set('phone', event.target.value)} placeholder="Mobile No." className="h-11 bg-slate-100 font-semibold text-black placeholder:text-black" />
            <Input value={data.email} onChange={(event) => set('email', event.target.value)} placeholder="Email ID" className="h-11 bg-slate-100 font-semibold text-black placeholder:text-black sm:col-span-3" />
            <Input value={data.address} onChange={(event) => set('address', event.target.value)} placeholder="Pickup Location" className="h-11 bg-slate-100 font-semibold text-black placeholder:text-black sm:col-span-3" />
            <Input value={data.dropAddress} onChange={(event) => set('dropAddress', event.target.value)} placeholder="Drop Location" className="h-11 bg-slate-100 font-semibold text-black placeholder:text-black sm:col-span-3" />
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
            ? 'border-teal-600 bg-teal-600 text-white'
            : 'border-teal-300'
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
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
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
            <List title="Exclusions" items={[`Beyond package km charged at Rs ${fare.vehicleRate || vehicle.pricePerKm || 16}/km after ${fare.chargeableDistance || fare.distance} km`, 'Multiple pickups/drops', 'Parking at actuals']} />
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
        <PaymentOption active={payment === 'zero'} onClick={() => setPayment('zero')} title="Pay after ride" subtitle="Book now and pay the driver after trip" price="Rs 0" />
        <PaymentOption active={payment === 'part'} onClick={() => setPayment('part')} title="Pay 25% amount" subtitle="Open UPI app and pay advance now" price={money(fare.partPay)} />
        <PaymentOption active={payment === 'full'} onClick={() => setPayment('full')} title="Pay full" subtitle="Open UPI app and pay full fare now" price={money(fare.total)} />
        {payment !== 'zero' && paymentStarted && (
          <div className="mt-4 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-bold text-teal-900">
            After completing UPI payment, tap confirm below.
          </div>
        )}
        <div className="mt-5 border-t border-slate-100 pt-5">
          <div className="text-black">Coupon & Offers</div>
          <div className="mt-3 flex gap-2"><Input placeholder="ENTER A COUPON" /><Button className="bg-teal-700 hover:bg-teal-800">APPLY</Button></div>
        </div>
        <Button onClick={onSubmit} disabled={submitting} className="mt-5 h-14 w-full rounded-lg bg-amber-500 text-lg font-black uppercase text-slate-950 hover:bg-amber-400">
          {submitting ? 'Proceeding...' : payment === 'zero' ? 'Confirm Booking' : paymentStarted ? 'I Have Paid, Confirm Booking' : 'Pay with UPI'}
        </Button>
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer font-bold text-teal-700">View Fare Break up</summary>
          <div className="mt-3 space-y-2 text-slate-700">
            <FareRow label="Actual Distance" valueText={formatKm(fare.actualDistance)} />
            <FareRow label="Minimum Distance Rule" valueText={formatKm(fare.minimumDistance)} />
            <FareRow label="Chargeable Distance" valueText={formatKm(fare.chargeableDistance || fare.distance)} />
            <FareRow label="Vehicle Rate" valueText={`Rs ${fare.vehicleRate || fare.ratePerKm}/KM`} />
            <FareRow label="Estimated Fare" value={fare.estimatedFare || fare.distanceFare} />
            {fare.fuelSurcharge > 0 && <FareRow label="Diesel fuel surcharge" value={fare.fuelSurcharge} />}
            <FareRow label="Add-ons" value={fare.addons} />
            <FareRow label="Total" value={fare.total} bold />
          </div>
        </details>
      </aside>
    </div>
  );
}

function RouteSummary({ data }) {
  const hasRoute = Number(data.distanceKm) > 0 && Number(data.durationMinutes) > 0;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-lg font-black text-slate-950">Route details</div>
      {hasRoute ? (
        <div className="mt-4 grid gap-3 text-sm text-slate-700">
          <div><b className="block text-2xl text-teal-700">{formatKm(data.distanceKm)}</b>Road distance</div>
          <div><b className="block text-2xl text-slate-950">{formatDuration(data.durationMinutes)}</b>Estimated travel time</div>
          <div className="rounded-md bg-teal-50 px-3 py-2 font-semibold text-teal-900">Fare updates automatically for each vehicle rate.</div>
        </div>
      ) : (
        <div className="mt-4 text-sm text-slate-500">Select pickup and drop suggestions to calculate exact road distance, duration and fare.</div>
      )}
    </div>
  );
}

function Section({ title, subtitle, tone, children }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className={`${tone === 'blue' ? 'bg-teal-700 text-white' : 'border-b border-slate-100 bg-white text-slate-950'} px-4 py-3 sm:px-5 sm:py-4`}>
        <h2 className="text-base font-black sm:text-xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-black">{subtitle}</p>}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function PaymentOption({ active, onClick, title, subtitle, price }) {
  return (
    <button
      onClick={onClick}
      className={`mt-4 flex w-full items-center justify-between rounded-lg border p-4 text-left ${
        active
          ? 'border-teal-300 bg-teal-50 ring-2 ring-teal-100'
          : 'border-slate-200 bg-white'
      }`}
    >
      <span className="flex items-center gap-4">
        <span
          className={`h-6 w-6 rounded-full border-2 ${
            active
              ? 'border-teal-600 bg-teal-600 ring-2 ring-teal-200'
              : 'border-teal-500'
          }`}
        />
        <span>
          <b className="text-base text-black sm:text-lg">{title}</b>
          <br />
          <span className="text-sm text-black">{subtitle}</span>
        </span>
      </span>

      <b className="text-lg text-black sm:text-xl">{price}</b>
    </button>
  );
}

function FareSummary({ fare }) {
  return (
    <Section title="Fare Summary">
      <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
        <SummaryValue label="Actual Distance" value={formatKm(fare.actualDistance)} />
        <SummaryValue label="Minimum Distance Rule" value={formatKm(fare.minimumDistance)} />
        <SummaryValue label="Chargeable Distance" value={formatKm(fare.chargeableDistance || fare.distance)} />
        <SummaryValue label="Vehicle Rate" value={`Rs ${fare.vehicleRate || fare.ratePerKm}/KM`} />
        <SummaryValue label="Estimated Fare" value={money(fare.estimatedFare || fare.distanceFare)} />
        <SummaryValue label="Trip Days" value={String(fare.tripDays || 1)} />
      </div>
      {fare.minimumApplied && (
        <div className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800">
          Minimum billing of 250 KM per day has been applied.
        </div>
      )}
    </Section>
  );
}

function SummaryValue({ label, value }) {
  return <div><span className="block text-xs font-black uppercase text-slate-500">{label}</span><b className="text-slate-950">{value}</b></div>;
}

function FareRow({ label, value, valueText, bold }) {
  return <div className={`flex justify-between gap-3 ${bold ? 'border-t border-slate-100 pt-2 font-black' : ''}`}><span>{label}</span><span>{valueText || money(value)}</span></div>;
}

function List({ title, items, good }) {
  return (
    <div>
      <div className={`mb-3 font-bold ${good ? 'text-emerald-600' : 'text-red-500'}`}>{title}</div>
      <div className="space-y-3">
        {items.map((item) => <div key={item} className="flex gap-3"><span className={good ? 'text-emerald-500' : 'text-red-500'}>{good ? '?' : 'x'}</span>{item}</div>)}
      </div>
    </div>
  );
}

function DateTimeField({ label, date, time, minDate, minTime, onChange }) {
  const min = minDate ? dateTimeValue(minDate, minTime || '00:00') : undefined;

  return (
    <label className="relative block rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <span className="mb-1 flex items-center gap-2 text-xs font-black uppercase text-slate-600">
        <Calendar className="h-4 w-4 text-teal-600" /> {label}
      </span>
      <span className="flex h-8 items-center justify-between gap-3 text-sm font-black text-slate-950">
        <span className="truncate">{prettyDate(date)} / {time || '07:00'}</span>
        <Clock className="h-4 w-4 shrink-0 text-teal-600" />
      </span>
      <input
        type="datetime-local"
        value={dateTimeValue(date, time)}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
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
      <div><Button onClick={onClose} className="mt-5 bg-amber-500 text-slate-950 hover:bg-amber-400">Close</Button></div>
    </div>
  );
}

'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeftRight, Briefcase, Calendar, Check, Clock, Copy, Headphones, Phone, Plus, ShieldCheck, Star, Trash2, User, X } from 'lucide-react';
import { toast } from 'sonner';
import LocationAutocomplete from '@/components/site/booking/LocationAutocomplete';
import RouteMap from '@/components/site/booking/RouteMap';
import FareCalculator from '@/components/site/booking/FareCalculator';
import { calculateTripFare } from '@/lib/fare-policy';
import { DEFAULT_PRICING_SETTINGS } from '@/lib/pricing-defaults';

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

const COUNTRY_CODES = [
  ['India', '+91'], ['United States', '+1'], ['Canada', '+1'], ['United Kingdom', '+44'], ['Australia', '+61'], ['United Arab Emirates', '+971'], ['Saudi Arabia', '+966'], ['Qatar', '+974'], ['Kuwait', '+965'], ['Oman', '+968'], ['Singapore', '+65'], ['Malaysia', '+60'], ['Thailand', '+66'], ['Indonesia', '+62'], ['Philippines', '+63'], ['Vietnam', '+84'], ['Sri Lanka', '+94'], ['Nepal', '+977'], ['Bangladesh', '+880'], ['Pakistan', '+92'], ['Bhutan', '+975'], ['Maldives', '+960'], ['China', '+86'], ['Japan', '+81'], ['South Korea', '+82'], ['Hong Kong', '+852'], ['Taiwan', '+886'], ['Germany', '+49'], ['France', '+33'], ['Italy', '+39'], ['Spain', '+34'], ['Portugal', '+351'], ['Netherlands', '+31'], ['Belgium', '+32'], ['Switzerland', '+41'], ['Austria', '+43'], ['Sweden', '+46'], ['Norway', '+47'], ['Denmark', '+45'], ['Finland', '+358'], ['Ireland', '+353'], ['Poland', '+48'], ['Czech Republic', '+420'], ['Greece', '+30'], ['Turkey', '+90'], ['Russia', '+7'], ['Ukraine', '+380'], ['South Africa', '+27'], ['Egypt', '+20'], ['Kenya', '+254'], ['Nigeria', '+234'], ['Morocco', '+212'], ['Brazil', '+55'], ['Argentina', '+54'], ['Mexico', '+52'], ['Chile', '+56'], ['Colombia', '+57'], ['Peru', '+51'], ['New Zealand', '+64'], ['Israel', '+972']
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

function cabFare(cab, data, selectedAddons = [], pricingSettings = DEFAULT_PRICING_SETTINGS) {
  const addonObjects = selectedAddons.map((id) => ADDONS.find((item) => item.id === id)).filter(Boolean);
  return calculateTripFare(cab, data, addonObjects, pricingSettings);
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
  const [bookingId, setBookingId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pricingSettings, setPricingSettings] = useState(DEFAULT_PRICING_SETTINGS);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch('/api/pricing-settings', { cache: 'no-store' })
      .then((response) => response.json())
      .then((result) => {
        if (!cancelled && result?.settings) setPricingSettings(result.settings);
      })
      .catch(() => setPricingSettings(DEFAULT_PRICING_SETTINGS));
    return () => {
      cancelled = true;
    };
  }, [open]);

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
      phoneCountry: '+91',
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
    return cabFare(vehicle, data, selectedAddons, pricingSettings);
  }, [vehicle, data, selectedAddons, pricingSettings]);

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

    const paymentAmount = payment === 'after' ? 0 : payment === 'full' ? fare.total : fare.partPay;
    if (payment !== 'after' && paymentAmount <= 0) {
      toast.error('Payment amount is not valid.');
      return;
    }

    setSubmitting(true);
    try {
      const fullPhone = `${data.phoneCountry || '+91'}${String(data.phone || '').replace(/\D/g, '')}`;
      const bookingPayload = {
        ...data,
        phone: fullPhone,
        vehicleName: vehicle.name,
        fare: { ...fare, selectedAddons, paymentOption: payment, advancePaid: paymentAmount }
      };

      if (payment === 'after') {
        const bookingResponse = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingPayload)
        });
        const bookingResult = await bookingResponse.json();
        if (!bookingResponse.ok) {
          toast.error(bookingResult.error || bookingResult.errors?.[0] || 'Unable to save booking');
          return;
        }

        setBookingId(bookingResult.booking.bookingId);
        toast.success('Booking received.', {
          description: `Reference ${bookingResult.booking.bookingId}. Pay after your ride.`
        });
        setView('confirmed');
        return;
      }

      const checkoutLoaded = await loadRazorpayCheckout();
      if (!checkoutLoaded || !window.Razorpay) {
        toast.error('Unable to load Razorpay checkout.');
        return;
      }

      const orderResponse = await fetch('/api/payments/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: paymentAmount,
          paymentOption: payment,
          receipt: `ttx_${Date.now()}`
        })
      });
      const orderResult = await orderResponse.json();
      if (!orderResponse.ok) {
        toast.error(orderResult.error || 'Unable to start Razorpay payment');
        return;
      }

      const razorpay = new window.Razorpay({
        key: orderResult.keyId,
        amount: orderResult.order.amount,
        currency: orderResult.order.currency,
        name: 'ToursTaxi',
        description: payment === 'full' ? 'Full cab booking payment' : 'Advance cab booking payment',
        order_id: orderResult.order.id,
        prefill: {
          name: data.name,
          email: data.email,
          contact: fullPhone
        },
        notes: {
          vehicle: vehicle.name,
          tripType: data.tripType
        },
        theme: {
          color: '#0f766e'
        },
        modal: {
          confirm_close: true,
          ondismiss: () => setSubmitting(false)
        },
        handler: async (paymentResponse) => {
          try {
            const verifyResponse = await fetch('/api/payments/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                payment: paymentResponse,
                booking: bookingPayload
              })
            });
            const verifyResult = await verifyResponse.json();
            if (!verifyResponse.ok) {
              toast.error(verifyResult.error || 'Payment verification failed.');
              return;
            }
            setBookingId(verifyResult.booking.bookingId);
            toast.success('Payment verified. Booking confirmed.', {
              description: `Reference ${verifyResult.booking.bookingId}. Our team will call shortly.`
            });
            setView('confirmed');
          } catch {
            toast.error('Payment completed, but verification could not be saved. Please contact support.');
          } finally {
            setSubmitting(false);
          }
        }
      });

      razorpay.on('payment.failed', (response) => {
        toast.error(response.error?.description || 'Razorpay payment failed.');
        setSubmitting(false);
      });

      razorpay.open();
    } catch {
      toast.error('Unable to connect to Razorpay payment server');
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
                pricingSettings={pricingSettings}
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
                setPayment={setPayment}
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

function loadRazorpayCheckout() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
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
  const swapPlaces = () => {
    const pickup = data.pickup || '';
    const drop = data.drop || '';
    const pickupCoordinates = data.pickupCoordinates || null;
    const dropCoordinates = data.dropCoordinates || null;
    set('pickup', drop);
    set('drop', pickup);
    set('pickupCoordinates', dropCoordinates);
    set('dropCoordinates', pickupCoordinates);
  };

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-8 sm:py-6">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_2fr_auto]">
          <LocationAutocomplete label={data.tripType === 'local' ? 'Pickup Location' : 'From'} value={data.pickup || ''} placeholder="Pickup location" onValueChange={(value) => set('pickup', value)} onSelect={(location) => onSelectLocation('pickup', location)} showCurrentLocation />
          <button
            type="button"
            onClick={swapPlaces}
            className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-teal-50 text-teal-700 shadow-sm ring-1 ring-teal-100 transition hover:bg-teal-100 hover:text-teal-800 lg:self-end"
            aria-label="Swap pickup and drop"
          >
            <ArrowLeftRight className="h-5 w-5" />
          </button>
          <LocationAutocomplete label={data.tripType === 'local' ? 'Drop Location' : 'To'} value={data.drop || ''} placeholder="Drop location" onValueChange={(value) => set('drop', value)} onSelect={(location) => onSelectLocation('drop', location)} />
          <div className="grid gap-3 rounded-lg bg-slate-50 p-3">
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

function CabSelection({ fleet, data, set, routeLabel, pricingSettings, onCheckout }) {
  const selectedCab = fleet.find((cab) => cab.slug === data.vehicleSlug) || fleet[0] || null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
      {data.tripType === 'local' && <LocalPackageSelector data={data} set={set} fleet={fleet} className="mb-4" />}
      {!!fleet.length && (
        <CabOptionRail
          fleet={fleet}
          data={data}
          pricingSettings={pricingSettings}
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
          <CabCard key={selectedCab.slug} cab={selectedCab} data={data} set={set} pricingSettings={pricingSettings} routeLabel={routeLabel} index={0} onCheckout={onCheckout} />
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

function CabOptionRail({ fleet, data, pricingSettings, selectedSlug, onSelect }) {
  return (
    <div className="mt-5 overflow-hidden border-b border-slate-100 bg-white">
      <div className="flex gap-4 overflow-x-auto px-1 pb-4 pt-1 [scrollbar-width:none] sm:gap-6">
        {fleet.map((cab) => {
          const fare = cabFare(cab, data, [], pricingSettings);
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

function CabCard({ cab, data, set, pricingSettings, index, onCheckout }) {
  const fare = cabFare(cab, data, [], pricingSettings);
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

function Checkout({ data, set, routeLabel, vehicle, fare, selectedAddons, setSelectedAddons, payment, setPayment, onBack, onSubmit, submitting }) {
  if (!vehicle || !fare) return null;
  const detailsComplete = Boolean(data.name?.trim() && data.phone?.trim() && data.address?.trim() && data.dropAddress?.trim());
  const advancePercent = Math.min(Math.max(Number(fare.pricingPolicy?.advancePercent ?? DEFAULT_PRICING_SETTINGS.advancePercent), 0), 100);

  const toggleAddon = (id) => {
    setSelectedAddons((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-3 px-3 py-3 text-sm sm:px-5 sm:py-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-3">
        <button onClick={onBack} className="text-xs font-black text-teal-700">Back to cabs</button>
        <Section title="Trip Details" tone="blue" compact>
          <div className="text-base font-black text-black sm:text-lg">{routeLabel} <span className="text-xs font-normal text-black">({TRIP_LABELS[data.tripType]})</span></div>
          <div className="mt-2 grid gap-1.5 text-xs text-slate-700 sm:grid-cols-2">
            <div>Car Type: <b>{vehicle.name} or Equivalent</b></div>
            <div>Fuel Type: <b>{fuelLabel(data.fuelType)}</b></div>
            <div>Pickup: <b>{prettyDate(data.date)}, {data.time}</b></div>
            {data.tripType === 'round-trip' && <div>Return: <b>{prettyDate(data.returnDate)}, {data.returnTime || '-'}</b></div>}
            {!!data.stops?.length && <div className="sm:col-span-2">Stops: <b>{data.stops.filter(Boolean).join(' | ') || '-'}</b></div>}
            <div>Kms included: <b>{formatKm(fare.chargeableDistance || fare.distance)}</b></div>
            <div>Estimated time: <b>{formatDuration(fare.durationMinutes)}</b></div>
          </div>
        </Section>

        <Section title="Contact & Pickup Details" compact>
          <div className="grid gap-2 sm:grid-cols-[1fr_76px_1fr]">
            <Input value={data.name} onChange={(event) => set('name', event.target.value)} placeholder="Full Name" className="h-9 bg-slate-100 text-sm font-semibold text-black placeholder:text-slate-500" />
            <select value={data.phoneCountry || '+91'} onChange={(event) => set('phoneCountry', event.target.value)} className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-950">
              {COUNTRY_CODES.map(([country, code]) => (
                <option key={`${country}-${code}`} value={code}>{country} {code}</option>
              ))}
            </select>
            <Input value={data.phone} onChange={(event) => set('phone', event.target.value)} placeholder="Mobile No." className="h-9 bg-slate-100 text-sm font-semibold text-black placeholder:text-slate-500" />
            <Input value={data.email} onChange={(event) => set('email', event.target.value)} placeholder="Email ID" className="h-9 bg-slate-100 text-sm font-semibold text-black placeholder:text-slate-500 sm:col-span-3" />
            <Input value={data.address} onChange={(event) => set('address', event.target.value)} placeholder="Pickup Location" className="h-9 bg-slate-100 text-sm font-semibold text-black placeholder:text-slate-500 sm:col-span-3" />
            <Input value={data.dropAddress} onChange={(event) => set('dropAddress', event.target.value)} placeholder="Drop Location" className="h-9 bg-slate-100 text-sm font-semibold text-black placeholder:text-slate-500 sm:col-span-3" />
            <Textarea value={data.notes} onChange={(event) => set('notes', event.target.value)} placeholder="Any notes for driver" className="min-h-16 bg-slate-100 text-sm sm:col-span-3" />
          </div>
        </Section>

        {!detailsComplete && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900">
            Fill name, mobile number, pickup and drop details to continue to payment.
          </div>
        )}

        {detailsComplete && (
          <>
            <FareSummary fare={fare} />

            <Section title="Add-ons" subtitle="Optional upgrades" compact>
              <div className="grid gap-2">
                {ADDONS.map((addon) => (
                  <button key={addon.id} onClick={() => toggleAddon(addon.id)} className="flex w-full items-center justify-between gap-3 rounded-md border border-slate-200 bg-white p-2.5 text-left text-xs shadow-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${selectedAddons.includes(addon.id) ? 'border-teal-600 bg-teal-600 text-white' : 'border-teal-300'}`}>
                        {selectedAddons.includes(addon.id) && <Check className="h-3.5 w-3.5" />}
                      </span>
                      <b className="min-w-0 text-black">{addon.label}</b>
                      {addon.tag && <span className="hidden rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 sm:inline">{addon.tag}</span>}
                    </span>
                    <b className="shrink-0 text-black">{addon.priceText || money(addon.price)}</b>
                  </button>
                ))}
              </div>
            </Section>
          </>
        )}
      </div>

      {detailsComplete && (
        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-3 shadow-lg lg:sticky lg:top-4">
          <div className="mb-3 rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-xs font-bold text-yellow-900">Free cancellation till 1 hr of departure</div>
          <h3 className="text-lg font-black text-black">Payment Options</h3>
          <PaymentOption active={payment === 'part'} onClick={() => setPayment('part')} title={`Pay ${advancePercent}% advance`} subtitle="Razorpay secure payment" price={money(fare.partPay)} />
          <PaymentOption active={payment === 'full'} onClick={() => setPayment('full')} title="Pay full fare" subtitle="Confirm with full payment" price={money(fare.total)} />
          <PaymentOption active={payment === 'after'} onClick={() => setPayment('after')} title="Pay after ride" subtitle="No online payment now" price={money(0)} />
          <div className="mt-3 rounded-md border border-teal-200 bg-teal-50 p-2 text-xs font-bold text-teal-900">{payment === 'after' ? 'Booking will be sent to admin without online payment.' : 'Confirmation appears only after Razorpay payment is verified.'}</div>
          <Button onClick={onSubmit} disabled={submitting} className="mt-3 h-11 w-full rounded-md bg-teal-700 text-sm font-black uppercase text-white hover:bg-teal-800">
            {submitting ? (payment === 'after' ? 'Saving booking...' : 'Opening Razorpay...') : payment === 'after' ? 'Book Now' : `Pay ${payment === 'full' ? money(fare.total) : money(fare.partPay)}`}
          </Button>
          <details className="mt-3 text-xs">
            <summary className="cursor-pointer font-bold text-teal-700">Fare break up</summary>
            <div className="mt-2 space-y-1.5 text-slate-700">
              <FareRow label="Actual Distance" valueText={formatKm(fare.actualDistance)} />
              <FareRow label="Minimum Distance Rule" valueText={formatKm(fare.minimumDistance)} />
              <FareRow label="Chargeable Distance" valueText={formatKm(fare.chargeableDistance || fare.distance)} />
              <FareRow label="Vehicle Rate" valueText={`Rs ${fare.vehicleRate || fare.ratePerKm}/KM`} />
              {!!fare.base && <FareRow label="Base Fare" value={fare.base} />}
              <FareRow label="Estimated Fare" value={fare.estimatedFare || fare.distanceFare} />
              {!!fare.driver && <FareRow label="Driver allowance" value={fare.driver} />}
              {fare.fuelSurcharge > 0 && <FareRow label="Diesel fuel surcharge" value={fare.fuelSurcharge} />}
              <FareRow label="Add-ons" value={fare.addons} />
              {!!fare.gst && <FareRow label="GST" value={fare.gst} />}
              <FareRow label="Total" value={fare.total} bold />
            </div>
          </details>
        </aside>
      )}
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

function Section({ title, subtitle, tone, compact = false, children }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className={`${tone === 'blue' ? 'bg-teal-700 text-white' : 'border-b border-slate-100 bg-white text-slate-950'} ${compact ? 'px-3 py-2.5' : 'px-4 py-3 sm:px-5 sm:py-4'}`}>
        <h2 className={`${compact ? 'text-sm sm:text-base' : 'text-base sm:text-xl'} font-black`}>{title}</h2>
        {subtitle && <p className={`${compact ? 'mt-0.5 text-xs' : 'mt-1 text-sm'} text-black`}>{subtitle}</p>}
      </div>
      <div className={compact ? 'p-3' : 'p-4 sm:p-5'}>{children}</div>
    </section>
  );
}

function PaymentOption({ active, onClick, title, subtitle, price }) {
  return (
    <button
      onClick={onClick}
      className={`mt-2.5 flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left ${
        active
          ? 'border-teal-300 bg-teal-50 ring-2 ring-teal-100'
          : 'border-slate-200 bg-white'
      }`}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span
          className={`h-5 w-5 shrink-0 rounded-full border-2 ${
            active
              ? 'border-teal-600 bg-teal-600 ring-2 ring-teal-200'
              : 'border-teal-500'
          }`}
        />
        <span className="min-w-0">
          <b className="text-sm text-black sm:text-base">{title}</b>
          <br />
          <span className="text-xs text-black">{subtitle}</span>
        </span>
      </span>

      <b className="shrink-0 text-base text-black">{price}</b>
    </button>
  );
}

function FareSummary({ fare }) {
  return (
    <Section title="Fare Summary" compact>
      <div className="grid gap-2 text-xs text-slate-700 sm:grid-cols-2">
        <SummaryValue label="Actual Distance" value={formatKm(fare.actualDistance)} />
        <SummaryValue label="Minimum Distance Rule" value={formatKm(fare.minimumDistance)} />
        <SummaryValue label="Chargeable Distance" value={formatKm(fare.chargeableDistance || fare.distance)} />
        <SummaryValue label="Vehicle Rate" value={`Rs ${fare.vehicleRate || fare.ratePerKm}/KM`} />
        <SummaryValue label="Base Fare" value={money(fare.base)} />
        <SummaryValue label="Estimated Fare" value={money(fare.estimatedFare || fare.distanceFare)} />
        <SummaryValue label="Trip Days" value={String(fare.tripDays || 1)} />
      </div>
      {fare.minimumApplied && (
        <div className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800">
          Minimum billing of {formatKm(fare.minimumDistance)} has been applied.
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

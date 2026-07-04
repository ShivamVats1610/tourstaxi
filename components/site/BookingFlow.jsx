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
import { airportServiceAllowed, serviceCityAllowed } from '@/lib/service-cities';

const TRIP_LABELS = {
  'one-way': 'One way',
  'round-trip': 'Round trip',
  local: 'Local',
  airport: 'Airport'
};

const ADDONS = [
  { id: 'carrier', label: 'Cab with Luggage Carrier', price: 149, tag: 'Most Popular' },
  { id: 'new-car', label: 'New Car Promise - Model that is 2023 or newer', price: 249 },
  { id: 'language', label: 'Chauffeurs who know your language', price: 149 }
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
  now.setHours(now.getHours() + 1);
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function defaultPickupDateTime() {
  const next = new Date();
  next.setHours(next.getHours() + 1);
  next.setMinutes(next.getMinutes() - next.getTimezoneOffset());
  return { date: next.toISOString().slice(0, 10), time: next.toISOString().slice(11, 16) };
}

function addHoursDateTime(date, time, hours) {
  const next = new Date(`${date || todayValue()}T${time || '07:00'}`);
  next.setHours(next.getHours() + hours);
  next.setMinutes(next.getMinutes() - next.getTimezoneOffset());
  return { date: next.toISOString().slice(0, 10), time: next.toISOString().slice(11, 16) };
}

function addMinutesDateTime(date, time, minutes) {
  const next = new Date(`${date || todayValue()}T${time || '07:00'}`);
  next.setMinutes(next.getMinutes() + Number(minutes || 0));
  next.setMinutes(next.getMinutes() - next.getTimezoneOffset());
  return { date: next.toISOString().slice(0, 10), time: next.toISOString().slice(11, 16) };
}

function compareDateTime(leftDate, leftTime, rightDate, rightTime) {
  return dateTimeValue(leftDate, leftTime).localeCompare(dateTimeValue(rightDate, rightTime));
}

function minimumReturnDateTime(data = {}) {
  const duration = Number(data.durationMinutes || 0);
  if (data.tripType === 'round-trip' && duration > 0) {
    return addMinutesDateTime(data.date, data.time, duration);
  }
  return { date: data.date || todayValue(), time: data.time || nextPickupTimeValue() };
}

function clampReturnDateTime(data = {}, returnDate, returnTime) {
  const minimum = minimumReturnDateTime(data);
  const nextDate = isBeforeDate(returnDate, minimum.date) ? minimum.date : returnDate;
  const nextTime = nextDate === minimum.date && compareDateTime(nextDate, returnTime, minimum.date, minimum.time) < 0
    ? minimum.time
    : returnTime;
  return { date: nextDate, time: nextTime };
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

function formatClock(value) {
  if (!value) return '-';
  const [hours, minutes = '00'] = String(value).split(':');
  const date = new Date();
  date.setHours(Number(hours) || 0, Number(minutes) || 0, 0, 0);
  return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function dateTimeValue(date, time) {
  return `${date || todayValue()}T${time || '07:00'}`;
}

function splitDateTime(value) {
  const [nextDate, nextTime = '07:00'] = String(value || '').split('T');
  return { nextDate, nextTime: nextTime.slice(0, 5) };
}

function isBeforeDate(value, minimum) {
  return Boolean(value && minimum && value < minimum);
}

function cabFare(cab, data, selectedAddons = [], pricingSettings = DEFAULT_PRICING_SETTINGS) {
  const addonObjects = selectedAddons.map((id) => {
    const addon = pricedAddon(ADDONS.find((item) => item.id === id), pricingSettings, data);
    return addon;
  }).filter(Boolean);
  return calculateTripFare(cab, data, addonObjects, pricingSettings);
}

function selectedAddonDetails(selectedAddons = [], pricingSettings = DEFAULT_PRICING_SETTINGS, data = {}) {
  return selectedAddons.map((id) => {
    const addon = pricedAddon(ADDONS.find((item) => item.id === id), pricingSettings, data);
    return addon;
  }).filter(Boolean);
}

function pricedAddon(addon, pricingSettings = DEFAULT_PRICING_SETTINGS, data = {}) {
  if (!addon) return null;
  if (addon.id === 'carrier') return { ...addon, price: pricingSettings.carrierAddonPrice ?? addon.price };
  if (addon.id === 'new-car') return { ...addon, price: pricingSettings.newCarAddonPrice ?? addon.price };
  if (addon.id === 'language') {
    const language = String(data.languagePreference || '').toLowerCase();
    const price = language === 'english' ? pricingSettings.languageAddonPrice ?? addon.price : 0;
    return { ...addon, label: language === 'english' ? 'English chauffeur language' : 'Hindi chauffeur language', price };
  }
  return addon;
}

function holidayDates(settings = DEFAULT_PRICING_SETTINGS) {
  return (Array.isArray(settings.holidays) ? settings.holidays : [])
    .flatMap((item) => String(item || '').match(/\d{4}-\d{2}-\d{2}/g) || [])
    .filter(Boolean);
}

function holidayConflict(data = {}, settings = DEFAULT_PRICING_SETTINGS) {
  const holidays = holidayDates(settings);
  if (!holidays.length) return null;
  const dates = data.tripType === 'round-trip' ? dateRange(data.date, data.returnDate || data.date) : [data.date];
  const blocked = dates.find((date) => holidays.includes(date));
  return blocked || null;
}

function dateRange(start, end) {
  if (!start) return [];
  const dates = [];
  const current = new Date(`${start}T00:00:00`);
  const last = new Date(`${end || start}T00:00:00`);
  if (Number.isNaN(current.getTime()) || Number.isNaN(last.getTime())) return [start];
  while (current <= last) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function fuelOptions(cab) {
  const options = Array.isArray(cab?.fuelOptions) && cab.fuelOptions.length ? cab.fuelOptions : ['cng', 'petrol', 'diesel'];
  return [...new Set(options.map((item) => String(item).toLowerCase()).filter((item) => ['cng', 'diesel', 'petrol'].includes(item)))];
}

function fuelLabel(value) {
  if (value === 'diesel') return 'Diesel';
  if (value === 'petrol') return 'Petrol';
  return 'CNG';
}

function validCustomerName(value) {
  const parts = String(value || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return false;
  return parts.every((part) => /^[A-Za-z][A-Za-z.'-]{1,}$/.test(part) && !/(.)\1{2,}/i.test(part));
}

function validCustomerPhone(phone, country = '+91') {
  const digits = String(phone || '').replace(/\D/g, '');
  if (/^(\d)\1+$/.test(digits)) return false;
  if (/^(\d{2,5})\1+$/.test(digits)) return false;
  if (country === '+91') return /^[6-9]\d{9}$/.test(digits);
  return digits.length >= 7 && digits.length <= 15;
}

function validCustomerEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return false;
  const [local, domain = ''] = email.split('@');
  if (local.length < 5 || /^x+$/i.test(local) || /(.)\1{3,}/i.test(local)) return false;
  return domain.includes('.') && !domain.startsWith('.') && !domain.endsWith('.');
}

async function readJsonResponse(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {
      success: false,
      error: response.ok ? 'Unexpected server response.' : 'Server returned an error page. Please refresh and try again.',
    };
  }
}

function serviceUnavailableReason(data = {}, settings = {}) {
  if (settings.dutyEnabled === false) {
    return 'Service is not available right now. Please try again when duty is on.';
  }
  if (data.tripType === 'one-way' && settings.oneWayEnabled === false) {
    return 'One way service is not available right now. Please choose another trip type.';
  }
  const pickup = localDateTime(data.date, data.time);
  const start = localDateTime(settings.dutyOffStart);
  const end = localDateTime(settings.dutyOffEnd);
  if (pickup && start && end && end > start && pickup >= start && pickup <= end) {
    return 'Service is unavailable for the selected date and time.';
  }
  return '';
}

function localDateTime(date, time = '') {
  const value = time ? `${String(date || '').slice(0, 10)}T${time}` : String(date || '');
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
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

    const defaults = defaultPickupDateTime();
    const minDate = defaults.date;
    const minTime = defaults.time;
    const prefillDate = prefill.date || defaults.date;
    const prefillTime = prefill.time || defaults.time;
    const pickupTime = prefillDate === minDate && prefillTime < minTime ? minTime : prefillTime;
    const defaultReturn = addHoursDateTime(prefillDate, pickupTime, 4);
    const prefillReturnDate = prefill.returnDate || (prefill.tripType === 'round-trip' ? defaultReturn.date : '');
    const prefillReturnTime = prefill.tripType === 'round-trip' && prefillReturnDate === prefillDate && (prefill.returnTime || defaultReturn.time) < pickupTime
      ? pickupTime
      : prefill.returnTime || defaultReturn.time;

    // Reset the modal to the latest booking request whenever it opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setView(prefill.startStep >= 2 ? 'cars' : 'details');
    setData({
      tripType: prefill.tripType || 'one-way',
      pickup: prefill.pickup || '',
      drop: prefill.drop || '',
      date: prefillDate,
      time: pickupTime,
      returnDate: prefillReturnDate,
      returnTime: prefillReturnTime,
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
      languagePreference: '',
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
      routeGeometry: route?.geometry || null,
      ...(current.tripType === 'round-trip' && route?.durationMinutes
        ? (() => {
            const nextData = { ...current, durationMinutes: route.durationMinutes };
            const returnDateTime = clampReturnDateTime(nextData, current.returnDate || current.date, current.returnTime || current.time);
            return { returnDate: returnDateTime.date, returnTime: returnDateTime.time };
          })()
        : {})
    }));
  }, []);

  const routeLabel = data.tripType === 'local'
    ? `${data.pickup || 'Pickup'} - ${data.drop || 'Drop'}`
    : `${data.pickup || 'Pickup'} - ${data.drop || 'Drop'}`;

  const submit = async () => {
    const blockedHoliday = holidayConflict(data, pricingSettings);
    if (blockedHoliday) {
      toast.error(`Bookings are not available on holiday ${prettyDate(blockedHoliday)}.`);
      return;
    }
    if (!data.name || !data.phone || !data.address || !vehicle || !fare) {
      toast.error('Please add name, phone and pickup location.');
      return;
    }
    if (!validCustomerName(data.name)) {
      toast.error('Please enter your real first and last name.');
      return;
    }
    if (!validCustomerPhone(data.phone, data.phoneCountry)) {
      toast.error(data.phoneCountry === '+91' ? 'Please enter a valid 10 digit Indian mobile number.' : 'Please enter a valid mobile number.');
      return;
    }
    if (!validCustomerEmail(data.email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    const paymentAmount = payment === 'full' ? fare.total : fare.partPay;
    if (paymentAmount <= 0) {
      toast.error('Payment amount is not valid.');
      return;
    }

    setSubmitting(true);
    try {
      const fullPhone = `${data.phoneCountry || '+91'}${String(data.phone || '').replace(/\D/g, '')}`;
      const addonDetails = selectedAddonDetails(selectedAddons, pricingSettings, data);
      const bookingPayload = {
        ...data,
        phone: fullPhone,
        vehicleName: vehicle.name,
        selectedOptions: {
          fuelType: data.fuelType,
          languagePreference: data.languagePreference,
          addons: addonDetails,
          stops: data.stops || [],
          cabWithLuggageCarrier: selectedAddons.includes('carrier'),
          newCarPromise: selectedAddons.includes('new-car')
        },
        fare: { ...fare, selectedAddons: addonDetails, paymentOption: payment, advancePaid: paymentAmount }
      };

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
      toast.success('Booking saved. Continue to UPI payment.', {
        description: `Reference ${bookingResult.booking.bookingId}.`
      });
      window.location.href = `/payment/${bookingResult.booking.bookingId}`;
    } catch {
      toast.error('Unable to save booking for UPI payment');
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
            {view === 'details' && (
              <DetailsPanel data={data} set={set} pricingSettings={pricingSettings} onSelectLocation={selectLocation} onContinue={() => {
                const unavailableReason = serviceUnavailableReason(data, pricingSettings);
                if (unavailableReason) {
                  toast.error(unavailableReason);
                  return;
                }
                if (!data.pickup?.trim() || (data.tripType !== 'local' && !data.drop?.trim())) {
                  toast.error(data.tripType === 'local' ? 'Please enter pickup location.' : 'Please enter pickup location and drop location.');
                  return;
                }
                const blockedHoliday = holidayConflict(data, pricingSettings);
                if (blockedHoliday) {
                  toast.error(`Bookings are not available on holiday ${prettyDate(blockedHoliday)}.`);
                  return;
                }
                if (data.tripType === 'round-trip') {
                  const safeReturn = clampReturnDateTime(data, data.returnDate || data.date, data.returnTime || data.time);
                  if (safeReturn.date !== data.returnDate || safeReturn.time !== data.returnTime) {
                    setData((current) => ({ ...current, returnDate: safeReturn.date, returnTime: safeReturn.time }));
                    toast.error('Return time cannot be before the estimated arrival time.');
                    return;
                  }
                }
                if (!serviceCityAllowed(data.pickup, pricingSettings)) {
                  toast.error('Pickup city is not service available.');
                  return;
                }
                if (data.tripType === 'airport' && !airportServiceAllowed(data.pickup, pricingSettings) && !airportServiceAllowed(data.drop, pricingSettings)) {
                  toast.error('Selected airport is not service available.');
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
                setSelectedAddons={setSelectedAddons}
                onModify={() => setView('details')}
                onCheckout={(slug) => {
                  const cab = fleet.find((item) => item.slug === slug);
                  const allowed = fuelOptions(cab);
                  setData((current) => ({
                    ...current,
                    vehicleSlug: slug,
                    passengers: `${Number(cab?.seats || 4)} Passengers`,
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
                pricingSettings={pricingSettings}
                payment={payment}
                selectedAddons={selectedAddons}
                setSelectedAddons={setSelectedAddons}
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
              stopCoordinates={data.tripType === 'local' ? [] : (data.stopCoordinates || []).filter(Boolean)}
              pickupLabel={data.pickup || ''}
              dropLabel={data.tripType === 'local' ? '' : data.drop || ''}
              stopLabels={data.tripType === 'local' ? [] : (data.stops || []).filter(Boolean)}
              onRouteChange={handleRouteChange}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
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

function DetailsPanel({ data, set, pricingSettings, onSelectLocation, onContinue }) {
  const minDate = todayValue();
  const minTime = data.date === minDate ? nextPickupTimeValue() : undefined;
  const minimumReturn = minimumReturnDateTime(data);
  const minReturnTime = (data.returnDate || data.date) === minimumReturn.date ? minimumReturn.time : undefined;
  const canAddStop = ['one-way', 'round-trip', 'airport'].includes(data.tripType);
  const blockedHoliday = holidayConflict(data, pricingSettings);
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
          {data.tripType !== 'local' && (
            <>
              <button
                type="button"
                onClick={swapPlaces}
                className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-teal-50 text-teal-700 shadow-sm ring-1 ring-teal-100 transition hover:bg-teal-100 hover:text-teal-800 lg:self-end"
                aria-label="Swap pickup and drop"
              >
                <ArrowLeftRight className="h-5 w-5" />
              </button>
              <LocationAutocomplete label="To" value={data.drop || ''} placeholder="Drop location" onValueChange={(value) => set('drop', value)} onSelect={(location) => onSelectLocation('drop', location)} />
            </>
          )}
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
                if (data.tripType === 'round-trip' && isBeforeDate(data.returnDate, nextDate)) {
                  set('returnDate', nextDate);
                }
                if (data.tripType === 'round-trip') {
                  const defaultReturn = data.durationMinutes
                    ? addMinutesDateTime(nextDate, nextTime, data.durationMinutes)
                    : addHoursDateTime(nextDate, nextTime, 4);
                  set('returnDate', defaultReturn.date);
                  set('returnTime', defaultReturn.time);
                }
              }}
            />
            {data.tripType === 'round-trip' && (
              <DateTimeField
                label="Return Date & Time"
                date={data.returnDate || data.date}
                time={data.returnTime || '18:00'}
                minDate={minimumReturn.date || data.date || minDate}
                minTime={minReturnTime}
                onChange={(value) => {
                  const { nextDate, nextTime } = splitDateTime(value);
                  const safeReturn = clampReturnDateTime(data, nextDate, nextTime);
                  set('returnDate', safeReturn.date);
                  set('returnTime', safeReturn.time);
                }}
              />
            )}
            {blockedHoliday && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                Booking closed on holiday {prettyDate(blockedHoliday)}. Please choose another date.
              </div>
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

function CabSelection({ fleet, data, set, routeLabel, pricingSettings, setSelectedAddons, onModify, onCheckout }) {
  const selectedCab = fleet.find((cab) => cab.slug === data.vehicleSlug) || fleet[0] || null;
  const unavailableReason = serviceUnavailableReason(data, pricingSettings);

  if (unavailableReason) {
    return (
      <div className="mx-auto max-w-3xl px-3 py-8 text-center sm:px-8">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <div className="text-lg font-black text-amber-900">Service is not available right now.</div>
          <p className="mt-2 text-sm font-semibold text-amber-800">{unavailableReason}</p>
          <Button type="button" onClick={onModify} className="mt-4 bg-amber-500 text-slate-950 hover:bg-amber-400">Modify Booking</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-3 pb-3 pt-1 sm:px-8 sm:pb-6 sm:pt-3">
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
            setSelectedAddons([]);
            set('fuelType', allowed[0] || 'cng');
            set('languagePreference', '');
            set('vehicleSlug', slug);
            set('passengers', `${Number(cab?.seats || 4)} Passengers`);
          }}
        />
      )}
      <div className="mt-3 space-y-3 sm:mt-5 sm:space-y-4">
        {!fleet.length && <div className="rounded-lg border border-slate-200 p-6 text-slate-600">No active cabs are available right now.</div>}
        {selectedCab && (
          <CabCard key={selectedCab.slug} cab={selectedCab} data={data} set={set} pricingSettings={pricingSettings} routeLabel={routeLabel} index={0} onModify={onModify} onCheckout={onCheckout} />
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
    <div className="overflow-hidden border-b border-slate-100 bg-white">
      <div className="flex gap-4 overflow-x-auto px-1 pb-2 pt-1 [scrollbar-width:none] sm:gap-6 sm:pb-4">
        {fleet.map((cab) => {
          const fare = cabFare(cab, data, [], pricingSettings);
          const active = cab.slug === selectedSlug;
          const allowedFuel = fuelOptions(cab);
          const fuel = allowedFuel.map((item) => fuelLabel(item).slice(0, 3).toUpperCase()).join('/') || 'CNG';
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

function CabCard({ cab, data, set, pricingSettings, index, onModify, onCheckout }) {
  const fare = cabFare(cab, data, [], pricingSettings);
  const fuels = fuelOptions(cab);
  const activeFuel = fuels.includes(data.fuelType) ? data.fuelType : fuels[0];
  const visibleStops = (data.stops || []).filter(Boolean);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-[minmax(0,1fr)_132px] gap-2 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(280px,0.75fr)] sm:gap-5 sm:p-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center lg:gap-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-black leading-tight text-slate-800 sm:text-2xl">{cab.name}</h3>
            <span className="rounded bg-slate-950 px-1.5 py-0.5 text-[11px] font-bold text-white sm:px-2 sm:py-1 sm:text-xs">4.8 <Star className="inline h-3 w-3 fill-yellow-400 text-yellow-400" /></span>
          </div>
          <p className="mt-0.5 text-xs italic leading-snug text-slate-600 sm:text-sm">or equivalent | {cab.seats} seater AC Cab</p>
          <div className="mt-2 text-xs font-bold text-emerald-600 sm:mt-3 sm:text-sm">5% OFF <span className="text-slate-400 line-through">{money(fare.oldPrice)}</span></div>
          <div className="mt-0.5 whitespace-nowrap text-3xl font-black leading-none text-teal-700 sm:mt-1 sm:text-4xl">{money(fare.total)}</div>
          <div className="mt-1 whitespace-nowrap text-xs text-black sm:text-sm">+ {money(fare.gst)} Charges and Taxes</div>
          <div className="mt-3 grid gap-1.5 text-xs text-slate-800 sm:mt-4 sm:grid-cols-2 sm:gap-2 sm:text-sm">
            <span className="flex min-w-0 items-center gap-1.5"><User className="h-4 w-4 shrink-0 text-teal-600 sm:h-5 sm:w-5" /> <span className="truncate">Driver allowance included</span></span>
            <span className="flex min-w-0 items-center gap-1.5"><Briefcase className="h-4 w-4 shrink-0 text-teal-600 sm:h-5 sm:w-5" /> <span className="truncate">{cab.luggage}</span></span>
            <span className="flex min-w-0 items-center gap-1.5"><Check className="h-4 w-4 shrink-0 text-emerald-500 sm:h-5 sm:w-5" /> <span className="truncate">{formatKm(fare.chargeableDistance || fare.distance)} included</span></span>
            <span className="flex min-w-0 items-center gap-1.5"><ArrowLeftRight className="h-4 w-4 shrink-0 text-teal-600 sm:h-5 sm:w-5" /> <span className="truncate">Post limit: Rs {fare.vehicleRate || cab.pricePerKm || 16}/km</span></span>
          </div>
        </div>
        <div className="min-w-0">
          <div className="flex min-h-24 items-start justify-center overflow-visible sm:min-h-60 lg:min-h-72">
            <img src={cab.image} alt={cab.name} className="h-auto max-h-28 w-full max-w-[132px] object-contain sm:max-h-72 sm:max-w-[360px] lg:max-h-80 lg:max-w-[440px]" />
          </div>
        </div>
        <div className="col-span-2 grid grid-cols-[minmax(0,1fr)_132px] gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(280px,0.75fr)] sm:gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-6">
          <div className="rounded-md border border-dashed border-teal-200 bg-teal-50/70 p-3 text-xs text-slate-800 sm:text-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="font-black text-slate-950">Modify Trip</div>
              <Button type="button" variant="outline" onClick={onModify} className="h-8 shrink-0 rounded-md bg-white px-3 text-xs font-black text-teal-700">
                Edit
              </Button>
            </div>
            <div className="mt-2 grid gap-1.5 font-semibold">
              <div className="truncate">Pickup: {data.pickup || '-'}</div>
              {data.tripType !== 'local' && <div className="truncate">Drop: {data.drop || '-'}</div>}
              {!!visibleStops.length && <div className="truncate">Stops: {visibleStops.join(' | ')}</div>}
              <div>{prettyDate(data.date)} at {formatClock(data.time)}</div>
            </div>
          </div>
          <div className="rounded-md border border-slate-100 bg-white/80 p-2.5 sm:p-3">
            <div className="text-xs font-bold text-black sm:text-sm">Fuel Type</div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-black sm:text-sm">
              {fuels.map((fuel) => (
                <label key={fuel} className={`flex h-8 items-center gap-1.5 rounded-md border px-2.5 sm:h-9 sm:gap-2 sm:px-3 ${activeFuel === fuel ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-slate-200 text-black'}`}>
                  <input type="radio" checked={activeFuel === fuel} onChange={() => set('fuelType', fuel)} name={`fuel-${cab.slug}`} className="accent-amber-500" /> {fuelLabel(fuel)}
                </label>
              ))}
            </div>
            <details className="mt-2 text-xs text-teal-700 sm:mt-3 sm:text-sm">
              <summary className="cursor-pointer font-semibold">Inclusions and Exclusions</summary>
              <div className="mt-2 text-slate-600">Includes base fare, fuel, driver allowance and GST. Excludes extra pickups, parking and distance beyond package limit.</div>
            </details>
          </div>
        </div>
      </div>
      <div className="px-3 pb-3 sm:px-5 sm:pb-4">
        <Button onClick={() => onCheckout(cab.slug)} className="h-10 w-full rounded bg-amber-500 px-6 text-xs font-black uppercase text-slate-950 hover:bg-amber-400 sm:h-12 sm:text-sm">Select Car</Button>
      </div>
      <div className="bg-teal-50 px-5 py-3 text-sm font-bold text-slate-900">New Car Promise - Model that is 2023 or newer @ Rs 249</div>
    </motion.div>
  );
}

function Checkout({ data, set, routeLabel, vehicle, fare, pricingSettings, payment, setPayment, selectedAddons, setSelectedAddons, onBack, onSubmit, submitting }) {
  const isLocalTrip = data.tripType === 'local';
  const otpPhone = `${data.phoneCountry || '+91'}${String(data.phone || '').replace(/\D/g, '')}`;
  const [otp, setOtp] = useState('');
  const [otpSentPhone, setOtpSentPhone] = useState('');
  const [otpVerifiedPhone, setOtpVerifiedPhone] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const otpSent = otpSentPhone === otpPhone;
  const otpVerified = otpVerifiedPhone === otpPhone;
  const detailsComplete = Boolean(
    validCustomerName(data.name) &&
    validCustomerPhone(data.phone, data.phoneCountry) &&
    validCustomerEmail(data.email) &&
    data.address?.trim() &&
    (isLocalTrip || data.dropAddress?.trim())
  );
  const blockedHoliday = holidayConflict(data, pricingSettings);
  const canPay = detailsComplete && otpVerified && !blockedHoliday;

  if (!vehicle || !fare) return null;
  const toggleAddon = (id) => {
    setSelectedAddons((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };
  const sendOtp = async () => {
    if (!validCustomerPhone(data.phone, data.phoneCountry)) {
      toast.error(data.phoneCountry === '+91' ? 'Please enter a valid 10 digit Indian mobile number.' : 'Please enter a valid mobile number.');
      return;
    }
    setSendingOtp(true);
    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: otpPhone }),
      });
      const result = await readJsonResponse(response);
      if (!response.ok || !result.success) throw new Error(result.error || 'Unable to send OTP.');
      setOtp('');
      setOtpSentPhone(otpPhone);
      setOtpVerifiedPhone('');
      toast.success('OTP sent to mobile number.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSendingOtp(false);
    }
  };
  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      toast.error('Please enter the 6 digit OTP.');
      return;
    }
    setVerifyingOtp(true);
    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: otpPhone, otp }),
      });
      const result = await readJsonResponse(response);
      if (!response.ok || !result.success) throw new Error(result.error || 'Invalid OTP.');
      setOtpVerifiedPhone(otpPhone);
      toast.success('Mobile number verified.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-3 pb-28 pt-3 text-sm sm:px-5 sm:pb-4 sm:pt-4">
      <div className="space-y-3">
        <>
            <button onClick={onBack} className="text-xs font-black text-teal-700">Back to cabs</button>
            <Section title="Trip Details" tone="blue" compact>
              <div className="text-base font-black text-black sm:text-lg">{routeLabel} <span className="text-xs font-normal text-black">({TRIP_LABELS[data.tripType]})</span></div>
              <div className="mt-2 grid gap-1.5 text-xs text-slate-700 sm:grid-cols-2">
                <div>Car Type: <b>{vehicle.name} or Equivalent</b></div>
                <div>Fuel Type: <b>{fuelLabel(data.fuelType)}</b></div>
                <div>Pickup: <b>{prettyDate(data.date)}, {formatClock(data.time)}</b></div>
                {data.tripType === 'round-trip' && <div>Return: <b>{prettyDate(data.returnDate)}, {formatClock(data.returnTime)}</b></div>}
                <div>Passengers: <b>{data.passengers || `${vehicle.seats || 4} Passengers`}</b></div>
                {!!data.stops?.length && <div className="sm:col-span-2">Stops: <b>{data.stops.filter(Boolean).join(' | ') || '-'}</b></div>}
                <div>Kms included: <b>{formatKm(fare.chargeableDistance || fare.distance)}</b></div>
                <div>Estimated time: <b>{formatDuration(fare.durationMinutes)}</b></div>
              </div>
            </Section>

            <Section title="Contact & Pickup Details" compact>
              <div className="grid gap-2 sm:grid-cols-[1fr_76px_1fr]">
                <Input value={data.name} onChange={(event) => set('name', event.target.value)} placeholder="First and Last Name" className="h-9 bg-slate-100 text-sm font-semibold text-black placeholder:text-slate-500" />
                <select value={data.phoneCountry || '+91'} onChange={(event) => set('phoneCountry', event.target.value)} className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-950">
                  {COUNTRY_CODES.map(([country, code]) => (
                    <option key={`${country}-${code}`} value={code}>{country} {code}</option>
                  ))}
                </select>
                <Input value={data.phone} onChange={(event) => set('phone', event.target.value)} placeholder="Mobile No." className="h-9 bg-slate-100 text-sm font-semibold text-black placeholder:text-slate-500" />
                <div className="grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-2 sm:col-span-3 sm:grid-cols-[1fr_auto_auto]">
                  <Input value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter OTP" disabled={!otpSent || otpVerified} className="h-9 bg-white text-sm font-semibold text-black placeholder:text-slate-500" />
                  <Button type="button" variant="outline" onClick={sendOtp} disabled={sendingOtp || otpVerified || !validCustomerPhone(data.phone, data.phoneCountry)} className="h-9 rounded-md bg-white px-3 text-xs font-black">
                    {sendingOtp ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
                  </Button>
                  <Button type="button" onClick={verifyOtp} disabled={verifyingOtp || !otpSent || otpVerified || otp.length !== 6} className="h-9 rounded-md bg-teal-700 px-3 text-xs font-black text-white hover:bg-teal-800">
                    {otpVerified ? 'Verified' : verifyingOtp ? 'Checking...' : 'Verify'}
                  </Button>
                  <div className={`text-[11px] font-bold sm:col-span-3 ${otpVerified ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {otpVerified ? 'Mobile number verified.' : 'Verify mobile number before payment.'}
                  </div>
                </div>
                <Input value={data.email} onChange={(event) => set('email', event.target.value)} placeholder="Email ID" className="h-9 bg-slate-100 text-sm font-semibold text-black placeholder:text-slate-500 sm:col-span-3" />
                <Input value={data.address} onChange={(event) => set('address', event.target.value)} placeholder="Pickup Location" className="h-9 bg-slate-100 text-sm font-semibold text-black placeholder:text-slate-500 sm:col-span-3" />
                {!isLocalTrip && <Input value={data.dropAddress} onChange={(event) => set('dropAddress', event.target.value)} placeholder="Drop Location" className="h-9 bg-slate-100 text-sm font-semibold text-black placeholder:text-slate-500 sm:col-span-3" />}
                <Textarea value={data.notes} onChange={(event) => set('notes', event.target.value)} placeholder="Any notes for driver" className="min-h-16 bg-slate-100 text-sm sm:col-span-3" />
              </div>
            </Section>

            {!detailsComplete && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900">
                Fill real first and last name, valid mobile number, valid email, {isLocalTrip ? 'and pickup details' : 'pickup and drop details'} to continue to payment.
              </div>
            )}
            {detailsComplete && !otpVerified && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900">
                Verify mobile number with OTP to continue to payment.
              </div>
            )}
            {blockedHoliday && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                Booking closed on holiday {prettyDate(blockedHoliday)}. Please choose another date.
              </div>
            )}

            <Section title="Personalize Your Journey" subtitle="Enhance your travel experience with our premium add-ons" compact>
              <div className="grid gap-2">
                {ADDONS.map((baseAddon) => {
                  const addon = pricedAddon(baseAddon, pricingSettings, data);
                  const selected = selectedAddons.includes(addon.id);
                  if (addon.id === 'language') {
                    return (
                      <div key={addon.id} className="rounded-md border border-slate-200 bg-white p-2.5 text-xs shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <button type="button" onClick={() => toggleAddon(addon.id)} className="flex min-w-0 items-center gap-2 text-left">
                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${selected ? 'border-teal-600 bg-teal-600 text-white' : 'border-teal-300'}`}>
                              {selected && <Check className="h-3.5 w-3.5" />}
                            </span>
                            <b className="min-w-0 text-black">{addon.label}</b>
                          </button>
                          <div className="flex gap-2">
                            {['Hindi', 'English'].map((language) => {
                              const languagePrice = language === 'English' ? pricingSettings.languageAddonPrice ?? ADDONS.find((item) => item.id === 'language')?.price ?? 0 : 0;
                              return (
                              <button
                                key={language}
                                type="button"
                                onClick={() => {
                                  if (!selected) toggleAddon(addon.id);
                                  set('languagePreference', language);
                                }}
                                className={`h-8 rounded-md border px-3 font-black ${data.languagePreference === language ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-slate-200 bg-white text-slate-700'}`}
                              >
                                {language} <span className="ml-1 text-[10px]">{languagePrice ? money(languagePrice) : 'Free'}</span>
                              </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <button key={addon.id} onClick={() => toggleAddon(addon.id)} className="flex w-full items-center justify-between gap-3 rounded-md border border-slate-200 bg-white p-2.5 text-left text-xs shadow-sm">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${selected ? 'border-teal-600 bg-teal-600 text-white' : 'border-teal-300'}`}>
                          {selected && <Check className="h-3.5 w-3.5" />}
                        </span>
                        <b className="min-w-0 text-black">{addon.label}</b>
                        {addon.tag && <span className="hidden rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 sm:inline">{addon.tag}</span>}
                      </span>
                      <b className="shrink-0 text-black">{money(addon.price)}</b>
                    </button>
                  );
                })}
              </div>
            </Section>

            <section className="hidden rounded-lg border border-slate-200 bg-white p-3 shadow-lg sm:block">
              <div className="mb-3 rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-xs font-bold text-yellow-900">Free cancellation till 1 hr of departure</div>
              <h3 className="text-lg font-black text-black">Payment Options</h3>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                <PaymentOption active={payment === 'part'} onClick={() => setPayment('part')} title={`Pay ${fare.pricingPolicy.advancePercent}% token`} subtitle="Pay advance by UPI" price={money(fare.partPay)} />
                <PaymentOption active={payment === 'full'} onClick={() => setPayment('full')} title="Pay 100%" subtitle="Pay full fare by UPI" price={money(fare.total)} />
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-700">
                  Booking is saved first as Pending Payment. After payment, upload screenshot and admin will verify it.
                </div>
              </div>
              <div className="mt-3 rounded-md border border-teal-200 bg-teal-50 p-2 text-xs font-bold text-teal-900">You will be redirected to a secure UPI payment page with QR code and app buttons.</div>
              <Button onClick={onSubmit} disabled={submitting || !canPay} className="mt-3 h-11 w-full rounded-md bg-teal-700 text-sm font-black uppercase text-white hover:bg-teal-800 disabled:opacity-50">
                {submitting ? 'Saving booking...' : `Pay Now ${money(payment === 'full' ? fare.total : fare.partPay)}`}
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
                  {fare.discount > 0 && <FareRow label="Round trip discount" value={-fare.discount} />}
                  <FareRow label="Add-ons" value={fare.addons} />
                  {!!fare.gst && <FareRow label="GST" value={fare.gst} />}
                  <FareRow label="Total" value={fare.total} bold />
                </div>
              </details>
            </section>
            <MobilePayBar fare={fare} payment={payment} detailsComplete={canPay} submitting={submitting} onSubmit={onSubmit} setPayment={setPayment} />
          </>
      </div>
    </div>
  );
}

function MobilePayBar({ fare, payment, detailsComplete, submitting, onSubmit, setPayment }) {
  const amount = payment === 'full' ? fare.total : fare.partPay;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white shadow-[0_-10px_30px_rgba(15,23,42,0.14)] sm:hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
        <div className="text-xs font-black text-slate-700">Total Fare</div>
        <div className="text-xl font-black text-slate-950">{money(fare.total)}</div>
      </div>
      <div className="grid grid-cols-[1fr_1fr_1fr_1.45fr] gap-1.5 px-2 py-2">
        <button type="button" className="min-h-12 rounded-md border border-slate-200 bg-white px-1 text-[10px] font-black text-slate-600">Book at Rs 0</button>
        <button type="button" onClick={() => setPayment('part')} className={`min-h-12 rounded-md border px-1 text-[10px] font-black ${payment === 'part' ? 'border-sky-300 bg-sky-500 text-white' : 'border-slate-200 bg-white text-slate-600'}`}>Pay {fare.pricingPolicy.advancePercent}%</button>
        <button type="button" onClick={() => setPayment('full')} className={`min-h-12 rounded-md border px-1 text-[10px] font-black ${payment === 'full' ? 'border-sky-300 bg-sky-500 text-white' : 'border-slate-200 bg-white text-slate-600'}`}>Pay 100%</button>
        <button type="button" onClick={onSubmit} disabled={submitting || !detailsComplete} className="min-h-12 rounded-md bg-orange-500 px-2 text-xs font-black uppercase leading-tight text-white shadow-sm disabled:opacity-50">
          {submitting ? 'Saving...' : <>Pay Now<br /><span className="text-[10px]">{money(amount)}</span></>}
        </button>
      </div>
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
        <span className="truncate">{prettyDate(date)} / {formatClock(time || '07:00')}</span>
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
          <Info label="Date & Time" value={`${prettyDate(data.date)} ${formatClock(data.time)}`} />
        </div>
      </div>
      <a href="tel:+918955458128" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-black text-slate-950 shadow"><Phone className="h-5 w-5" /> Talk to us</a>
      <div><Button onClick={onClose} className="mt-5 bg-amber-500 text-slate-950 hover:bg-amber-400">Close</Button></div>
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { ArrowLeftRight, CalendarDays, ChevronDown, Plane, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBooking } from '@/lib/booking-context';
import { DEFAULT_PRICING_SETTINGS } from '@/lib/pricing-defaults';
import { airportServiceAllowed, serviceCityAllowed } from '@/lib/service-cities';
import LocationAutocomplete from '@/components/site/booking/LocationAutocomplete';
import { toast } from 'sonner';

const TABS = [
  { id: 'one-way', label: 'One Way' },
  { id: 'round-trip', label: 'Round Trip' },
  { id: 'local', label: 'Local' },
  { id: 'airport', label: 'Airport' }
];

const AIRPORT_TRIPS = ['Drop to Airport', 'Pickup from Airport'];

function todayValue() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

function pickupLeadTimeMinutes(settings = DEFAULT_PRICING_SETTINGS) {
  const minutes = Number(settings.pickupLeadTimeMinutes);
  return Number.isFinite(minutes) && minutes >= 0 ? minutes : DEFAULT_PRICING_SETTINGS.pickupLeadTimeMinutes;
}

function minimumPickupDateTime(settings = DEFAULT_PRICING_SETTINGS) {
  const now = new Date();
  now.setMinutes(now.getMinutes() + pickupLeadTimeMinutes(settings));
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return { date: now.toISOString().slice(0, 10), time: now.toISOString().slice(11, 16) };
}

function roundTripReturnLeadTimeMinutes(settings = DEFAULT_PRICING_SETTINGS) {
  const minutes = Number(settings.roundTripReturnLeadTimeMinutes);
  return Number.isFinite(minutes) && minutes > 0 ? minutes : 0;
}

function addMinutesDateTime(date, time, minutes) {
  const next = new Date(`${date || todayValue()}T${time || '07:00'}`);
  next.setMinutes(next.getMinutes() + Number(minutes || 0));
  next.setMinutes(next.getMinutes() - next.getTimezoneOffset());
  return { date: next.toISOString().slice(0, 10), time: next.toISOString().slice(11, 16) };
}

function minimumReturnDateTime(date, time, settings = DEFAULT_PRICING_SETTINGS) {
  const leadMinutes = roundTripReturnLeadTimeMinutes(settings);
  return leadMinutes > 0 ? addMinutesDateTime(date, time, leadMinutes) : { date: date || todayValue(), time: time || '07:00' };
}

function displayDate(value) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return `${day}-${month}-${year}`;
}

function displayTime(value) {
  if (!value) return '';
  const [hours, minutes] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function dateTimeValue(date, time) {
  return `${date || todayValue()}T${time || '07:00'}`;
}

function splitDateTime(value) {
  const [nextDate, nextTime = '07:00'] = String(value || '').split('T');
  return { nextDate, nextTime: nextTime.slice(0, 5) };
}

export default function BookingWidget() {
  const [tab, setTab] = useState('one-way');
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [airportTrip, setAirportTrip] = useState(AIRPORT_TRIPS[0]);
  const [airport, setAirport] = useState('');
  const [pickupCoordinates, setPickupCoordinates] = useState(null);
  const [dropCoordinates, setDropCoordinates] = useState(null);
  const [date, setDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [time, setTime] = useState('');
  const [returnTime, setReturnTime] = useState('18:00');
  const [stops, setStops] = useState([]);
  const [stopCoordinates, setStopCoordinates] = useState([]);
  const [pricingSettings, setPricingSettings] = useState(DEFAULT_PRICING_SETTINGS);
  const { open } = useBooking();
  const minimumPickup = date && time
    ? minimumPickupDateTime(pricingSettings)
    : { date: '', time: '' };
  const minDate = minimumPickup.date;
  const minTime = date === minDate ? minimumPickup.time : undefined;
  const minimumReturn = date && time
    ? minimumReturnDateTime(date, time, pricingSettings)
    : { date: '', time: '' };
  const minReturnTime = returnDate === minimumReturn.date ? minimumReturn.time : undefined;

  useEffect(() => {
    let active = true;
    const initialPickup = minimumPickupDateTime();
    // These time-based values must be created in the browser. Generating them
    // during SSR can cross a minute boundary before React hydrates.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDate(initialPickup.date);
    setReturnDate(initialPickup.date);
    setTime(initialPickup.time);

    fetch('/api/pricing-settings', { cache: 'no-store' })
      .then((response) => response.json())
      .then((result) => {
        if (active && result?.settings) {
          setPricingSettings(result.settings);
          const minimum = minimumPickupDateTime(result.settings);
          setDate(minimum.date);
          setTime(minimum.time);
          setReturnDate((current) => current < minimum.date ? minimum.date : current);
          const minimumReturnTime = minimumReturnDateTime(minimum.date, minimum.time, result.settings);
          setReturnDate(minimumReturnTime.date);
          setReturnTime(minimumReturnTime.time);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const updateDate = (value) => {
    const nextDate = value && value < minDate ? minDate : value;
    setDate(nextDate);
    const nextReturn = minimumReturnDateTime(nextDate, time, pricingSettings);
    if (returnDate < nextReturn.date) setReturnDate(nextReturn.date);
    if (returnDate === nextReturn.date && returnTime < nextReturn.time) setReturnTime(nextReturn.time);
    if (nextDate === minDate && time < minimumPickup.time) {
      setTime(minimumPickup.time);
    }
  };

  const updateReturnDate = (value) => {
    const nextReturnDate = value && value < minimumReturn.date ? minimumReturn.date : value;
    setReturnDate(nextReturnDate);
    if (nextReturnDate === minimumReturn.date && returnTime < minimumReturn.time) setReturnTime(minimumReturn.time);
  };

  const updateTime = (value) => {
    const nextTime = date === minDate && value < minimumPickup.time ? minimumPickup.time : value;
    if (date === minDate && value < minimumPickup.time) {
      setTime(minimumPickup.time);
    } else {
      setTime(value);
    }
    const nextReturn = minimumReturnDateTime(date, nextTime, pricingSettings);
    if (returnDate < nextReturn.date) setReturnDate(nextReturn.date);
    if (returnDate === nextReturn.date && returnTime < nextReturn.time) setReturnTime(nextReturn.time);
  };

  const updateReturnTime = (value) => {
    if (returnDate === minimumReturn.date && value < minimumReturn.time) {
      setReturnTime(minimumReturn.time);
      return;
    }
    setReturnTime(value);
  };

  const changeTab = (nextTab) => {
    setTab(nextTab);
    if (nextTab !== 'local' && drop === '8 hrs / 80 km') setDrop('');
  };

  const swapPlaces = () => {
    setPickup(drop);
    setDrop(pickup);
    setPickupCoordinates(dropCoordinates);
    setDropCoordinates(pickupCoordinates);
  };

  const swapAirportPlaces = () => {
    setAirportTrip((current) => current === 'Pickup from Airport' ? 'Drop to Airport' : 'Pickup from Airport');
    setPickup(airport);
    setAirport(pickup);
    setPickupCoordinates(dropCoordinates);
    setDropCoordinates(pickupCoordinates);
  };

  const explore = () => {
    const airportPickup = airportTrip === 'Pickup from Airport';
    const nextPickup = tab === 'airport' ? (airportPickup ? airport : pickup) : pickup;
    const nextDrop = tab === 'local' ? '' : tab === 'airport' ? (airportPickup ? drop : airport) : drop;

    if (pricingSettings.dutyEnabled === false) {
      toast.error('Service is not available right now. Please try again when duty is on.');
      return;
    }
    if (tab === 'one-way' && pricingSettings.oneWayEnabled === false) {
      toast.error('One way service is not available right now. Please choose another trip type.');
      return;
    }
    if (!nextPickup.trim() || (tab !== 'local' && !nextDrop.trim())) {
      toast.error(tab === 'local' ? 'Please enter pickup location.' : 'Please enter pickup location and drop location.');
      return;
    }
    if (!serviceCityAllowed(nextPickup, pricingSettings)) {
      toast.error('Pickup city is not service available.');
      return;
    }
    if (tab === 'airport' && !airportServiceAllowed(airport, pricingSettings)) {
      toast.error('Selected airport is not service available.');
      return;
    }

    open({
      tripType: tab,
      pickup: nextPickup,
      drop: nextDrop,
      date,
      time,
      returnTime: tab === 'round-trip' ? returnTime : '',
      returnDate: tab === 'round-trip' ? returnDate : '',
      stops: ['one-way', 'round-trip', 'airport'].includes(tab) ? stops.filter(Boolean) : [],
      stopCoordinates: ['one-way', 'round-trip', 'airport'].includes(tab) ? stopCoordinates.filter(Boolean) : [],
      rental: tab === 'local' ? '8 hrs / 80 km' : undefined,
      pickupCoordinates,
      dropCoordinates,
      startStep: 2
    });
  };

  const commonDateFields = (
    <>
      <LineDateTime
        label="Pickup Date & Time"
        date={date}
        time={time}
        minDate={minDate}
        minTime={minTime}
        onChange={(value) => {
          const { nextDate, nextTime } = splitDateTime(value);
          updateDate(nextDate);
          updateTime(nextTime);
        }}
      />
      {tab === 'round-trip' && (
        <LineDateTime
          label="Return Date & Time"
          date={returnDate}
          time={returnTime}
          minDate={date}
          minTime={minReturnTime}
          onChange={(value) => {
            const { nextDate, nextTime } = splitDateTime(value);
            updateReturnDate(nextDate);
            updateReturnTime(nextDate === minimumReturn.date && nextTime < minimumReturn.time ? minimumReturn.time : nextTime);
          }}
        />
      )}
    </>
  );

  return (
    <div id="book" className="relative z-10 mx-auto w-full max-w-[1240px] px-3 sm:px-4">
      <div className="mx-auto max-w-[1180px] rounded-[22px] border border-white/70 bg-white/95 px-4 pb-5 pt-4 shadow-[0_18px_50px_rgba(2,8,23,0.28)] backdrop-blur sm:rounded-[26px] sm:px-8 sm:pb-6 sm:pt-6 lg:px-8 xl:px-9">
        <div className="mx-auto grid h-10 max-w-[610px] grid-cols-4 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-center text-[11px] font-black sm:h-11 sm:text-sm">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => changeTab(item.id)}
              className={`rounded-md px-1 leading-tight transition ${tab === item.id ? 'bg-[#12233f] text-white shadow-sm' : 'text-slate-700 hover:bg-white hover:text-teal-700'}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-5 lg:mt-6">
          {tab === 'one-way' && (
            <div className="grid items-end gap-4 lg:grid-cols-[minmax(0,1fr)_290px] xl:gap-7">
              <RouteLocationFields
                pickup={pickup}
                drop={drop}
                setPickup={setPickup}
                setDrop={setDrop}
                setPickupCoordinates={setPickupCoordinates}
                setDropCoordinates={setDropCoordinates}
                onSwap={swapPlaces}
              />
              {commonDateFields}
            </div>
          )}

          {tab === 'round-trip' && (
            <div className="grid items-end gap-4 lg:grid-cols-[minmax(0,1fr)_230px_230px] xl:gap-6">
              <RouteLocationFields
                pickup={pickup}
                drop={drop}
                setPickup={setPickup}
                setDrop={setDrop}
                setPickupCoordinates={setPickupCoordinates}
                setDropCoordinates={setDropCoordinates}
                onSwap={swapPlaces}
              />
              {commonDateFields}
            </div>
          )}

          {tab === 'local' && (
            <div className="grid items-end gap-4 md:grid-cols-[minmax(0,1fr)_290px] xl:gap-7">
              <LineLocation
                label="Pickup Location"
                value={pickup}
                setValue={setPickup}
                setCoordinates={setPickupCoordinates}
                placeholder="Pickup Location"
                showCurrentLocation
              />
              {commonDateFields}
            </div>
          )}

          {tab === 'airport' && (
            <div className="grid items-end gap-4 lg:grid-cols-[220px_minmax(0,1fr)_270px] xl:gap-7">
              <LineSelect label="Trip" value={airportTrip} onChange={setAirportTrip} options={AIRPORT_TRIPS} />
              <AirportLocationFields
                pickup={pickup}
                airport={airport}
                setPickup={setPickup}
                setAirport={setAirport}
                setPickupCoordinates={setPickupCoordinates}
                setDropCoordinates={setDropCoordinates}
                airportTrip={airportTrip}
                onSwap={swapAirportPlaces}
              />
              {commonDateFields}
            </div>
          )}
        </div>

        {['one-way', 'round-trip', 'airport'].includes(tab) && (
          <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-black text-slate-900">Stoppage</div>
              <Button type="button" variant="outline" onClick={() => {
                setStops((current) => [...current, '']);
                setStopCoordinates((current) => [...current, null]);
              }} className="h-9 rounded-md bg-white text-xs font-black text-slate-950">
                <Plus className="h-4 w-4" /> Add Stop
              </Button>
            </div>
            {stops.map((stop, index) => (
              <div key={index} className="mt-3 flex gap-2">
                <LocationAutocomplete
                  label={`Stop ${index + 1}`}
                  value={stop}
                  onValueChange={(value) => {
                    setStops((current) => current.map((item, itemIndex) => itemIndex === index ? value : item));
                    setStopCoordinates((current) => current.map((item, itemIndex) => itemIndex === index ? null : item));
                  }}
                  onSelect={(location) => {
                    setStops((current) => current.map((item, itemIndex) => itemIndex === index ? location.label : item));
                    setStopCoordinates((current) => current.map((item, itemIndex) => itemIndex === index ? location.coordinates : item));
                  }}
                  placeholder={`Stop ${index + 1} location`}
                  className="flex-1"
                />
                <button type="button" onClick={() => {
                  setStops((current) => current.filter((_, itemIndex) => itemIndex !== index));
                  setStopCoordinates((current) => current.filter((_, itemIndex) => itemIndex !== index));
                }} className="mt-6 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-red-200 bg-white text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="pointer-events-none -mb-10 mt-5 flex justify-center lg:-mb-11 lg:mt-6">
          <Button onClick={explore} className="pointer-events-auto h-12 w-full max-w-[300px] rounded-lg !bg-[#f59e0b] text-sm font-black uppercase !text-[#12233f] shadow-lg shadow-amber-500/25 hover:!bg-[#fbbf24] sm:h-14 sm:max-w-[320px] sm:text-lg">
            Explore Cabs
          </Button>
        </div>
      </div>
    </div>
  );
}

function RouteLocationFields({ pickup, drop, fromLabel = 'From', toLabel = 'To', setPickup, setDrop, setPickupCoordinates, setDropCoordinates, onSwap }) {
  return (
    <div className="relative grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-end lg:gap-4 xl:gap-6">
      <LineLocation label={fromLabel} value={pickup} setValue={setPickup} setCoordinates={setPickupCoordinates} showCurrentLocation />
      <SwapButton onClick={onSwap} />
      <LineLocation label={toLabel} value={drop} setValue={setDrop} setCoordinates={setDropCoordinates} />
    </div>
  );
}

function AirportLocationFields({ pickup, airport, setPickup, setAirport, setPickupCoordinates, setDropCoordinates, airportTrip, onSwap }) {
  return (
    <div className="relative grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-end lg:gap-4 xl:gap-6">
      <LineLocation label="Pickup Address" value={pickup} setValue={setPickup} setCoordinates={setPickupCoordinates} showCurrentLocation />
      <SwapButton onClick={onSwap} />
      <LineLocation label={airportTrip === 'Pickup from Airport' ? 'Pickup Airport' : 'Drop Airport'} value={airport} setValue={setAirport} setCoordinates={setDropCoordinates} placeholder="Enter Airport" />
    </div>
  );
}

function SwapButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-1 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-teal-700 shadow-md ring-1 ring-teal-100 transition hover:bg-teal-50 hover:text-teal-800 lg:static lg:mx-auto lg:h-10 lg:w-10 lg:translate-y-0"
      aria-label="Swap pickup and drop"
    >
      <ArrowLeftRight className="h-5 w-5" />
    </button>
  );
}

function LineLocation({ label, value, setValue, setCoordinates, placeholder, showCurrentLocation = false }) {
  return (
    <LocationAutocomplete
      label={label}
      value={value}
      onValueChange={(nextValue) => {
        setValue(nextValue);
        setCoordinates(null);
      }}
      onSelect={(place) => {
        setValue(place.label);
        setCoordinates(place.coordinates);
      }}
      placeholder={placeholder || (label === 'City' ? 'City' : label === 'To' ? 'Drop Location' : label === 'From' ? 'Pickup Location' : label)}
      showCurrentLocation={showCurrentLocation}
      variant="line"
      className="min-w-0"
    />
  );
}

function LineDateTime({ label, date, time, minDate, minTime, onChange }) {
  const min = minDate ? dateTimeValue(minDate, minTime || '00:00') : undefined;
  return (
    <label className="relative block min-w-0">
      <span className="mb-1.5 block text-[13px] font-black uppercase tracking-wide text-slate-700 sm:text-sm">{label}</span>
      <span className="flex h-10 min-w-0 items-center gap-2.5 border-b border-slate-200 text-slate-950 focus-within:border-teal-600">
        <CalendarDays className="h-4 w-4 shrink-0 text-teal-700 lg:hidden" />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-black sm:text-base">{displayDate(date)} / {displayTime(time)}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-teal-700" />
      </span>
      <input type="datetime-local" value={date && time ? dateTimeValue(date, time) : ''} min={min} onChange={(event) => onChange(event.target.value)} className="absolute inset-x-0 bottom-0 h-10 cursor-pointer opacity-0" />
    </label>
  );
}

function LineSelect({ label, value, onChange, options }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[13px] font-black uppercase tracking-wide text-slate-700 sm:text-sm">{label}</span>
      <span className="flex h-10 min-w-0 items-center gap-2.5 border-b border-slate-200 text-slate-950 focus-within:border-teal-600">
        <Plane className="h-4 w-4 shrink-0 text-teal-700 lg:hidden" />
        <select value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none sm:text-base">
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
        <ChevronDown className="h-4 w-4 shrink-0 text-teal-700" />
      </span>
    </label>
  );
}

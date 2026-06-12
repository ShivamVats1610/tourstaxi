'use client';
import { useState } from 'react';
import { ArrowLeftRight, CalendarDays, CarFront, Clock, Headphones, IndianRupee, Plane, ShieldCheck, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBooking } from '@/lib/booking-context';
import LocationAutocomplete from '@/components/site/booking/LocationAutocomplete';

const TABS = [
  { id: 'one-way', label: 'Outstation', icon: CarFront },
  { id: 'local', label: 'Local', icon: Timer },
  { id: 'airport', label: 'Airport', icon: Plane }
];

const TRIP_MODES = [
  { id: 'one-way', label: 'One Way', sub: 'Drop-off Only' },
  { id: 'round-trip', label: 'Round Trip', sub: 'Return With Same Cab' }
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

function displayDate(value) {
  if (!value) return '';
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function displayTime(value) {
  if (!value) return '';
  const [hours, minutes] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function BookingWidget() {
  const [tab, setTab] = useState('one-way');
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [pickupCoordinates, setPickupCoordinates] = useState(null);
  const [dropCoordinates, setDropCoordinates] = useState(null);
  const [date, setDate] = useState(todayValue());
  const [time, setTime] = useState('07:00');
  const [passengers, setPassengers] = useState('2 Passengers');
  const { open } = useBooking();
  const minDate = todayValue();
  const minTime = date === minDate ? nextPickupTimeValue() : undefined;

  const updateDate = (value) => {
    const nextDate = value && value < minDate ? minDate : value;
    setDate(nextDate);
    if (nextDate === minDate && time < nextPickupTimeValue()) {
      setTime(nextPickupTimeValue());
    }
  };

  const updateTime = (value) => {
    if (date === minDate && value < nextPickupTimeValue()) {
      setTime(nextPickupTimeValue());
      return;
    }
    setTime(value);
  };

  const swapPlaces = () => {
    setPickup(drop);
    setDrop(pickup);
    setPickupCoordinates(dropCoordinates);
    setDropCoordinates(pickupCoordinates);
  };

  const explore = () => open({
    tripType: tab,
    pickup,
    drop,
    date,
    time,
    passengers,
    pickupCoordinates,
    dropCoordinates,
    startStep: pickup && (tab === 'local' || drop) && date ? 2 : 1
  });

  return (
    <div id="book" className="relative z-10 mx-auto w-full max-w-[1424px] px-4">
      <div className="mx-auto max-w-[674px] rounded-[24px] bg-white px-4 pb-5 pt-6 shadow-[0_18px_40px_rgba(15,23,42,0.24)] sm:max-w-none sm:px-8 sm:pb-6 sm:pt-6 lg:px-10">
        <div className="mx-auto grid h-12 max-w-[610px] grid-cols-3 overflow-hidden rounded-md border border-slate-400 text-center text-[clamp(14px,4.1vw,18px)] font-black uppercase tracking-normal sm:h-auto sm:text-sm">
          {TABS.map((tabItem) => {
            const active = tabItem.id === tab || (tab === 'round-trip' && tabItem.id === 'one-way');
            return (
              <button key={tabItem.id} onClick={() => setTab(tabItem.id)} className={`flex h-full items-center justify-center gap-2 border-r border-slate-400 px-2 transition-colors last:border-r-0 sm:h-12 ${active ? 'bg-sky-500 text-white' : 'bg-white text-slate-950 hover:bg-sky-50'}`}>
                <tabItem.icon className="hidden h-4 w-4 sm:block" /> {tabItem.label}
              </button>
            );
          })}
        </div>

        <div className="my-6 border-y-2 border-sky-400 py-3 text-center text-[clamp(18px,5.4vw,26px)] font-black uppercase leading-tight tracking-normal text-slate-800 sm:my-5 sm:py-2 sm:text-xl">
          India&apos;s Premier Intercity Cabs
        </div>

        {tab !== 'local' && tab !== 'airport' && (
          <div className="mx-auto mb-6 grid h-14 max-w-[450px] grid-cols-2 overflow-hidden rounded-md border border-slate-400 text-center sm:mb-6 sm:h-auto sm:max-w-[330px]">
            {TRIP_MODES.map((mode) => (
              <button key={mode.id} type="button" onClick={() => setTab(mode.id)} className={`h-full border-r border-slate-400 px-2 last:border-r-0 sm:h-[58px] ${tab === mode.id ? 'bg-sky-500 text-white' : 'bg-white text-slate-950'}`}>
                <span className="block text-[clamp(13px,3.8vw,17px)] font-black uppercase tracking-normal sm:text-sm">{mode.label}</span>
                <span className="mt-0.5 block text-[clamp(10px,2.9vw,13px)] font-semibold sm:text-[11px]">{mode.sub}</span>
              </button>
            ))}
          </div>
        )}

        <div className="relative grid items-end gap-3 md:grid-cols-[1fr_1fr] xl:grid-cols-[1fr_auto_1fr_1fr_1fr]">
          <LocationAutocomplete
            label="From"
            value={pickup}
            onValueChange={(value) => {
              setPickup(value);
              setPickupCoordinates(null);
            }}
            onSelect={(place) => {
              setPickup(place.label);
              setPickupCoordinates(place.coordinates);
            }}
            placeholder="Enter Pickup Location"
            showCurrentLocation
            variant="boxed"
            className="rounded-xl border-2 border-sky-100 bg-sky-50/60 px-4 py-4 shadow-sm sm:border sm:px-4 sm:py-3"
          />

          <button onClick={swapPlaces} className="absolute right-5 top-[70px] z-20 flex h-12 w-12 items-center justify-center rounded-full border-2 border-sky-100 bg-white text-sky-500 shadow-md transition hover:bg-sky-50 md:right-[calc(50%_-_24px)] md:top-10 xl:static xl:h-11 xl:w-11" aria-label="Swap pickup and drop">
            <ArrowLeftRight className="h-6 w-6 xl:h-5 xl:w-5" />
          </button>

          {tab === 'local' ? (
            <SelectField icon={Timer} label="Package" value={drop} onChange={setDrop} options={['4 hrs / 40 km', '8 hrs / 80 km', '12 hrs / 120 km']} boxed />
          ) : (
            <LocationAutocomplete
              label="To"
              value={drop}
              onValueChange={(value) => {
                setDrop(value);
                setDropCoordinates(null);
              }}
              onSelect={(place) => {
                setDrop(place.label);
                setDropCoordinates(place.coordinates);
              }}
              placeholder="Enter Drop Location"
              variant="boxed"
              className="rounded-xl border-2 border-sky-100 bg-sky-50/60 px-4 py-4 shadow-sm sm:border sm:px-4 sm:py-3"
            />
          )}

          <DateTimeField date={date} time={time} minDate={minDate} minTime={minTime} onDateChange={updateDate} onTimeChange={updateTime} />
          <SearchField icon={Clock} label="Pick Up Time" type="time" value={time} min={minTime} onChange={updateTime} boxed className="hidden xl:block" />
        </div>

        <div className="mt-6 grid gap-3 sm:mt-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <SelectField label="Travellers" value={passengers} onChange={setPassengers} options={['1 Passenger', '2 Passengers', '3 Passengers', '4 Passengers', '5+ Passengers']} boxed className="hidden sm:block" />
          <Button onClick={explore} className="h-14 w-full rounded-md bg-orange-500 px-8 text-[clamp(18px,5vw,24px)] font-black uppercase tracking-normal text-white hover:bg-orange-600 sm:h-14 sm:min-w-[280px] sm:text-lg">
            Explore Cabs
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[clamp(11px,3.4vw,14px)] font-bold text-slate-700 sm:mt-5 sm:text-[13px]">
          <Trust icon={ShieldCheck} label="Verified Drivers" />
          <Trust icon={IndianRupee} label="Transparent Pricing" />
          <Trust icon={Headphones} label="24x7 Support" />
        </div>
      </div>
    </div>
  );
}

function DateTimeField({ date, time, minDate, minTime, onDateChange, onTimeChange }) {
  return (
    <div className="relative block min-w-0 rounded-xl border-2 border-sky-100 bg-sky-50/60 px-4 py-3 shadow-sm sm:border sm:px-4 sm:py-3">
      <span className="mb-0 block text-[clamp(13px,3.7vw,16px)] font-black uppercase tracking-wide text-sky-500 sm:text-xs">Trip Start</span>
      <span className="mt-1.5 flex min-w-0 items-start gap-4 text-slate-950 sm:mt-1 sm:h-9 sm:items-center sm:gap-3">
        <CalendarDays className="mt-1 h-6 w-6 shrink-0 text-sky-500 sm:mt-0 sm:h-6 sm:w-6" />
        <span className="min-w-0">
          <span className="block text-[clamp(15px,4vw,18px)] font-black leading-tight text-black sm:text-base">{displayDate(date)}</span>
          <span className="mt-1 block text-[clamp(14px,3.8vw,17px)] font-normal leading-tight text-slate-500 sm:mt-0 sm:text-base">{displayTime(time)}</span>
        </span>
      </span>
      <input type="date" value={date} min={minDate} onChange={(event) => onDateChange(event.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" aria-label="Trip start date" />
      <input type="time" value={time} min={minTime} onChange={(event) => onTimeChange(event.target.value)} className="sr-only" aria-label="Pickup time" />
    </div>
  );
}

function SearchField({ icon: Icon, extraIcon: ExtraIcon, label, value, onChange, placeholder, type = 'text', min, boxed = false, className = '' }) {
  return (
    <label className={`${boxed ? 'block min-w-0 rounded-xl border-2 border-sky-100 bg-sky-50/60 px-4 py-4 shadow-sm sm:border sm:px-4 sm:py-3' : 'block min-w-0'} ${className}`}>
      <span className={boxed ? 'mb-0 block text-xs font-black uppercase tracking-wide text-sky-500' : 'mb-2 block text-xl font-black uppercase tracking-wide text-slate-700'}>{label}</span>
      <span className={boxed ? 'mt-1 flex h-12 min-w-0 items-center gap-3 text-slate-950 sm:h-9' : 'flex h-12 min-w-0 items-center gap-3 border-b border-slate-300 text-slate-950 focus-within:border-sky-500'}>
        {Icon && <Icon className={boxed ? 'h-6 w-6 shrink-0 text-sky-500' : 'h-5 w-5 shrink-0 text-slate-500'} />}
        <input type={type} value={value} onChange={(event) => onChange?.(event.target.value)} placeholder={placeholder} min={min} className="min-w-0 flex-1 bg-transparent text-[22px] font-black outline-none placeholder:text-slate-400 sm:text-base sm:font-semibold" />
        {ExtraIcon && <ExtraIcon className="h-5 w-5 shrink-0 text-slate-500" />}
      </span>
    </label>
  );
}

function SelectField({ icon: Icon, label, value, onChange, options, className = '', boxed = false }) {
  return (
    <label className={`${boxed ? 'block min-w-0 rounded-xl border border-sky-200 bg-sky-50/45 px-4 py-3 shadow-sm' : 'block min-w-0'} ${className}`}>
      {label && <span className={boxed ? 'mb-0 block text-xs font-black uppercase tracking-wide text-sky-500' : 'mb-2 block text-xl font-black uppercase tracking-wide text-slate-700'}>{label}</span>}
      <span className={boxed ? 'mt-1 flex h-9 min-w-0 items-center gap-3 text-slate-950' : 'flex h-12 min-w-0 items-center gap-3 border-b border-slate-300 text-slate-950 focus-within:border-sky-500'}>
        {Icon && <Icon className="h-5 w-5 shrink-0 text-slate-500" />}
        <select value={value || ''} onChange={(event) => onChange?.(event.target.value)} className="min-w-0 flex-1 bg-transparent text-base font-semibold outline-none">
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
      </span>
    </label>
  );
}

function Trust({ icon: Icon, label }) {
  return (
    <div className="flex min-w-0 items-center justify-center gap-1">
      <Icon className="h-5 w-5 shrink-0 text-sky-500 sm:h-5 sm:w-5" />
      <span className="min-w-0 leading-tight">{label}</span>
    </div>
  );
}

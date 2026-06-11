'use client';
import { useState } from 'react';
import { ArrowLeftRight, CalendarDays, CarFront, Clock, Headphones, IndianRupee, Plane, ShieldCheck, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBooking } from '@/lib/booking-context';
import LocationAutocomplete from '@/components/site/booking/LocationAutocomplete';

const TABS = [
  { id: 'local', label: 'Local', icon: Timer },
  { id: 'one-way', label: 'Outstation', icon: CarFront },
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

export default function BookingWidget() {
  const [tab, setTab] = useState('one-way');
  const [pickup, setPickup] = useState('Sawai Madhopur, Rajasthan');
  const [drop, setDrop] = useState('Jaipur, Rajasthan');
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
      <div className="rounded-[24px] bg-white px-5 pb-6 pt-6 shadow-[0_18px_40px_rgba(15,23,42,0.24)] sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-[610px] grid-cols-3 overflow-hidden rounded-md border border-slate-400 text-center text-sm font-black uppercase tracking-wide">
          {TABS.map((tabItem) => {
            const active = tabItem.id === tab || (tab === 'round-trip' && tabItem.id === 'one-way');
            return (
              <button key={tabItem.id} onClick={() => setTab(tabItem.id)} className={`flex h-12 items-center justify-center gap-2 border-r border-slate-400 px-2 transition-colors last:border-r-0 ${active ? 'bg-sky-500 text-white' : 'bg-white text-slate-950 hover:bg-sky-50'}`}>
                <tabItem.icon className="hidden h-4 w-4 sm:block" /> {tabItem.label}
              </button>
            );
          })}
        </div>

        <div className="my-5 border-y-2 border-sky-400 py-2 text-center text-lg font-black uppercase tracking-wide text-slate-800 sm:text-xl">
          India&apos;s Premier Intercity Cabs
        </div>

        {tab !== 'local' && tab !== 'airport' && (
          <div className="mx-auto mb-6 grid max-w-[330px] grid-cols-2 overflow-hidden rounded-md border border-slate-400 text-center">
            {TRIP_MODES.map((mode) => (
              <button key={mode.id} type="button" onClick={() => setTab(mode.id)} className={`h-[58px] border-r border-slate-400 px-2 last:border-r-0 ${tab === mode.id ? 'bg-sky-500 text-white' : 'bg-white text-slate-950'}`}>
                <span className="block text-sm font-black uppercase tracking-wide">{mode.label}</span>
                <span className="mt-0.5 block text-[11px] font-semibold">{mode.sub}</span>
              </button>
            ))}
          </div>
        )}

        <div className="relative grid items-end gap-3 lg:grid-cols-[1fr_auto_1fr_1fr_1fr]">
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
            className="rounded-xl border border-sky-200 bg-sky-50/45 px-4 py-3 shadow-sm"
          />

          <button onClick={swapPlaces} className="absolute right-4 top-[86px] z-20 flex h-12 w-12 items-center justify-center rounded-full border border-sky-100 bg-white text-sky-500 shadow-md transition hover:bg-sky-50 lg:static lg:h-11 lg:w-11" aria-label="Swap pickup and drop">
            <ArrowLeftRight className="h-5 w-5" />
          </button>

          {tab === 'local' ? (
            <SelectField icon={Timer} label="Package" value={drop} onChange={setDrop} options={['4 hrs / 40 km', '8 hrs / 80 km', '12 hrs / 120 km']} />
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
              className="rounded-xl border border-sky-200 bg-sky-50/45 px-4 py-3 shadow-sm"
            />
          )}

          <SearchField icon={CalendarDays} label="Trip Start" type="date" value={date} min={minDate} onChange={updateDate} boxed />
          <SearchField icon={Clock} label="Pick Up Time" type="time" value={time} min={minTime} onChange={updateTime} boxed />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <SelectField label="Travellers" value={passengers} onChange={setPassengers} options={['1 Passenger', '2 Passengers', '3 Passengers', '4 Passengers', '5+ Passengers']} boxed />
          <Button onClick={explore} className="h-14 w-full rounded bg-orange-500 px-12 text-lg font-black uppercase tracking-wide text-white hover:bg-orange-600 sm:min-w-[280px]">
            Explore Cabs
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[13px] font-bold text-slate-700">
          <Trust icon={ShieldCheck} label="Verified Drivers" />
          <Trust icon={IndianRupee} label="Transparent Pricing" />
          <Trust icon={Headphones} label="24x7 Support" />
        </div>
      </div>
    </div>
  );
}

function SearchField({ icon: Icon, extraIcon: ExtraIcon, label, value, onChange, placeholder, type = 'text', min, boxed = false }) {
  return (
    <label className={boxed ? 'block min-w-0 rounded-xl border border-sky-200 bg-sky-50/45 px-4 py-3 shadow-sm' : 'block min-w-0'}>
      <span className={boxed ? 'mb-0 block text-xs font-black uppercase tracking-wide text-sky-500' : 'mb-2 block text-xl font-black uppercase tracking-wide text-slate-700'}>{label}</span>
      <span className={boxed ? 'mt-1 flex h-9 min-w-0 items-center gap-3 text-slate-950' : 'flex h-12 min-w-0 items-center gap-3 border-b border-slate-300 text-slate-950 focus-within:border-sky-500'}>
        {Icon && <Icon className={boxed ? 'h-6 w-6 shrink-0 text-sky-500' : 'h-5 w-5 shrink-0 text-slate-500'} />}
        <input type={type} value={value} onChange={(event) => onChange?.(event.target.value)} placeholder={placeholder} min={min} className="min-w-0 flex-1 bg-transparent text-base font-semibold outline-none placeholder:text-slate-400" />
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
      <Icon className="h-5 w-5 shrink-0 text-sky-500" />
      <span className="min-w-0 leading-tight">{label}</span>
    </div>
  );
}

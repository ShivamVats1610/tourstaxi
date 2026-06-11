'use client';
import { useState } from 'react';
import { ArrowLeftRight, CalendarDays, Clock, Plane, Repeat, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBooking } from '@/lib/booking-context';
import LocationAutocomplete from '@/components/site/booking/LocationAutocomplete';

const TABS = [
  { id: 'one-way', label: 'One Way', icon: ArrowLeftRight },
  { id: 'round-trip', label: 'Round Trip', icon: Repeat },
  { id: 'local', label: 'Local', icon: Timer },
  { id: 'airport', label: 'Airport', icon: Plane }
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
      <div className="rounded-[18px] bg-white px-5 pb-7 pt-8 shadow-[0_18px_40px_rgba(15,23,42,0.22)] sm:px-8 lg:px-10">
        <div className="mx-auto mb-7 grid max-w-[610px] grid-cols-2 overflow-hidden rounded-md border border-slate-400 text-center text-sm font-black uppercase tracking-wide sm:grid-cols-4">
          {TABS.map((tabItem) => {
            const active = tabItem.id === tab;
            return (
              <button key={tabItem.id} onClick={() => setTab(tabItem.id)} className={`flex h-11 items-center justify-center gap-2 border-slate-400 px-3 transition-colors sm:border-r sm:last:border-r-0 ${active ? 'bg-sky-500 text-white' : 'bg-white text-slate-950 hover:bg-sky-50'}`}>
                <tabItem.icon className="h-4 w-4" /> {tabItem.label}
              </button>
            );
          })}
        </div>

        <div className="grid items-end gap-5 lg:grid-cols-[1fr_auto_1fr_1fr_1fr]">
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
            placeholder="Pickup city"
            showCurrentLocation
          />

          <button onClick={swapPlaces} className="hidden h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-sky-600 transition hover:bg-sky-100 lg:flex" aria-label="Swap pickup and drop">
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
              placeholder="Destination city"
            />
          )}

          <SearchField icon={CalendarDays} label="Pick Up Date" type="date" value={date} min={minDate} onChange={updateDate} />
          <SearchField icon={Clock} label="Pick Up Time" type="time" value={time} min={minTime} onChange={updateTime} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <SelectField label="Travellers" value={passengers} onChange={setPassengers} options={['1 Passenger', '2 Passengers', '3 Passengers', '4 Passengers', '5+ Passengers']} className="sm:max-w-xs" />
          <Button onClick={explore} className="h-14 min-w-[280px] rounded bg-orange-500 px-12 text-lg font-black uppercase tracking-wide text-white hover:bg-orange-600">
            Explore Cabs
          </Button>
          <div className="hidden text-right text-xs font-semibold text-slate-500 sm:block">Free cancellation before pickup</div>
        </div>
      </div>
    </div>
  );
}

function SearchField({ icon: Icon, extraIcon: ExtraIcon, label, value, onChange, placeholder, type = 'text', min }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-xl font-black uppercase tracking-wide text-slate-700">{label}</span>
      <span className="flex h-12 min-w-0 items-center gap-3 border-b border-slate-300 text-slate-950 focus-within:border-sky-500">
        {Icon && <Icon className="h-5 w-5 shrink-0 text-slate-500" />}
        <input type={type} value={value} onChange={(event) => onChange?.(event.target.value)} placeholder={placeholder} min={min} className="min-w-0 flex-1 bg-transparent text-base font-semibold outline-none placeholder:text-slate-400" />
        {ExtraIcon && <ExtraIcon className="h-5 w-5 shrink-0 text-slate-500" />}
      </span>
    </label>
  );
}

function SelectField({ icon: Icon, label, value, onChange, options, className = '' }) {
  return (
    <label className={`block min-w-0 ${className}`}>
      {label && <span className="mb-2 block text-xl font-black uppercase tracking-wide text-slate-700">{label}</span>}
      <span className="flex h-12 min-w-0 items-center gap-3 border-b border-slate-300 text-slate-950 focus-within:border-sky-500">
        {Icon && <Icon className="h-5 w-5 shrink-0 text-slate-500" />}
        <select value={value || ''} onChange={(event) => onChange?.(event.target.value)} className="min-w-0 flex-1 bg-transparent text-base font-semibold outline-none">
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
      </span>
    </label>
  );
}

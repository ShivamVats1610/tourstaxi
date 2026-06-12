'use client';
import { useState } from 'react';
import { ArrowLeftRight, CalendarDays, ChevronDown, Clock, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBooking } from '@/lib/booking-context';
import LocationAutocomplete from '@/components/site/booking/LocationAutocomplete';

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

function nextPickupTimeValue() {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 30);
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
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

export default function BookingWidget() {
  const [tab, setTab] = useState('one-way');
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [airportTrip, setAirportTrip] = useState(AIRPORT_TRIPS[0]);
  const [airport, setAirport] = useState('');
  const [pickupCoordinates, setPickupCoordinates] = useState(null);
  const [dropCoordinates, setDropCoordinates] = useState(null);
  const [date, setDate] = useState(todayValue());
  const [returnDate, setReturnDate] = useState(todayValue());
  const [time, setTime] = useState('07:00');
  const { open } = useBooking();
  const minDate = todayValue();
  const minTime = date === minDate ? nextPickupTimeValue() : undefined;

  const updateDate = (value) => {
    const nextDate = value && value < minDate ? minDate : value;
    setDate(nextDate);
    if (returnDate < nextDate) setReturnDate(nextDate);
    if (nextDate === minDate && time < nextPickupTimeValue()) {
      setTime(nextPickupTimeValue());
    }
  };

  const updateReturnDate = (value) => {
    setReturnDate(value && value < date ? date : value);
  };

  const updateTime = (value) => {
    if (date === minDate && value < nextPickupTimeValue()) {
      setTime(nextPickupTimeValue());
      return;
    }
    setTime(value);
  };

  const changeTab = (nextTab) => {
    setTab(nextTab);
    if (nextTab === 'local' && !drop) setDrop('8 hrs / 80 km');
    if (nextTab !== 'local' && drop === '8 hrs / 80 km') setDrop('');
  };

  const swapPlaces = () => {
    setPickup(drop);
    setDrop(pickup);
    setPickupCoordinates(dropCoordinates);
    setDropCoordinates(pickupCoordinates);
  };

  const explore = () => {
    const airportPickup = airportTrip === 'Pickup from Airport';
    open({
      tripType: tab,
      pickup: tab === 'airport' ? (airportPickup ? airport : pickup) : pickup,
      drop: tab === 'airport' ? (airportPickup ? drop : airport) : drop,
      date,
      time,
      returnDate: tab === 'round-trip' ? returnDate : '',
      rental: tab === 'local' ? '8 hrs / 80 km' : undefined,
      pickupCoordinates,
      dropCoordinates,
      startStep: 2
    });
  };

  const commonDateFields = (
    <>
      <LineDate label="Pick Up Date" value={date} min={minDate} onChange={updateDate} />
      {tab === 'round-trip' && <LineDate label="Return Date" value={returnDate} min={date} onChange={updateReturnDate} />}
      <LineTime label="Pick Up Time" value={time} min={minTime} onChange={updateTime} />
    </>
  );

  return (
    <div id="book" className="relative z-10 mx-auto w-full max-w-[1500px] px-4">
      <div className="mx-auto max-w-[1425px] rounded-[18px] bg-white px-5 pb-6 pt-6 shadow-[0_18px_40px_rgba(15,23,42,0.24)] sm:rounded-[26px] sm:px-8 lg:px-10 xl:px-10">
        <div className="mx-auto grid h-11 max-w-[610px] grid-cols-4 overflow-hidden rounded border border-slate-400 text-center text-[12px] font-black uppercase sm:text-sm">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => changeTab(item.id)}
              className={`border-r border-slate-400 px-2 last:border-r-0 ${tab === item.id ? 'bg-sky-500 text-white' : 'bg-white text-slate-950 hover:bg-sky-50'}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-7 lg:mt-6">
          {tab === 'one-way' && (
            <div className="grid items-end gap-5 lg:grid-cols-[1fr_auto_1fr_1fr_1fr] xl:gap-8">
              <LineLocation label="From" value={pickup} setValue={setPickup} setCoordinates={setPickupCoordinates} showCurrentLocation />
              <SwapButton onClick={swapPlaces} />
              <LineLocation label="To" value={drop} setValue={setDrop} setCoordinates={setDropCoordinates} />
              {commonDateFields}
            </div>
          )}

          {tab === 'round-trip' && (
            <div className="grid items-end gap-5 lg:grid-cols-[1fr_auto_1fr_0.72fr_0.72fr_0.72fr] xl:gap-7">
              <LineLocation label="From" value={pickup} setValue={setPickup} setCoordinates={setPickupCoordinates} showCurrentLocation />
              <SwapButton onClick={swapPlaces} />
              <LineLocation label="To" value={drop} setValue={setDrop} setCoordinates={setDropCoordinates} />
              {commonDateFields}
            </div>
          )}

          {tab === 'local' && (
            <div className="grid items-end gap-7 md:grid-cols-3 xl:gap-9">
              <LineLocation label="City" value={pickup} setValue={setPickup} setCoordinates={setPickupCoordinates} showCurrentLocation />
              {commonDateFields}
            </div>
          )}

          {tab === 'airport' && (
            <div className="grid items-end gap-5 lg:grid-cols-[0.7fr_1.1fr_1.1fr_0.9fr_0.9fr] xl:gap-8">
              <LineSelect label="Trip" value={airportTrip} onChange={setAirportTrip} options={AIRPORT_TRIPS} />
              <LineLocation label="Pickup Address" value={pickup} setValue={setPickup} setCoordinates={setPickupCoordinates} showCurrentLocation />
              <LineLocation label={airportTrip === 'Pickup from Airport' ? 'Pickup Airport' : 'Drop Airport'} value={airport} setValue={setAirport} setCoordinates={setDropCoordinates} placeholder="Enter Airport" />
              {commonDateFields}
            </div>
          )}
        </div>

        <div className="pointer-events-none -mb-12 mt-7 flex justify-center lg:-mb-14">
          <Button onClick={explore} className="pointer-events-auto h-[58px] w-full max-w-[335px] rounded !bg-[#ff681f] text-xl font-black uppercase !text-white hover:!bg-[#f25f1b]">
            Explore Cabs
          </Button>
        </div>
      </div>
    </div>
  );
}

function SwapButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mx-auto hidden h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-sky-500 transition hover:bg-sky-50 lg:flex"
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
      placeholder={placeholder || (label === 'City' ? 'Enter City' : label === 'To' ? 'Enter Drop Location' : label === 'From' ? 'Enter Pickup Location' : `Enter ${label}`)}
      showCurrentLocation={showCurrentLocation}
      variant="line"
      className="min-w-0"
    />
  );
}

function LineDate({ label, value, min, onChange }) {
  return (
    <label className="relative block min-w-0">
      <span className="mb-2 block text-xl font-black uppercase tracking-wide text-slate-700">{label}</span>
      <span className="flex h-12 min-w-0 items-center gap-3 border-b border-slate-300 text-slate-950 focus-within:border-sky-500">
        <CalendarDays className="h-5 w-5 shrink-0 text-sky-500 lg:hidden" />
        <span className="min-w-0 flex-1 truncate text-base font-semibold text-black">{displayDate(value)}</span>
        <ChevronDown className="h-5 w-5 shrink-0 text-sky-500" />
      </span>
      <input type="date" value={value} min={min} onChange={(event) => onChange(event.target.value)} className="absolute inset-x-0 bottom-0 h-12 cursor-pointer opacity-0" />
    </label>
  );
}

function LineTime({ label, value, min, onChange }) {
  return (
    <label className="relative block min-w-0">
      <span className="mb-2 block text-xl font-black uppercase tracking-wide text-slate-700">{label}</span>
      <span className="flex h-12 min-w-0 items-center gap-3 border-b border-slate-300 text-slate-950 focus-within:border-sky-500">
        <Clock className="h-5 w-5 shrink-0 text-sky-500 lg:hidden" />
        <span className="min-w-0 flex-1 truncate text-base font-semibold text-black">{displayTime(value)}</span>
        <ChevronDown className="h-5 w-5 shrink-0 text-sky-500" />
      </span>
      <input type="time" value={value} min={min} onChange={(event) => onChange(event.target.value)} className="absolute inset-x-0 bottom-0 h-12 cursor-pointer opacity-0" />
    </label>
  );
}

function LineSelect({ label, value, onChange, options }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-xl font-black uppercase tracking-wide text-slate-700">{label}</span>
      <span className="flex h-12 min-w-0 items-center gap-3 border-b border-slate-300 text-slate-950 focus-within:border-sky-500">
        <Plane className="h-5 w-5 shrink-0 text-sky-500 lg:hidden" />
        <select value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent text-base font-semibold outline-none">
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
        <ChevronDown className="h-5 w-5 shrink-0 text-sky-500" />
      </span>
    </label>
  );
}

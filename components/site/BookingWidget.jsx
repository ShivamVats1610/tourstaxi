'use client';
import { useState } from 'react';
import { ArrowLeftRight, CalendarDays, ChevronDown, Plane, Plus, Trash2 } from 'lucide-react';
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
  const [date, setDate] = useState(todayValue());
  const [returnDate, setReturnDate] = useState(todayValue());
  const [time, setTime] = useState(nextPickupTimeValue());
  const [returnTime, setReturnTime] = useState('18:00');
  const [stops, setStops] = useState([]);
  const [stopCoordinates, setStopCoordinates] = useState([]);
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
          onChange={(value) => {
            const { nextDate, nextTime } = splitDateTime(value);
            updateReturnDate(nextDate);
            setReturnTime(nextTime);
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
            <div className="grid items-end gap-4 lg:grid-cols-[1fr_auto_1fr_290px] xl:gap-7">
              <LineLocation label="From" value={pickup} setValue={setPickup} setCoordinates={setPickupCoordinates} showCurrentLocation />
              <SwapButton onClick={swapPlaces} />
              <LineLocation label="To" value={drop} setValue={setDrop} setCoordinates={setDropCoordinates} />
              {commonDateFields}
            </div>
          )}

          {tab === 'round-trip' && (
            <div className="grid items-end gap-4 lg:grid-cols-[1fr_auto_1fr_230px_230px] xl:gap-6">
              <LineLocation label="From" value={pickup} setValue={setPickup} setCoordinates={setPickupCoordinates} showCurrentLocation />
              <SwapButton onClick={swapPlaces} />
              <LineLocation label="To" value={drop} setValue={setDrop} setCoordinates={setDropCoordinates} />
              {commonDateFields}
            </div>
          )}

          {tab === 'local' && (
            <div className="grid items-end gap-4 md:grid-cols-3 xl:gap-7">
              <LineLocation label="Pickup Location" value={pickup} setValue={setPickup} setCoordinates={setPickupCoordinates} showCurrentLocation />
              <LineLocation label="Drop Location" value={drop} setValue={setDrop} setCoordinates={setDropCoordinates} />
              {commonDateFields}
            </div>
          )}

          {tab === 'airport' && (
            <div className="grid items-end gap-4 lg:grid-cols-[220px_1fr_1fr_270px] xl:gap-7">
              <LineSelect label="Trip" value={airportTrip} onChange={setAirportTrip} options={AIRPORT_TRIPS} />
              <LineLocation label="Pickup Address" value={pickup} setValue={setPickup} setCoordinates={setPickupCoordinates} showCurrentLocation />
              <LineLocation label={airportTrip === 'Pickup from Airport' ? 'Pickup Airport' : 'Drop Airport'} value={airport} setValue={setAirport} setCoordinates={setDropCoordinates} placeholder="Enter Airport" />
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

function SwapButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mx-auto hidden h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-700 transition hover:bg-teal-100 lg:flex"
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

function LineDateTime({ label, date, time, minDate, minTime, onChange }) {
  const min = minDate ? dateTimeValue(minDate, minTime || '00:00') : undefined;
  return (
    <label className="relative block min-w-0">
      <span className="mb-1.5 block text-[13px] font-black uppercase tracking-wide text-slate-700 sm:text-sm">{label}</span>
      <span className="flex h-10 min-w-0 items-center gap-2.5 border-b border-slate-200 text-slate-950 focus-within:border-teal-600">
        <CalendarDays className="h-4 w-4 shrink-0 text-teal-700 lg:hidden" />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-black sm:text-base">{displayDate(date)} · {displayTime(time)}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-teal-700" />
      </span>
      <input type="datetime-local" value={dateTimeValue(date, time)} min={min} onChange={(event) => onChange(event.target.value)} className="absolute inset-x-0 bottom-0 h-10 cursor-pointer opacity-0" />
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

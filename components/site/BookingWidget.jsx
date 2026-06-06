'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Users, ArrowRight, Repeat, Timer, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBooking } from '@/lib/booking-context';

const TABS = [
  { id: 'one-way', label: 'One Way', icon: ArrowRight },
  { id: 'round-trip', label: 'Round Trip', icon: Repeat },
  { id: 'local', label: 'Local Rental', icon: Timer },
  { id: 'airport', label: 'Airport Transfer', icon: Plane }
];

const CITY_OPTIONS = [
  'Jaipur',
  'Jodhpur',
  'Udaipur',
  'Kota',
  'Ajmer',
  'Bikaner',
  'Jaisalmer',
  'Pushkar',
  'Mount Abu',
  'Sawai Madhopur',
  'Ranthambore',
  'Bharatpur',
  'Alwar',
  'Chittorgarh',
  'Bundi',
  'Sikar',
  'Jhunjhunu',
  'Neemrana',
  'Delhi',
  'New Delhi',
  'Gurugram',
  'Noida',
  'Agra'
];

export default function BookingWidget() {
  const [tab, setTab] = useState('one-way');
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [passengers, setPassengers] = useState('2 Passengers');
  const { open } = useBooking();

  const explore = () => open({ tripType: tab, pickup, drop, date, time, passengers, startStep: pickup && (tab === 'local' || drop) && date ? 2 : 1 });

  return (
    <div id="book" className="w-full max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl shadow-slate-900/20 overflow-hidden border border-white/40">
        <div className="flex flex-wrap border-b border-slate-200 bg-slate-50/50">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = t.id === tab;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className={`relative flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold transition-colors ${active ? 'text-sky-600' : 'text-slate-500 hover:text-slate-800'}`}>
                <Icon className="h-4 w-4" /> {t.label}
                {active && <motion.span layoutId="tab-underline" className="absolute inset-x-4 bottom-0 h-[3px] rounded-t-full bg-gradient-to-r from-sky-500 to-orange-500" />}
              </button>
            );
          })}
        </div>

        <div className="p-5 sm:p-6 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
          <Field icon={MapPin} label="Pickup Location" placeholder="Enter pickup city" value={pickup} onChange={setPickup} suggestions={CITY_OPTIONS} />
          {tab !== 'local' && <Field icon={MapPin} label="Drop Location" placeholder="Enter destination" value={drop} onChange={setDrop} suggestions={CITY_OPTIONS} />}
          {tab === 'local' && <Field icon={Timer} label="Rental Package" select options={['4 hrs / 40 km', '8 hrs / 80 km', '12 hrs / 120 km']} value={drop} onChange={setDrop} />}
          <Field icon={Calendar} label="Pickup Date" type="date" value={date} onChange={setDate} />
          <Field icon={Clock} label="Pickup Time" type="time" value={time} onChange={setTime} />
          <Field icon={Users} label="Passengers" select options={['1 Passenger', '2 Passengers', '3 Passengers', '4 Passengers', '5+ Passengers']} value={passengers} onChange={setPassengers} />
        </div>

        <div className="px-5 sm:px-6 pb-6">
          <Button onClick={explore} className="w-full h-12 text-base font-bold bg-gradient-to-r from-sky-500 to-orange-500 hover:opacity-95 shadow-lg shadow-sky-500/30">
            Explore Cabs <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs text-slate-500">
            <span>✓ Free cancellation</span><span>✓ Verified drivers</span><span>✓ Transparent pricing</span><span>✓ 24×7 support</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, placeholder, type = 'text', select = false, options = [], suggestions = [], value, onChange }) {
  const [focused, setFocused] = useState(false);
  const filteredSuggestions = suggestions
    .filter(city => city.toLowerCase().includes((value || '').trim().toLowerCase()))
    .slice(0, 6);
  const showSuggestions = !select && type === 'text' && focused && filteredSuggestions.length > 0;

  return (
    <div className="relative flex min-w-0 flex-col gap-1.5 group">
      <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">{label}</span>
      <div className="flex h-12 min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/15 transition-all">
        <Icon className="h-4 w-4 shrink-0 text-slate-400 group-focus-within:text-sky-500" />
        {select ? (
          <select value={value || ''} onChange={(e) => onChange?.(e.target.value)} className="min-w-0 flex-1 bg-transparent outline-none text-sm text-slate-800">
            <option value="">{placeholder || 'Select'}</option>
            {options.map(o => <option key={o}>{o}</option>)}
          </select>
        ) : (
          <input
            type={type}
            value={value}
            onFocus={() => setFocused(true)}
            onBlur={() => window.setTimeout(() => setFocused(false), 120)}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            className="min-w-0 flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
          />
        )}
      </div>
      {showSuggestions && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
          {filteredSuggestions.map(city => (
            <button
              key={city}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange?.(city);
                setFocused(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-sky-50 hover:text-sky-700"
            >
              <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

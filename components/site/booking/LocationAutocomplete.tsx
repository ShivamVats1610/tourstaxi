'use client';

import { useEffect, useState } from 'react';
import { Crosshair, Loader2, MapPin, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import type { LocationResult } from './types';

type LocationAutocompleteProps = {
  label: string;
  value: string;
  placeholder?: string;
  onValueChange: (value: string) => void;
  onSelect: (location: LocationResult) => void;
  showCurrentLocation?: boolean;
  className?: string;
  variant?: 'line' | 'boxed';
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

type PlacePrediction = {
  id?: string;
  mainText?: string;
  secondaryText?: string;
  description?: string;
  coordinates?: [number, number];
};

export default function LocationAutocomplete({
  label,
  value,
  placeholder = 'Search location',
  onValueChange,
  onSelect,
  showCurrentLocation = false,
  className = '',
  variant = 'line'
}: LocationAutocompleteProps) {
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!focused || value.trim().length < 2) return;

    let active = true;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const url = new URL('/api/places', window.location.origin);
        url.searchParams.set('input', value);
        const response = await fetch(url);
        const data = await response.json();
        const places = Array.isArray(data.predictions)
          ? data.predictions.map((place: PlacePrediction) => ({
              id: String(place.id || place.description),
              label: place.description || `${place.mainText || ''} ${place.secondaryText || ''}`.trim(),
              name: place.mainText || place.description || '',
              address: place.secondaryText || place.description || '',
              coordinates: [Number(place.coordinates?.[0]), Number(place.coordinates?.[1])] as [number, number]
            })).filter((item: LocationResult) => Number.isFinite(item.coordinates[0]) && Number.isFinite(item.coordinates[1]))
          : [];
        if (active) setSuggestions(places);
      } catch {
        if (active) setSuggestions([]);
      } finally {
        if (active) setLoading(false);
      }
    }, 180);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [focused, value]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        const result = {
          id: `${longitude},${latitude}`,
          label: 'Current Location',
          name: 'Current Location',
          address: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
          coordinates: [longitude, latitude] as [number, number]
        };
        onValueChange(result.label);
        onSelect(result);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const showSuggestions = focused && value.trim().length >= 2 && suggestions.length > 0;

  const boxed = variant === 'boxed';

  return (
    <label className={`relative block min-w-0 ${className}`}>
      <span className={boxed ? 'mb-0 block text-xs font-black uppercase tracking-wide text-sky-500' : 'mb-2 block text-xl font-black uppercase tracking-wide text-slate-700'}>{label}</span>
      <span className={boxed ? 'mt-1 flex h-9 min-w-0 items-center gap-3 text-slate-950' : 'flex h-12 min-w-0 items-center gap-3 border-b border-slate-300 text-slate-950 focus-within:border-sky-500'}>
        <MapPin className={boxed ? 'h-6 w-6 shrink-0 text-slate-400' : 'h-5 w-5 shrink-0 text-slate-500'} />
        <input
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 140)}
          placeholder={placeholder}
          className={boxed ? 'min-w-0 flex-1 bg-transparent text-[22px] font-normal leading-none text-slate-500 outline-none placeholder:text-slate-400 sm:text-base sm:font-semibold' : 'min-w-0 flex-1 bg-transparent text-base font-semibold outline-none placeholder:text-slate-400'}
        />
        {loading ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-400" /> : <Search className="h-4 w-4 shrink-0 text-slate-400" />}
        {showCurrentLocation && (
          <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={useCurrentLocation} className="rounded-full p-1 text-sky-600 hover:bg-sky-50" aria-label="Use current location">
            {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
          </button>
        )}
      </span>
      {!MAPBOX_TOKEN && focused && (
        <div className="absolute left-0 top-full z-40 mt-1 w-full rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 shadow">
          Add NEXT_PUBLIC_MAPBOX_TOKEN to enable Mapbox search.
        </div>
      )}
      {showSuggestions && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="absolute left-0 top-full z-40 mt-1 max-h-80 w-full overflow-y-auto rounded-md border border-slate-200 bg-white shadow-2xl">
          {suggestions.map((place) => (
            <button
              key={place.id}
              type="button"
              onMouseDown={() => {
                onValueChange(place.label);
                onSelect(place);
              }}
              className="block w-full px-3 py-3 text-left text-sm hover:bg-sky-50"
            >
              <b className="text-sky-600">{place.name}</b>
              <span className="ml-1 text-slate-500">{place.address}</span>
            </button>
          ))}
        </motion.div>
      )}
    </label>
  );
}

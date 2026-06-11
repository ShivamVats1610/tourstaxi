'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Route } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Coordinates, FareDetails, RouteDetails, VehicleClass } from './types';

type FareCalculatorProps = {
  pickupCoordinates?: Coordinates | null;
  dropCoordinates?: Coordinates | null;
  pickupLabel?: string;
  dropLabel?: string;
  vehicleClass?: VehicleClass;
  onRouteChange?: (route: RouteDetails | null) => void;
  onFareChange?: (fare: FareDetails | null) => void;
  compact?: boolean;
};

const BASE_FARE = 250;
const RATES: Record<VehicleClass, number> = {
  sedan: 14,
  suv: 18,
  'innova-crysta': 22,
  'tempo-traveller': 28
};

export function vehicleClassFromName(name = ''): VehicleClass {
  const value = name.toLowerCase();
  if (value.includes('tempo')) return 'tempo-traveller';
  if (value.includes('crysta')) return 'innova-crysta';
  if (value.includes('innova') || value.includes('ertiga') || value.includes('hycross') || value.includes('suv')) return 'suv';
  return 'sedan';
}

export function calculateFare(distanceKm: number, vehicleClass: VehicleClass = 'sedan'): FareDetails {
  const ratePerKm = RATES[vehicleClass];
  const distanceFare = Math.round(distanceKm * ratePerKm);
  return {
    baseFare: BASE_FARE,
    ratePerKm,
    distanceFare,
    totalFare: BASE_FARE + distanceFare
  };
}

export default function FareCalculator({
  pickupCoordinates,
  dropCoordinates,
  pickupLabel = '',
  dropLabel = '',
  vehicleClass = 'sedan',
  onRouteChange,
  onFareChange,
  compact = false
}: FareCalculatorProps) {
  const [route, setRoute] = useState<RouteDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hasCoordinates = Boolean(pickupCoordinates && dropCoordinates);
    const hasLabels = Boolean(pickupLabel.trim() && dropLabel.trim());

    if (!hasCoordinates && !hasLabels) {
      queueMicrotask(() => {
        setRoute(null);
        onRouteChange?.(null);
        onFareChange?.(null);
      });
      return;
    }

    let active = true;
    const loadRoute = async () => {
      setLoading(true);
      try {
        const url = new URL('/api/distance', window.location.origin);
        if (pickupCoordinates && dropCoordinates) {
          url.searchParams.set('fromLng', String(pickupCoordinates[0]));
          url.searchParams.set('fromLat', String(pickupCoordinates[1]));
          url.searchParams.set('toLng', String(dropCoordinates[0]));
          url.searchParams.set('toLat', String(dropCoordinates[1]));
        } else {
          url.searchParams.set('origin', pickupLabel);
          url.searchParams.set('destination', dropLabel);
        }

        const response = await fetch(url);
        const data = await response.json();
        if (!response.ok || !Number.isFinite(Number(data.distanceKm))) throw new Error(data.error || 'Route not found');

        const nextRoute: RouteDetails = {
          distanceKm: Number(data.distanceKm),
          durationMinutes: Number(data.durationMinutes || 0),
          geometry: data.geometry || null
        };
        if (!active) return;
        setRoute(nextRoute);
        onRouteChange?.(nextRoute);
        onFareChange?.(calculateFare(nextRoute.distanceKm, vehicleClass));
      } catch {
        if (active) {
          setRoute(null);
          onRouteChange?.(null);
          onFareChange?.(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadRoute();
    return () => {
      active = false;
    };
  }, [pickupCoordinates, dropCoordinates, pickupLabel, dropLabel, vehicleClass, onRouteChange, onFareChange]);

  const fare = useMemo(() => route ? calculateFare(route.distanceKm, vehicleClass) : null, [route, vehicleClass]);

  if (compact) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-black text-slate-900">
          <Route className="h-5 w-5 text-sky-500" />
          Route Fare
        </div>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
      </div>

      {route && fare ? (
        <div className="mt-3 grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
          <div><b className="block text-lg text-slate-950">{route.distanceKm} km</b>Distance</div>
          <div><b className="block text-lg text-slate-950">{route.durationMinutes} min</b>Estimated time</div>
          <div><b className="block text-lg text-sky-600">₹{fare.totalFare.toLocaleString('en-IN')}</b>Total fare</div>
        </div>
      ) : (
        <div className="mt-3 text-sm text-slate-500">
          Select pickup and drop locations to calculate distance, duration and fare.
        </div>
      )}
    </motion.div>
  );
}

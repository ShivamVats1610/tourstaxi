'use client';

import { useEffect, useState } from 'react';
import { Loader2, Route } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Coordinates, FareDetails, RouteDetails, VehicleClass } from './types';

type FareCalculatorProps = {
  pickupCoordinates?: Coordinates | null;
  dropCoordinates?: Coordinates | null;
  stopCoordinates?: Coordinates[];
  pickupLabel?: string;
  dropLabel?: string;
  stopLabels?: string[];
  vehicleClass?: VehicleClass;
  onRouteChange?: (route: RouteDetails | null) => void;
  onFareChange?: (fare: FareDetails | null) => void;
  compact?: boolean;
};

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
  const chargeableDistance = Math.max(Number(distanceKm || 0), 250);
  const distanceFare = Math.round(chargeableDistance * ratePerKm);
  return {
    baseFare: 0,
    ratePerKm,
    distanceFare,
    totalFare: distanceFare
  };
}

export default function FareCalculator({
  pickupCoordinates,
  dropCoordinates,
  stopCoordinates = [],
  pickupLabel = '',
  dropLabel = '',
  stopLabels = [],
  vehicleClass = 'sedan',
  onRouteChange,
  onFareChange,
  compact = false
}: FareCalculatorProps) {
  const [route, setRoute] = useState<RouteDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [serviceMessage, setServiceMessage] = useState('');
  const stopCoordinateKey = stopCoordinates.map((coordinates) => coordinates?.join(',')).join('|');
  const stopLabelKey = stopLabels.join('|');

  useEffect(() => {
    const stableStopCoordinates = stopCoordinateKey
      ? stopCoordinateKey.split('|').map((item) => item.split(',').map(Number) as Coordinates).filter((coordinates) => coordinates.length === 2 && coordinates.every(Number.isFinite))
      : [];
    const stableStopLabels = stopLabelKey ? stopLabelKey.split('|').filter(Boolean) : [];
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
          stableStopCoordinates.filter(Boolean).forEach((coordinates) => {
            url.searchParams.append('waypoint', `${coordinates[0]},${coordinates[1]}`);
          });
        } else {
          url.searchParams.set('origin', pickupLabel);
          url.searchParams.set('destination', dropLabel);
          stableStopLabels.filter(Boolean).forEach((label) => url.searchParams.append('stop', label));
        }

        console.info('[mapbox:browser:route:request]', {
          hasCoordinates: Boolean(pickupCoordinates && dropCoordinates),
          hasLabels: Boolean(pickupLabel && dropLabel),
          stops: stableStopCoordinates.length || stableStopLabels.length
        });
        const response = await fetch(url);
        const contentType = response.headers.get('content-type') || '';
        const data = contentType.includes('application/json')
          ? await response.json()
          : { error: 'route-api-unavailable', userMessage: 'Route service is temporarily unavailable.' };
        console.info('[mapbox:browser:route:response]', {
          ok: response.ok,
          status: response.status,
          source: data.source,
          error: data.error,
          warning: data.warning,
          tokenExists: data.tokenStatus?.exists
        });

        if (response.status === 401 || response.status === 403 || data.mapboxError?.permissionIssue) {
          setServiceMessage(data.mapboxError?.userMessage || 'Mapbox rejected the route token.');
        } else if (data.error === 'missing-mapbox-token') {
          setServiceMessage(data.userMessage || 'Route calculation is using fallback data because Mapbox is not configured.');
        } else if (data.warning) {
          setServiceMessage(`Using estimated route: ${data.warning}`);
        } else {
          setServiceMessage('');
        }

        if (!response.ok || !Number.isFinite(Number(data.distanceKm))) throw new Error(data.userMessage || data.error || 'Route not found');

        const nextRoute: RouteDetails = {
          distanceKm: Number(data.distanceKm),
          durationMinutes: Number(data.durationMinutes || 0),
          geometry: data.geometry || null
        };
        if (!active) return;
        setRoute(nextRoute);
        onRouteChange?.(nextRoute);
        onFareChange?.(null);
      } catch (error) {
        console.warn('[mapbox:browser:route:fallback]', error);
        setServiceMessage(error instanceof Error ? error.message : 'Route calculation is temporarily unavailable.');
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
  }, [pickupCoordinates, dropCoordinates, stopCoordinateKey, pickupLabel, dropLabel, stopLabelKey, vehicleClass, onRouteChange, onFareChange]);

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

      {route ? (
        <div className="mt-3 grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
          <div><b className="block text-lg text-slate-950">{route.distanceKm} km</b>Distance</div>
          <div><b className="block text-lg text-slate-950">{route.durationMinutes} min</b>Estimated time</div>
          <div><b className="block text-lg text-sky-600">Select cab</b>Fare updates by vehicle</div>
        </div>
      ) : (
        <div className="mt-3 text-sm text-slate-500">
          {serviceMessage || 'Select pickup and drop locations to calculate distance, duration and fare.'}
        </div>
      )}
    </motion.div>
  );
}

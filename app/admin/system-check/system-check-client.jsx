'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Loader2, RefreshCw, TriangleAlert, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TEST_FROM = [75.7873, 26.9124];
const TEST_TO = [75.8513, 26.9855];

export default function SystemCheckClient() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [clientChecks, setClientChecks] = useState({});

  const runChecks = async () => {
    setLoading(true);
    setClientChecks({});
    try {
      const [system, autocomplete, distance] = await Promise.all([
        fetchJson('/api/system-check'),
        fetchJson('/api/places?input=Jaipur'),
        fetchJson(`/api/distance?fromLng=${TEST_FROM[0]}&fromLat=${TEST_FROM[1]}&toLng=${TEST_TO[0]}&toLat=${TEST_TO[1]}`)
      ]);

      const fareOk = Number.isFinite(Number(distance.data?.distanceKm)) && Number(distance.data?.distanceKm) > 0;
      setReport({
        system: system.data,
        autocomplete,
        distance,
        fare: {
          ok: fareOk,
          message: fareOk ? `Fare can be calculated from ${distance.data.distanceKm} km.` : 'Fare cannot be calculated because distance is unavailable.'
        }
      });
    } catch (error) {
      setReport({ error: error instanceof Error ? error.message : 'System check failed.' });
    } finally {
      setLoading(false);
    }

    runGeolocationCheck(setClientChecks);
  };

  useEffect(() => {
    const timer = window.setTimeout(runChecks, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const rows = useMemo(() => buildRows(report, clientChecks), [report, clientChecks]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">System Check</h1>
            <p className="mt-1 text-sm text-slate-600">Production Mapbox diagnostics for booking search, routes, distance, and fares.</p>
          </div>
          <Button onClick={runChecks} disabled={loading} className="gap-2 bg-sky-600 hover:bg-sky-700">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Run Checks
          </Button>
        </div>

        {report?.error && (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 font-semibold text-red-700">{report.error}</div>
        )}

        <div className="mt-6 grid gap-3">
          {rows.map((row) => (
            <StatusRow key={row.label} {...row} />
          ))}
        </div>

        <pre className="mt-6 overflow-auto rounded-md border border-slate-200 bg-white p-4 text-xs text-slate-700">
          {JSON.stringify({ report, clientChecks }, null, 2)}
        </pre>
      </div>
    </main>
  );
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: 'no-store' });
  const data = await response.json().catch(() => ({}));
  console.info('[mapbox:system-check:browser]', { url, ok: response.ok, status: response.status, data });
  return { ok: response.ok, status: response.status, data };
}

function buildRows(report, clientChecks) {
  const system = report?.system;
  const token = system?.environment?.NEXT_PUBLIC_MAPBOX_TOKEN;
  const autocomplete = report?.autocomplete;
  const distance = report?.distance;

  return [
    {
      label: 'Environment variable status',
      ok: Boolean(token?.exists),
      message: token?.exists ? `Loaded at runtime, length ${token.length}, prefix ${token.prefix}` : 'NEXT_PUBLIC_MAPBOX_TOKEN is missing at runtime.'
    },
    {
      label: 'Mapbox token status',
      ok: Boolean(token?.exists && token?.looksPublic),
      message: token?.looksPublic ? 'Token format looks like a public Mapbox token.' : 'Token should start with pk. and must be available during build and runtime.'
    },
    serviceRow('Geocoding test result', system?.mapbox?.geocoding),
    serviceRow('Directions API test result', system?.mapbox?.directions),
    serviceRow('Route API test result', system?.mapbox?.route),
    {
      label: 'Pickup autocomplete',
      ok: Boolean(autocomplete?.ok && autocomplete.data?.predictions?.length),
      message: autocomplete?.data?.error || `${autocomplete?.data?.predictions?.length || 0} suggestions returned from ${autocomplete?.data?.source || 'unknown'}.`
    },
    {
      label: 'Drop autocomplete',
      ok: Boolean(autocomplete?.ok && autocomplete.data?.predictions?.length),
      message: autocomplete?.data?.error || 'Uses the same /api/places endpoint as pickup autocomplete.'
    },
    {
      label: 'Distance calculation',
      ok: Boolean(distance?.ok && Number(distance.data?.distanceKm) > 0),
      message: distance?.data?.error || distance?.data?.distanceText || 'No distance returned.'
    },
    {
      label: 'Travel time estimation',
      ok: Boolean(distance?.ok && Number(distance.data?.durationMinutes) > 0),
      message: distance?.data?.durationText || 'No duration returned.'
    },
    {
      label: 'Route visualization',
      ok: Boolean(distance?.data?.geometry?.coordinates?.length),
      message: distance?.data?.geometry?.coordinates?.length ? `${distance.data.geometry.coordinates.length} geometry points available.` : 'No route geometry returned.'
    },
    {
      label: 'Fare calculation',
      ok: Boolean(report?.fare?.ok),
      message: report?.fare?.message || 'Waiting for distance test.'
    },
    {
      label: 'Browser geolocation test',
      ok: clientChecks.geolocation?.ok,
      pending: clientChecks.geolocation?.pending,
      message: clientChecks.geolocation?.message || 'Waiting for browser geolocation result.'
    },
    {
      label: 'Production deployment status',
      ok: Boolean(system?.deployment),
      message: system?.deployment ? `${system.deployment.origin} / NODE_ENV=${system.deployment.nodeEnv}` : 'Deployment data unavailable.'
    }
  ];
}

function serviceRow(label, result) {
  return {
    label,
    ok: Boolean(result?.ok),
    message: result?.message || result?.userMessage || result?.code || 'Not checked.'
  };
}

function StatusRow({ label, ok, pending, message }) {
  const Icon = pending ? Loader2 : ok ? CheckCircle2 : XCircle;
  const color = pending ? 'text-slate-500' : ok ? 'text-emerald-600' : 'text-red-600';

  return (
    <div className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${color} ${pending ? 'animate-spin' : ''}`} />
      <div className="min-w-0">
        <div className="font-black">{label}</div>
        <div className="mt-1 text-sm text-slate-600">{message}</div>
      </div>
      {!ok && !pending && <TriangleAlert className="ml-auto h-5 w-5 shrink-0 text-amber-500" />}
    </div>
  );
}

function runGeolocationCheck(setClientChecks) {
  setClientChecks((current) => ({
    ...current,
    geolocation: { pending: true, ok: false, message: 'Waiting for browser permission.' }
  }));

  if (!navigator.geolocation) {
    setClientChecks((current) => ({
      ...current,
      geolocation: { ok: false, message: 'Browser geolocation is not supported.' }
    }));
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      setClientChecks((current) => ({
        ...current,
        geolocation: {
          ok: true,
          message: `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`
        }
      }));
    },
    (error) => {
      setClientChecks((current) => ({
        ...current,
        geolocation: { ok: false, message: `${error.code}: ${error.message}` }
      }));
    },
    { enableHighAccuracy: true, timeout: 12000 }
  );
}

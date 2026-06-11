import { fallbackDistanceKm, findFallbackPlace } from '@/lib/location-fallback';

const MAPBOX_GEOCODE_URL = 'https://api.mapbox.com/search/geocode/v6/forward';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin')?.trim() || '';
  const destination = searchParams.get('destination')?.trim() || '';
  const from = parseCoordinates(searchParams.get('fromLng'), searchParams.get('fromLat'));
  const to = parseCoordinates(searchParams.get('toLng'), searchParams.get('toLat'));
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if ((!from || !to) && (!origin || !destination)) {
    return Response.json({ distanceKm: null, source: 'missing' }, { status: 400 });
  }

  if (!token) {
    const fallback = estimateFallbackRoute(origin, destination, from, to, 'missing-mapbox-token');
    return fallback
      ? Response.json(fallback)
      : Response.json({ distanceKm: null, source: 'missing-mapbox-token', error: 'route-not-found' }, { status: 404 });
  }

  try {
    const [routeFrom, routeTo] = from && to ? [from, to] : await Promise.all([geocode(origin, token), geocode(destination, token)]);
    if (!routeFrom || !routeTo) {
      const fallback = estimateFallbackRoute(origin, destination, from, to, 'location-not-found');
      return fallback
        ? Response.json(fallback)
        : Response.json({ distanceKm: null, source: 'mapbox', error: 'location-not-found' }, { status: 404 });
    }

    const coords = `${routeFrom[0]},${routeFrom[1]};${routeTo[0]},${routeTo[1]}`;
    const url = new URL(`https://api.mapbox.com/directions/v5/mapbox/driving/${coords}`);
    url.searchParams.set('geometries', 'geojson');
    url.searchParams.set('overview', 'full');
    url.searchParams.set('alternatives', 'false');
    url.searchParams.set('steps', 'false');
    url.searchParams.set('radiuses', 'unlimited;unlimited');
    url.searchParams.set('access_token', token);

    const response = await fetch(url, { cache: 'no-store' });
    const data = await response.json();
    const route = data.routes?.[0];

    if (!response.ok || !route) {
      const fallback = estimateFallbackRoute(origin, destination, from, to, data.message || 'route-not-found');
      return Response.json(fallback || estimateRoute(routeFrom, routeTo, data.message || 'route-not-found'));
    }

    const distanceKm = Number((route.distance / 1000).toFixed(1));
    const durationMinutes = Math.round(route.duration / 60);

    if (distanceKm <= 0 && origin && destination) {
      const fallback = estimateFallbackRoute(origin, destination, from, to, 'zero-distance-route');
      if (fallback) return Response.json(fallback);
    }

    return Response.json({
      distanceKm,
      distanceText: `${distanceKm} km`,
      durationMinutes,
      durationText: formatDuration(durationMinutes),
      geometry: route.geometry || null,
      source: 'mapbox'
    });
  } catch {
    const fallback = estimateFallbackRoute(origin, destination, from, to, 'mapbox-request-failed');
    return fallback
      ? Response.json(fallback)
      : Response.json({ distanceKm: null, source: 'mapbox', error: 'mapbox-request-failed' }, { status: 502 });
  }
}

function parseCoordinates(lng, lat) {
  const longitude = Number(lng);
  const latitude = Number(lat);
  return usableCoordinates(longitude, latitude) ? [longitude, latitude] : null;
}

async function geocode(query, token) {
  const url = new URL(MAPBOX_GEOCODE_URL);
  url.searchParams.set('q', query);
  url.searchParams.set('country', 'in');
  url.searchParams.set('limit', '1');
  url.searchParams.set('access_token', token);

  const response = await fetch(url, { cache: 'no-store' });
  const data = await response.json();
  return normalizeCoordinates(data.features?.[0]);
}

function normalizeCoordinates(feature) {
  const coordinates = feature?.geometry?.coordinates || feature?.properties?.coordinates;
  if (Array.isArray(coordinates)) {
    const longitude = Number(coordinates[0]);
    const latitude = Number(coordinates[1]);
    return usableCoordinates(longitude, latitude) ? [longitude, latitude] : null;
  }

  const longitude = Number(coordinates?.longitude);
  const latitude = Number(coordinates?.latitude);
  return usableCoordinates(longitude, latitude) ? [longitude, latitude] : null;
}

function usableCoordinates(longitude, latitude) {
  return Number.isFinite(longitude)
    && Number.isFinite(latitude)
    && Math.abs(longitude) <= 180
    && Math.abs(latitude) <= 90
    && !(longitude === 0 && latitude === 0);
}

function formatDuration(minutes) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hrs) return `${mins} min`;
  return `${hrs} hr${hrs > 1 ? 's' : ''}${mins ? ` ${mins} min` : ''}`;
}

function estimateRoute(from, to, reason) {
  const distanceKm = Number((haversineKm(from, to) * 1.28).toFixed(1));
  const durationMinutes = Math.max(Math.round((distanceKm / 52) * 60), 1);

  return {
    distanceKm,
    distanceText: `${distanceKm} km`,
    durationMinutes,
    durationText: formatDuration(durationMinutes),
    geometry: { type: 'LineString', coordinates: [from, to] },
    source: 'mapbox-estimate',
    warning: reason
  };
}

function estimateFallbackRoute(origin, destination, from, to, reason) {
  if (from && to) return estimateRoute(from, to, reason);

  const distanceKm = fallbackDistanceKm(origin, destination);
  if (!distanceKm) return null;

  const routeFrom = fallbackCoordinates(origin);
  const routeTo = fallbackCoordinates(destination);
  const durationMinutes = Math.max(Math.round((distanceKm / 52) * 60), 1);

  return {
    distanceKm,
    distanceText: `${distanceKm} km`,
    durationMinutes,
    durationText: formatDuration(durationMinutes),
    geometry: routeFrom && routeTo ? { type: 'LineString', coordinates: [routeFrom, routeTo] } : null,
    source: 'fallback',
    warning: reason
  };
}

function fallbackCoordinates(value) {
  const place = findFallbackPlace(value);
  return place ? [place.lng, place.lat] : null;
}

function haversineKm(from, to) {
  const earthRadiusKm = 6371;
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(to[1] - from[1]);
  const dLng = toRad(to[0] - from[0]);
  const lat1 = toRad(from[1]);
  const lat2 = toRad(to[1]);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

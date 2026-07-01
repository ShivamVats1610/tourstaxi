import { fallbackDistanceKm, findFallbackPlace } from '@/lib/location-fallback';
import { buildDirectionsUrl, buildGeocodeUrl, fetchMapboxJson, getMapboxToken, logMapboxEvent, mapboxTokenStatus } from '@/lib/mapbox';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin')?.trim() || '';
  const destination = searchParams.get('destination')?.trim() || '';
  const from = parseCoordinates(searchParams.get('fromLng'), searchParams.get('fromLat'));
  const to = parseCoordinates(searchParams.get('toLng'), searchParams.get('toLat'));
  const waypointCoordinates = parseWaypointCoordinates(searchParams.getAll('waypoint'));
  const waypointLabels = searchParams.getAll('stop').map((item) => item.trim()).filter(Boolean);
  const token = getMapboxToken();
  logMapboxEvent('route:request', {
    hasOrigin: Boolean(origin),
    hasDestination: Boolean(destination),
    hasCoordinates: Boolean(from && to)
  });

  if ((!from || !to) && (!origin || !destination)) {
    return Response.json({ distanceKm: null, source: 'missing', error: 'missing-route-input', tokenStatus: mapboxTokenStatus() }, { status: 400 });
  }

  if (!token) {
    logMapboxEvent('route:missing-token');
    const fallback = estimateFallbackRoute(origin, destination, from, to, 'missing-mapbox-token');
    return fallback
      ? Response.json({ ...fallback, tokenStatus: mapboxTokenStatus() })
      : Response.json({
          distanceKm: null,
          source: 'missing-mapbox-token',
          error: 'route-not-found',
          userMessage: 'Distance calculation needs NEXT_PUBLIC_MAPBOX_TOKEN in production.',
          tokenStatus: mapboxTokenStatus()
        }, { status: 404 });
  }

  try {
    const [routeFrom, routeTo, routeWaypoints] = from && to
      ? [from, to, waypointCoordinates]
      : await Promise.all([
          geocode(origin, token),
          geocode(destination, token),
          Promise.all(waypointLabels.map((label) => geocode(label, token)))
        ]);
    if (!routeFrom || !routeTo) {
      const fallback = estimateFallbackRoute(origin, destination, from, to, 'location-not-found');
      return fallback
        ? Response.json(fallback)
        : Response.json({ distanceKm: null, source: 'mapbox', error: 'location-not-found' }, { status: 404 });
    }

    const usableWaypoints = (routeWaypoints || []).filter(Boolean);
    const result = await fetchMapboxJson(buildDirectionsUrl(routeFrom, routeTo, token, usableWaypoints), 'route');
    if (!result.ok) {
      const fallback = estimateFallbackRoute(origin, destination, from, to, result.error.message);
      const body = fallback || estimateRouteWithStops(routeFrom, routeTo, usableWaypoints, result.error.message);
      return Response.json({
        ...body,
        source: fallback?.source || 'mapbox-estimate',
        error: result.error.code,
        mapboxError: result.error,
        tokenStatus: mapboxTokenStatus()
      }, { status: result.error.permissionIssue ? result.error.status : 200 });
    }

    const data = result.data;
    const route = data.routes?.[0];

    if (!route) {
      const fallback = estimateFallbackRoute(origin, destination, from, to, data.message || 'route-not-found');
      return Response.json({
        ...(fallback || estimateRouteWithStops(routeFrom, routeTo, usableWaypoints, data.message || 'route-not-found')),
        tokenStatus: mapboxTokenStatus()
      });
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
      source: 'mapbox',
      tokenStatus: mapboxTokenStatus()
    });
  } catch (error) {
    logMapboxEvent('route:exception', { message: error?.message || 'Unknown error' });
    const fallback = estimateFallbackRoute(origin, destination, from, to, 'mapbox-request-failed');
    return fallback
      ? Response.json({ ...fallback, tokenStatus: mapboxTokenStatus() })
      : Response.json({
          distanceKm: null,
          source: 'mapbox',
          error: 'mapbox-request-failed',
          userMessage: 'Route calculation could not reach Mapbox.',
          tokenStatus: mapboxTokenStatus()
        }, { status: 502 });
  }
}

function parseCoordinates(lng, lat) {
  const longitude = Number(lng);
  const latitude = Number(lat);
  return usableCoordinates(longitude, latitude) ? [longitude, latitude] : null;
}

function parseWaypointCoordinates(values) {
  return values.map((value) => {
    const [lng, lat] = String(value || '').split(',').map(Number);
    return usableCoordinates(lng, lat) ? [lng, lat] : null;
  }).filter(Boolean);
}

async function geocode(query, token) {
  const result = await fetchMapboxJson(buildGeocodeUrl(query, token, '1'), 'route:geocode');
  if (!result.ok) return null;
  return normalizeCoordinates(result.data.features?.[0]);
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

function estimateRouteWithStops(from, to, waypoints = [], reason) {
  const points = [from, ...waypoints, to];
  let distanceKm = 0;
  for (let index = 0; index < points.length - 1; index += 1) {
    distanceKm += haversineKm(points[index], points[index + 1]) * 1.28;
  }
  distanceKm = Number(distanceKm.toFixed(1));
  const durationMinutes = Math.max(Math.round((distanceKm / 52) * 60), 1);
  return {
    distanceKm,
    distanceText: `${distanceKm} km`,
    durationMinutes,
    durationText: formatDuration(durationMinutes),
    geometry: { type: 'LineString', coordinates: points },
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

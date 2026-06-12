const MAPBOX_GEOCODE_URL = 'https://api.mapbox.com/search/geocode/v6/forward';
const MAPBOX_DIRECTIONS_URL = 'https://api.mapbox.com/directions/v5/mapbox/driving';

export function getMapboxToken() {
  return process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
}

export function mapboxTokenStatus() {
  const token = getMapboxToken();
  return {
    exists: Boolean(token),
    length: token.length,
    prefix: token ? token.slice(0, 8) : '',
    suffix: token ? token.slice(-4) : '',
    looksPublic: token.startsWith('pk.'),
    nodeEnv: process.env.NODE_ENV || 'unknown'
  };
}

export function logMapboxEvent(event, details = {}) {
  const status = mapboxTokenStatus();
  console.info(`[mapbox:${event}]`, {
    ...details,
    tokenExists: status.exists,
    tokenLength: status.length,
    tokenPrefix: status.prefix,
    tokenLooksPublic: status.looksPublic,
    nodeEnv: status.nodeEnv
  });
}

export function mapboxErrorFromResponse(response, data) {
  const message = data?.message || data?.error || response.statusText || 'Mapbox request failed';
  const permissionIssue = response.status === 401 || response.status === 403;
  return {
    status: response.status,
    statusText: response.statusText,
    code: permissionIssue ? 'mapbox-token-permission-or-auth-error' : 'mapbox-api-error',
    message,
    permissionIssue,
    userMessage: permissionIssue
      ? 'Mapbox rejected the production token. Check token scopes, URL restrictions, and that Hostinger was redeployed after updating the token.'
      : 'Mapbox could not complete the request. Please try again.'
  };
}

export async function fetchMapboxJson(url, context) {
  const response = await fetch(url, { cache: 'no-store' });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = mapboxErrorFromResponse(response, data);
    logMapboxEvent(`${context}:error`, error);
    return { ok: false, response, data, error };
  }

  logMapboxEvent(`${context}:success`, { status: response.status });
  return { ok: true, response, data };
}

export function buildGeocodeUrl(query, token, limit = '5') {
  const url = new URL(MAPBOX_GEOCODE_URL);
  url.searchParams.set('q', query);
  url.searchParams.set('country', 'in');
  url.searchParams.set('limit', limit);
  url.searchParams.set('access_token', token);
  return url;
}

export function buildDirectionsUrl(from, to, token) {
  const coords = `${from[0]},${from[1]};${to[0]},${to[1]}`;
  const url = new URL(`${MAPBOX_DIRECTIONS_URL}/${coords}`);
  url.searchParams.set('geometries', 'geojson');
  url.searchParams.set('overview', 'full');
  url.searchParams.set('alternatives', 'false');
  url.searchParams.set('steps', 'false');
  url.searchParams.set('radiuses', 'unlimited;unlimited');
  url.searchParams.set('access_token', token);
  return url;
}

export async function runMapboxHealthChecks() {
  const token = getMapboxToken();
  const tokenStatus = mapboxTokenStatus();

  if (!token) {
    return {
      tokenStatus,
      geocoding: missingTokenResult('Geocoding'),
      directions: missingTokenResult('Directions'),
      route: missingTokenResult('Route')
    };
  }

  logMapboxEvent('system-check:start');
  const geocoding = await testGeocoding(token);
  const directions = await testDirections(token);

  return {
    tokenStatus,
    geocoding,
    directions,
    route: directions
  };
}

function missingTokenResult(service) {
  return {
    ok: false,
    service,
    code: 'missing-mapbox-token',
    message: 'NEXT_PUBLIC_MAPBOX_TOKEN is missing at runtime.',
    userMessage: 'Add NEXT_PUBLIC_MAPBOX_TOKEN in Hostinger and redeploy the app.'
  };
}

async function testGeocoding(token) {
  const result = await fetchMapboxJson(buildGeocodeUrl('Jaipur Railway Station', token, '1'), 'system-check:geocoding');
  if (!result.ok) return { ok: false, service: 'Geocoding', ...result.error };

  const feature = result.data.features?.[0];
  return {
    ok: Boolean(feature),
    service: 'Geocoding',
    status: result.response.status,
    message: feature ? `Resolved ${feature.properties?.full_address || feature.properties?.name || 'test location'}` : 'No geocoding result returned.',
    permissionIssue: false
  };
}

async function testDirections(token) {
  const jaipur = [75.7873, 26.9124];
  const amer = [75.8513, 26.9855];
  const result = await fetchMapboxJson(buildDirectionsUrl(jaipur, amer, token), 'system-check:directions');
  if (!result.ok) return { ok: false, service: 'Directions', ...result.error };

  const route = result.data.routes?.[0];
  return {
    ok: Boolean(route),
    service: 'Directions',
    status: result.response.status,
    message: route ? `${Number((route.distance / 1000).toFixed(1))} km, ${Math.round(route.duration / 60)} min` : 'No route returned.',
    permissionIssue: false
  };
}

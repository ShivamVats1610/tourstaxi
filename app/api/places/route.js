import { fallbackSuggestions } from '@/lib/location-fallback';
import { buildGeocodeUrl, fetchMapboxJson, getMapboxToken, logMapboxEvent, mapboxTokenStatus } from '@/lib/mapbox';

export const dynamic = 'force-dynamic';

function mapFeature(feature) {
  const properties = feature.properties || {};
  const coordinates = normalizeCoordinates(feature);
  const name = properties.name || feature.text || properties.full_address || '';
  const address = properties.full_address || feature.place_name || name;

  return {
    id: feature.id || properties.mapbox_id || address,
    mainText: name,
    secondaryText: address.replace(name, '').replace(/^,\s*/, ''),
    description: address,
    coordinates,
    source: 'mapbox'
  };
}

function normalizeCoordinates(feature) {
  const coordinates = feature?.geometry?.coordinates || feature?.properties?.coordinates;
  if (Array.isArray(coordinates)) return [Number(coordinates[0]), Number(coordinates[1])];
  return [Number(coordinates?.longitude), Number(coordinates?.latitude)];
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get('input')?.trim() || '';
  const token = getMapboxToken();
  logMapboxEvent('autocomplete:request', { inputLength: input.length });

  if (input.length < 2) {
    return Response.json({ predictions: fallbackSuggestions(input), source: 'fallback', tokenStatus: mapboxTokenStatus() });
  }

  if (!token) {
    logMapboxEvent('autocomplete:missing-token');
    return Response.json({
      predictions: fallbackSuggestions(input),
      source: 'fallback',
      error: 'missing-mapbox-token',
      userMessage: 'Location search is using fallback data because the production Mapbox token is missing.',
      tokenStatus: mapboxTokenStatus()
    });
  }

  try {
    const result = await fetchMapboxJson(buildGeocodeUrl(input, token, '8'), 'autocomplete');
    if (!result.ok) {
      return Response.json({
        predictions: fallbackSuggestions(input),
        source: 'fallback',
        error: result.error.code,
        mapboxError: result.error,
        tokenStatus: mapboxTokenStatus()
      }, { status: result.error.permissionIssue ? result.error.status : 200 });
    }

    const data = result.data;
    const predictions = Array.isArray(data.features)
      ? data.features.map(mapFeature).filter((item) => Number.isFinite(item.coordinates[0]) && Number.isFinite(item.coordinates[1]))
      : [];

    return Response.json({
      predictions: predictions.length ? predictions : fallbackSuggestions(input),
      source: predictions.length ? 'mapbox' : 'fallback',
      tokenStatus: mapboxTokenStatus()
    });
  } catch (error) {
    logMapboxEvent('autocomplete:exception', { message: error?.message || 'Unknown error' });
    return Response.json({
      predictions: fallbackSuggestions(input),
      source: 'fallback',
      error: 'mapbox-request-failed',
      userMessage: 'Location search is temporarily unavailable. Showing fallback suggestions.',
      tokenStatus: mapboxTokenStatus()
    });
  }
}

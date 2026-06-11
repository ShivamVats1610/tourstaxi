import { fallbackSuggestions } from '@/lib/location-fallback';

const MAPBOX_GEOCODE_URL = 'https://api.mapbox.com/search/geocode/v6/forward';

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
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (input.length < 2) {
    return Response.json({ predictions: fallbackSuggestions(input), source: 'fallback' });
  }

  if (!token) {
    return Response.json({ predictions: fallbackSuggestions(input), source: 'fallback', error: 'missing-mapbox-token' });
  }

  const url = new URL(MAPBOX_GEOCODE_URL);
  url.searchParams.set('q', input);
  url.searchParams.set('country', 'in');
  url.searchParams.set('limit', '8');
  url.searchParams.set('access_token', token);

  try {
    const response = await fetch(url, { cache: 'no-store' });
    const data = await response.json();
    const predictions = Array.isArray(data.features)
      ? data.features.map(mapFeature).filter((item) => Number.isFinite(item.coordinates[0]) && Number.isFinite(item.coordinates[1]))
      : [];

    return Response.json({
      predictions: predictions.length ? predictions : fallbackSuggestions(input),
      source: predictions.length ? 'mapbox' : 'fallback'
    });
  } catch {
    return Response.json({ predictions: fallbackSuggestions(input), source: 'fallback' });
  }
}

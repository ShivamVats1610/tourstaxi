export const FALLBACK_PLACES = [
  { name: 'Noida', detail: 'Uttar Pradesh, India', lat: 28.5355, lng: 77.391, aliases: ['noida city'] },
  { name: 'Noida Sector 18', detail: 'Noida, Uttar Pradesh, India', lat: 28.5708, lng: 77.3261, aliases: ['sector 18 noida'] },
  { name: 'Noida Sector 62', detail: 'Noida, Uttar Pradesh, India', lat: 28.6274, lng: 77.3733, aliases: ['sector 62 noida'] },
  { name: 'Greater Noida', detail: 'Uttar Pradesh, India', lat: 28.4744, lng: 77.504, aliases: ['greater noida west'] },
  { name: 'Bhopal', detail: 'Madhya Pradesh, India', lat: 23.2599, lng: 77.4126, aliases: ['bhopal city'] },
  { name: 'Bhopal Junction Railway Station', detail: 'Railway Colony, Bhopal, Madhya Pradesh, India', lat: 23.2674, lng: 77.4149, aliases: ['bhopal railway', 'bhopal station'] },
  { name: 'Bhopal Airport', detail: 'Raja Bhoj Airport Area, Gandhi Nagar, Bhopal, Madhya Pradesh, India', lat: 23.2875, lng: 77.3374, aliases: ['raja bhoj airport'] },
  { name: 'Delhi', detail: 'Delhi, India', lat: 28.6139, lng: 77.209, aliases: ['new delhi'] },
  { name: 'New Delhi Railway Station', detail: 'Ajmeri Gate, New Delhi, Delhi, India', lat: 28.6429, lng: 77.2197, aliases: ['delhi railway'] },
  { name: 'Indira Gandhi International Airport', detail: 'New Delhi, Delhi, India', lat: 28.5562, lng: 77.1, aliases: ['delhi airport', 'igi airport'] },
  { name: 'Gurugram', detail: 'Haryana, India', lat: 28.4595, lng: 77.0266, aliases: ['gurgaon'] },
  { name: 'Ghaziabad', detail: 'Uttar Pradesh, India', lat: 28.6692, lng: 77.4538, aliases: [] },
  { name: 'Faridabad', detail: 'Haryana, India', lat: 28.4089, lng: 77.3178, aliases: [] },
  { name: 'Goa', detail: 'Goa, India', lat: 15.2993, lng: 74.124, aliases: ['panaji'] },
  { name: 'Jaipur', detail: 'Rajasthan, India', lat: 26.9124, lng: 75.7873, aliases: ['pink city'] },
  { name: 'Jaipur International Airport', detail: 'Sanganer, Jaipur, Rajasthan, India', lat: 26.8242, lng: 75.8122, aliases: ['jaipur airport'] },
  { name: 'Sawai Madhopur', detail: 'Rajasthan, India', lat: 26.0173, lng: 76.5026, aliases: ['ranthambore'] },
  { name: 'Mumbai', detail: 'Maharashtra, India', lat: 19.076, lng: 72.8777, aliases: ['bombay'] },
  { name: 'Pune', detail: 'Maharashtra, India', lat: 18.5204, lng: 73.8567, aliases: [] },
  { name: 'Udaipur', detail: 'Rajasthan, India', lat: 24.5854, lng: 73.7125, aliases: [] },
  { name: 'Agra', detail: 'Uttar Pradesh, India', lat: 27.1767, lng: 78.0081, aliases: ['taj mahal'] },
  { name: 'Kota', detail: 'Rajasthan, India', lat: 25.2138, lng: 75.8648, aliases: [] }
];

export const FALLBACK_ROUTE_KM = {
  'noida|delhi': 25,
  'delhi|noida': 25,
  'greater noida|delhi': 45,
  'delhi|greater noida': 45,
  'goa|delhi': 1865,
  'bhopal|delhi': 780,
  'sawai madhopur|jaipur': 180,
  'jaipur|sawai madhopur': 180,
  'jaipur|udaipur': 395,
  'delhi|sawai madhopur': 395,
  'agra|sawai madhopur': 255,
  'kota|sawai madhopur': 110
};

export function placeKey(value = '') {
  return value.split(',')[0].trim().toLowerCase();
}

export function findFallbackPlace(value = '') {
  const key = placeKey(value);
  return FALLBACK_PLACES.find((place) => place.name.toLowerCase() === key)
    || FALLBACK_PLACES.find((place) => place.name.toLowerCase().includes(key) || place.aliases.some((alias) => alias.includes(key)));
}

export function fallbackSuggestions(query = '') {
  const value = query.trim().toLowerCase();
  const places = value
    ? FALLBACK_PLACES.filter((place) => [place.name, place.detail, ...place.aliases].some((item) => item.toLowerCase().includes(value)))
    : FALLBACK_PLACES;

  return places.slice(0, 8).map((place) => ({
    id: `${place.name}-${place.detail}`,
    mainText: place.name,
    secondaryText: place.detail,
    description: `${place.name}, ${place.detail}`,
    coordinates: [place.lng, place.lat],
    source: 'fallback'
  }));
}

export function fallbackDistanceKm(origin = '', destination = '') {
  const from = findFallbackPlace(origin);
  const to = findFallbackPlace(destination);
  const override = FALLBACK_ROUTE_KM[`${placeKey(origin)}|${placeKey(destination)}`] || FALLBACK_ROUTE_KM[`${from?.name.toLowerCase()}|${to?.name.toLowerCase()}`];
  if (override) return override;
  if (!from || !to) return null;

  const earthRadius = 6371;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((from.lat * Math.PI) / 180) * Math.cos((to.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.24);
}

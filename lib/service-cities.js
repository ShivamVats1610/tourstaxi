function normalizePlace(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasCityToken(place, city) {
  const normalizedPlace = normalizePlace(place);
  const normalizedCity = normalizePlace(city);
  if (!normalizedPlace || !normalizedCity) return false;

  return ` ${normalizedPlace} `.includes(` ${normalizedCity} `);
}

export function serviceCityAllowed(value, settings = {}) {
  const cities = Array.isArray(settings.serviceCities) ? settings.serviceCities : [];
  if (!cities.length || !value) return true;

  return cities.some((city) => hasCityToken(value, city));
}

export function airportServiceAllowed(value, settings = {}) {
  const airports = Array.isArray(settings.airportServiceLocations) ? settings.airportServiceLocations : [];
  if (!airports.length || !value) return true;

  return airports.some((airport) => hasCityToken(value, airport));
}

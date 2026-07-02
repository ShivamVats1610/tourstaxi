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

  if (` ${normalizedPlace} `.includes(` ${normalizedCity} `)) return true;
  if (normalizedPlace.replace(/\s+/g, '').includes(normalizedCity.replace(/\s+/g, ''))) return true;

  const placeWords = normalizedPlace.split(' ');
  const cityWords = normalizedCity.split(' ');
  return cityWords.every((cityWord) => (
    placeWords.some((placeWord) => closeWordMatch(placeWord, cityWord))
  ));
}

function closeWordMatch(placeWord, cityWord) {
  if (!placeWord || !cityWord) return false;
  if (placeWord === cityWord) return true;
  if (placeWord.length < 4 || cityWord.length < 4) return false;
  return editDistanceAtMostOne(placeWord, cityWord);
}

function editDistanceAtMostOne(left, right) {
  if (Math.abs(left.length - right.length) > 1) return false;

  let edits = 0;
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] === right[rightIndex]) {
      leftIndex += 1;
      rightIndex += 1;
      continue;
    }

    edits += 1;
    if (edits > 1) return false;

    if (left.length > right.length) leftIndex += 1;
    else if (right.length > left.length) rightIndex += 1;
    else {
      leftIndex += 1;
      rightIndex += 1;
    }
  }

  return true;
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

export const DEFAULT_PRICING_SETTINGS = {
  minimumBillingKmPerDay: 250,
  oneWayMinimumKm: 250,
  airportMinimumKm: 250,
  roundTripMinimumKmPerDay: 250,
  localMinimumKm: 80,
  oneWayBaseFare: 0,
  roundTripBaseFare: 0,
  roundTripDiscountPercent: 5,
  airportBaseFare: 0,
  localBaseFare: 0,
  driverAllowancePerDay: 0,
  gstPercent: 0,
  dieselSurchargePerKm: 1.1,
  advancePercent: 25,
  carrierAddonPrice: 149,
  newCarAddonPrice: 249,
  languageAddonPrice: 149,
  serviceCities: [],
  holidays: [],
  dutyEnabled: true,
  facebookUrl: '',
  instagramUrl: '',
  youtubeUrl: '',
  xUrl: '',
  googleBusinessUrl: '',
  whatsappNumber: '',
  callingNumber: '',
};

function numberValue(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function booleanValue(value, fallback = true) {
  if (typeof value === 'boolean') return value;
  const normalized = String(value ?? '').trim().toLowerCase();
  if (['false', 'off', '0', 'no'].includes(normalized)) return false;
  if (['true', 'on', '1', 'yes'].includes(normalized)) return true;
  return fallback;
}

export function normalizePricingSettings(input = {}) {
  return {
    minimumBillingKmPerDay: numberValue(input.minimumBillingKmPerDay, DEFAULT_PRICING_SETTINGS.minimumBillingKmPerDay),
    oneWayMinimumKm: numberValue(input.oneWayMinimumKm, input.minimumBillingKmPerDay ?? DEFAULT_PRICING_SETTINGS.oneWayMinimumKm),
    airportMinimumKm: numberValue(input.airportMinimumKm, input.minimumBillingKmPerDay ?? DEFAULT_PRICING_SETTINGS.airportMinimumKm),
    roundTripMinimumKmPerDay: numberValue(input.roundTripMinimumKmPerDay, input.minimumBillingKmPerDay ?? DEFAULT_PRICING_SETTINGS.roundTripMinimumKmPerDay),
    localMinimumKm: numberValue(input.localMinimumKm, DEFAULT_PRICING_SETTINGS.localMinimumKm),
    oneWayBaseFare: numberValue(input.oneWayBaseFare, DEFAULT_PRICING_SETTINGS.oneWayBaseFare),
    roundTripBaseFare: numberValue(input.roundTripBaseFare, DEFAULT_PRICING_SETTINGS.roundTripBaseFare),
    roundTripDiscountPercent: numberValue(input.roundTripDiscountPercent, DEFAULT_PRICING_SETTINGS.roundTripDiscountPercent),
    airportBaseFare: numberValue(input.airportBaseFare, DEFAULT_PRICING_SETTINGS.airportBaseFare),
    localBaseFare: numberValue(input.localBaseFare, DEFAULT_PRICING_SETTINGS.localBaseFare),
    driverAllowancePerDay: numberValue(input.driverAllowancePerDay, DEFAULT_PRICING_SETTINGS.driverAllowancePerDay),
    gstPercent: numberValue(input.gstPercent, DEFAULT_PRICING_SETTINGS.gstPercent),
    dieselSurchargePerKm: numberValue(input.dieselSurchargePerKm, DEFAULT_PRICING_SETTINGS.dieselSurchargePerKm),
    advancePercent: numberValue(input.advancePercent, DEFAULT_PRICING_SETTINGS.advancePercent),
    carrierAddonPrice: numberValue(input.carrierAddonPrice, DEFAULT_PRICING_SETTINGS.carrierAddonPrice),
    newCarAddonPrice: numberValue(input.newCarAddonPrice, DEFAULT_PRICING_SETTINGS.newCarAddonPrice),
    languageAddonPrice: numberValue(input.languageAddonPrice, DEFAULT_PRICING_SETTINGS.languageAddonPrice),
    serviceCities: listValue(input.serviceCities),
    holidays: listValue(input.holidays),
    dutyEnabled: booleanValue(input.dutyEnabled, DEFAULT_PRICING_SETTINGS.dutyEnabled),
    facebookUrl: stringValue(input.facebookUrl),
    instagramUrl: stringValue(input.instagramUrl),
    youtubeUrl: stringValue(input.youtubeUrl),
    xUrl: stringValue(input.xUrl),
    googleBusinessUrl: stringValue(input.googleBusinessUrl),
    whatsappNumber: stringValue(input.whatsappNumber),
    callingNumber: stringValue(input.callingNumber),
  };
}

function listValue(value) {
  if (Array.isArray(value)) return value.map(stringValue).filter(Boolean);
  return String(value || '').split(/[\n,]/).map(stringValue).filter(Boolean);
}

function stringValue(value) {
  return String(value || '').trim();
}

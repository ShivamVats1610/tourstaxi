export const DEFAULT_PRICING_SETTINGS = {
  minimumBillingKmPerDay: 250,
  oneWayMinimumKm: 250,
  airportMinimumKm: 250,
  roundTripMinimumKmPerDay: 250,
  localMinimumKm: 80,
  oneWayBaseFare: 0,
  roundTripBaseFare: 0,
  offerDiscountPercent: 5,
  roundTripDiscountPercent: 5,
  roundTripReturnLeadTimeMinutes: 0,
  airportBaseFare: 0,
  localBaseFare: 0,
  driverAllowancePerDay: 0,
  nightChargeStartTime: '21:00',
  nightChargeEndTime: '06:00',
  gstPercent: 0,
  dieselSurchargePerKm: 1.1,
  petrolSurchargePerKm: 1.5,
  advancePercent: 25,
  pickupLeadTimeMinutes: 60,
  carrierAddonPrice: 149,
  newCarAddonPrice: 249,
  languageAddonPrice: 149,
  serviceCities: [],
  airportServiceLocations: [],
  holidays: [],
  dutyEnabled: true,
  oneWayEnabled: true,
  showDutyOffCallButton: true,
  dutyOffStart: '',
  dutyOffEnd: '',
  facebookUrl: '',
  instagramUrl: '',
  youtubeUrl: '',
  xUrl: '',
  googleBusinessUrl: '',
  whatsappNumber: '',
  callingNumber: '',
  websiteEmail: '',
  showUpiAppButtons: false,
  upiId: 'merchant1305070.augp@aubank',
  upiBusinessName: 'ToursTaxi',
};

function numberValue(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function positiveNumberValue(value, fallback = 0) {
  const parsed = numberValue(value, fallback);
  return parsed > 0 ? parsed : fallback;
}

function booleanValue(value, fallback = true) {
  if (typeof value === 'boolean') return value;
  const normalized = String(value ?? '').trim().toLowerCase();
  if (['false', 'off', '0', 'no'].includes(normalized)) return false;
  if (['true', 'on', '1', 'yes'].includes(normalized)) return true;
  return fallback;
}

export function normalizePricingSettings(input = {}) {
  const defaultMinimumKm = positiveNumberValue(input.minimumBillingKmPerDay, DEFAULT_PRICING_SETTINGS.minimumBillingKmPerDay);
  return {
    minimumBillingKmPerDay: defaultMinimumKm,
    oneWayMinimumKm: positiveNumberValue(input.oneWayMinimumKm, defaultMinimumKm),
    airportMinimumKm: positiveNumberValue(input.airportMinimumKm, defaultMinimumKm),
    roundTripMinimumKmPerDay: positiveNumberValue(input.roundTripMinimumKmPerDay, defaultMinimumKm),
    localMinimumKm: positiveNumberValue(input.localMinimumKm, defaultMinimumKm),
    oneWayBaseFare: numberValue(input.oneWayBaseFare, DEFAULT_PRICING_SETTINGS.oneWayBaseFare),
    roundTripBaseFare: numberValue(input.roundTripBaseFare, DEFAULT_PRICING_SETTINGS.roundTripBaseFare),
    offerDiscountPercent: numberValue(input.offerDiscountPercent, DEFAULT_PRICING_SETTINGS.offerDiscountPercent),
    roundTripDiscountPercent: numberValue(input.roundTripDiscountPercent, DEFAULT_PRICING_SETTINGS.roundTripDiscountPercent),
    roundTripReturnLeadTimeMinutes: numberValue(input.roundTripReturnLeadTimeMinutes, DEFAULT_PRICING_SETTINGS.roundTripReturnLeadTimeMinutes),
    airportBaseFare: numberValue(input.airportBaseFare, DEFAULT_PRICING_SETTINGS.airportBaseFare),
    localBaseFare: numberValue(input.localBaseFare, DEFAULT_PRICING_SETTINGS.localBaseFare),
    driverAllowancePerDay: numberValue(input.driverAllowancePerDay, DEFAULT_PRICING_SETTINGS.driverAllowancePerDay),
    nightChargeStartTime: timeValue(input.nightChargeStartTime, DEFAULT_PRICING_SETTINGS.nightChargeStartTime),
    nightChargeEndTime: timeValue(input.nightChargeEndTime, DEFAULT_PRICING_SETTINGS.nightChargeEndTime),
    gstPercent: numberValue(input.gstPercent, DEFAULT_PRICING_SETTINGS.gstPercent),
    dieselSurchargePerKm: numberValue(input.dieselSurchargePerKm, DEFAULT_PRICING_SETTINGS.dieselSurchargePerKm),
    petrolSurchargePerKm: Math.max(numberValue(input.petrolSurchargePerKm, DEFAULT_PRICING_SETTINGS.petrolSurchargePerKm), 0),
    advancePercent: numberValue(input.advancePercent, DEFAULT_PRICING_SETTINGS.advancePercent),
    pickupLeadTimeMinutes: numberValue(input.pickupLeadTimeMinutes, DEFAULT_PRICING_SETTINGS.pickupLeadTimeMinutes),
    carrierAddonPrice: numberValue(input.carrierAddonPrice, DEFAULT_PRICING_SETTINGS.carrierAddonPrice),
    newCarAddonPrice: numberValue(input.newCarAddonPrice, DEFAULT_PRICING_SETTINGS.newCarAddonPrice),
    languageAddonPrice: numberValue(input.languageAddonPrice, DEFAULT_PRICING_SETTINGS.languageAddonPrice),
    serviceCities: listValue(input.serviceCities),
    airportServiceLocations: listValue(input.airportServiceLocations),
    holidays: listValue(input.holidays),
    dutyEnabled: booleanValue(input.dutyEnabled, DEFAULT_PRICING_SETTINGS.dutyEnabled),
    oneWayEnabled: booleanValue(input.oneWayEnabled, DEFAULT_PRICING_SETTINGS.oneWayEnabled),
    showDutyOffCallButton: booleanValue(input.showDutyOffCallButton, DEFAULT_PRICING_SETTINGS.showDutyOffCallButton),
    dutyOffStart: stringValue(input.dutyOffStart),
    dutyOffEnd: stringValue(input.dutyOffEnd),
    facebookUrl: stringValue(input.facebookUrl),
    instagramUrl: stringValue(input.instagramUrl),
    youtubeUrl: stringValue(input.youtubeUrl),
    xUrl: stringValue(input.xUrl),
    googleBusinessUrl: stringValue(input.googleBusinessUrl),
    whatsappNumber: stringValue(input.whatsappNumber),
    callingNumber: stringValue(input.callingNumber),
    websiteEmail: emailValue(input.websiteEmail),
    showUpiAppButtons: booleanValue(input.showUpiAppButtons, DEFAULT_PRICING_SETTINGS.showUpiAppButtons),
    upiId: upiValue(input.upiId, DEFAULT_PRICING_SETTINGS.upiId),
    upiBusinessName: stringValue(input.upiBusinessName) || DEFAULT_PRICING_SETTINGS.upiBusinessName,
  };
}

function emailValue(value) {
  const next = stringValue(value).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(next) ? next : '';
}

function listValue(value) {
  if (Array.isArray(value)) return value.map(stringValue).filter(Boolean);
  return String(value || '').split(/[\n,]/).map(stringValue).filter(Boolean);
}

function stringValue(value) {
  return String(value || '').trim();
}

function upiValue(value, fallback = '') {
  const next = stringValue(value).toLowerCase();
  return /^[a-z0-9.\-_]{2,256}@[a-z]{2,64}$/.test(next) ? next : fallback;
}

function timeValue(value, fallback = '') {
  const next = stringValue(value);
  const match = next.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return fallback;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return fallback;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

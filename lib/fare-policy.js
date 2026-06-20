import { DEFAULT_PRICING_SETTINGS, normalizePricingSettings } from './pricing-defaults';

export const MINIMUM_BILLING_KM_PER_DAY = DEFAULT_PRICING_SETTINGS.minimumBillingKmPerDay;

export const VEHICLE_RATE_RULES = [
  { match: ['swift dzire', 'dzire'], rate: 14 },
  { match: ['hyundai venue', 'venue'], rate: 18 },
  { match: ['maruti ertiga', 'ertiga'], rate: 16 },
  { match: ['toyota innova', 'innova'], exclude: ['crysta'], rate: 18 },
  { match: ['innova crysta', 'crysta'], rate: 22 },
  { match: ['toyota hycross', 'hycross'], rate: 24 },
  { match: ['force traveller 13', 'traveller 13'], rate: 28 },
  { match: ['force traveller 17', 'traveller 17'], rate: 32 },
  { match: ['force urbania', 'urbania'], rate: 35 },
  { match: ['tempo traveller', 'traveller'], rate: 28 }
];

export function vehicleRate(cab = {}) {
  const name = String(cab.name || cab.vehicleName || '').toLowerCase();
  const rule = VEHICLE_RATE_RULES.find((item) => (
    item.match.some((token) => name.includes(token)) &&
    !(item.exclude || []).some((token) => name.includes(token))
  ));
  return Number(rule?.rate || cab.pricePerKm || 0);
}

export function tripDays(data = {}) {
  if (data.tripType !== 'round-trip') return 1;
  const pickup = parseDate(data.date || data.pickupDate);
  const returning = parseDate(data.returnDate);
  if (!pickup || !returning || returning < pickup) return 1;
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.max(Math.ceil((returning - pickup) / dayMs) + 1, 1);
}

export function minimumDistance(data = {}, settings = DEFAULT_PRICING_SETTINGS) {
  const policy = normalizePricingSettings(settings);
  if (data.tripType === 'round-trip') return policy.roundTripMinimumKmPerDay * tripDays(data);
  if (data.tripType === 'one-way') return policy.oneWayMinimumKm;
  if (data.tripType === 'airport') return policy.airportMinimumKm;
  return 0;
}

export function actualDistance(data = {}) {
  const roadKm = Number(data.distanceKm || data.actualDistance || 0);
  if (data.tripType === 'round-trip') return roundKm(roadKm * 2);
  return roundKm(roadKm);
}

export function calculateMinimumBillingFare(cab = {}, data = {}, selectedAddons = [], settings = DEFAULT_PRICING_SETTINGS) {
  const policy = normalizePricingSettings(settings);
  const actual = actualDistance(data);
  const days = tripDays(data);
  const minimum = minimumDistance(data, policy);
  const chargeable = roundKm(Math.max(actual, minimum));
  const rate = vehicleRate(cab);
  const estimated = Math.round(chargeable * rate);
  const addons = Array.isArray(selectedAddons) ? selectedAddons.reduce((sum, item) => sum + Number(item.price || 0), 0) : 0;
  const total = estimated + addons;
  const advanceRatio = Math.min(Math.max(policy.advancePercent, 0), 100) / 100;
  const partPay = Math.round(total * advanceRatio);

  return {
    actualDistance: actual,
    minimumDistance: minimum,
    chargeableDistance: chargeable,
    vehicleRate: rate,
    estimatedFare: estimated,
    tripDays: days,
    pricingPolicy: policy,
    minimumApplied: minimum > 0 && chargeable > actual,
    distance: chargeable,
    ratePerKm: rate,
    distanceFare: estimated,
    base: 0,
    driver: 0,
    toll: 0,
    discount: 0,
    gst: 0,
    addons,
    total,
    totalFare: total,
    payLater: Math.max(total - partPay, 0),
    partPay,
    oldPrice: total
  };
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function roundKm(value) {
  return Number(Number(value || 0).toFixed(1));
}

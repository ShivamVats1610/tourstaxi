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
  if (Number(cab.pricePerKm) > 0) return Number(cab.pricePerKm);
  const name = String(cab.name || cab.vehicleName || '').toLowerCase();
  const rule = VEHICLE_RATE_RULES.find((item) => (
    item.match.some((token) => name.includes(token)) &&
    !(item.exclude || []).some((token) => name.includes(token))
  ));
  return Number(rule?.rate || 0);
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
  if (data.tripType === 'local') return policy.localMinimumKm;
  return 0;
}

export function actualDistance(data = {}) {
  if (data.tripType === 'local') return roundKm(localPackageKm(data.rental) || data.distanceKm || data.actualDistance || 0);
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
  const base = baseFareForTrip(data.tripType, policy);
  const packagePrice = localPackagePrice(cab, data);
  const rawRate = data.tripType === 'local' ? Number(cab.localPricePerKm || cab.pricePerKm || 0) : vehicleRate(cab);
  const rate = Number(rawRate) > 0 ? Number(rawRate) : vehicleRate(cab);
  const fuelSurchargePerKm = data.fuelType === 'diesel' ? Number(policy.dieselSurchargePerKm || 0) : 0;
  const fuelSurcharge = Math.round(chargeable * fuelSurchargePerKm);
  const grossDistanceFare = packagePrice > 0 ? packagePrice : Math.round(chargeable * rate);
  const roundTripDiscountPercent = data.tripType === 'round-trip'
    ? Math.min(Math.max(Number(policy.roundTripDiscountPercent || 0), 0), 100)
    : 0;
  const discount = Math.round(grossDistanceFare * (roundTripDiscountPercent / 100));
  const distanceFare = Math.max(grossDistanceFare - discount, 0);
  const driver = Math.round(Number(policy.driverAllowancePerDay || 0) * days);
  const addons = Array.isArray(selectedAddons) ? selectedAddons.reduce((sum, item) => sum + Number(item.price || 0), 0) : 0;
  const subtotal = base + distanceFare + fuelSurcharge + driver + addons;
  const subtotalBeforeDiscount = base + grossDistanceFare + fuelSurcharge + driver + addons;
  const gst = Math.round(subtotal * (Math.min(Math.max(Number(policy.gstPercent || 0), 0), 100) / 100));
  const gstBeforeDiscount = Math.round(subtotalBeforeDiscount * (Math.min(Math.max(Number(policy.gstPercent || 0), 0), 100) / 100));
  const total = subtotal + gst;
  const totalBeforeDiscount = subtotalBeforeDiscount + gstBeforeDiscount;
  const advanceRatio = Math.min(Math.max(policy.advancePercent, 0), 100) / 100;
  const partPay = Math.round(total * advanceRatio);

  return {
    actualDistance: actual,
    minimumDistance: minimum,
    chargeableDistance: chargeable,
    vehicleRate: rate + fuelSurchargePerKm,
    estimatedFare: base + distanceFare + fuelSurcharge + driver,
    tripDays: days,
    pricingPolicy: policy,
    minimumApplied: minimum > 0 && chargeable > actual,
    distance: chargeable,
    ratePerKm: rate + fuelSurchargePerKm,
    distanceFare,
    base,
    driver,
    toll: 0,
    discount,
    roundTripDiscountPercent,
    gst,
    fuelSurcharge,
    addons,
    total,
    totalFare: total,
    payLater: Math.max(total - partPay, 0),
    partPay,
    oldPrice: totalBeforeDiscount
  };
}

export const calculateTripFare = calculateMinimumBillingFare;

function parseDate(value) {
  if (!value) return null;
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function roundKm(value) {
  return Number(Number(value || 0).toFixed(1));
}

function baseFareForTrip(tripType, policy) {
  if (tripType === 'round-trip') return Number(policy.roundTripBaseFare || 0);
  if (tripType === 'airport') return Number(policy.airportBaseFare || 0);
  if (tripType === 'local') return Number(policy.localBaseFare || 0);
  return Number(policy.oneWayBaseFare || 0);
}

function localPackageKm(value) {
  return Number(String(value || '').match(/(\d+)\s*km/i)?.[1] || 0);
}

function localPackagePrice(cab = {}, data = {}) {
  if (data.tripType !== 'local') return 0;
  const rental = String(data.rental || '').toLowerCase();
  if (rental.includes('4') && rental.includes('40')) return Number(cab.local4hrPrice || 0);
  if (rental.includes('8') && rental.includes('80')) return Number(cab.local8hrPrice || 0);
  if (rental.includes('12') && rental.includes('120')) return Number(cab.local12hrPrice || 0);
  return 0;
}

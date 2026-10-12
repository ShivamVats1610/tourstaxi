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

export function fuelSurchargePerKm(fuelType, settings = DEFAULT_PRICING_SETTINGS) {
  const value = fuelType === 'petrol'
    ? settings.petrolSurchargePerKm ?? DEFAULT_PRICING_SETTINGS.petrolSurchargePerKm
    : fuelType === 'diesel' ? settings.dieselSurchargePerKm ?? DEFAULT_PRICING_SETTINGS.dieselSurchargePerKm : 0;
  return Math.max(Number(value) || 0, 0);
}

export function fuelVehicleRate(cab = {}, fuelType = '', settings = DEFAULT_PRICING_SETTINGS) {
  return Number((vehicleRate(cab) + fuelSurchargePerKm(fuelType, settings)).toFixed(2));
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
  const localBaseRate = Number(cab.localPricePerKm || cab.pricePerKm || 0);
  const rawRate = data.tripType === 'local' ? localBaseRate : vehicleRate(cab);
  const rate = Number(rawRate) > 0 ? Number(rawRate) : vehicleRate(cab);
  const surchargePerKm = fuelSurchargePerKm(data.fuelType, policy);
  const fuelSurcharge = Math.round(chargeable * surchargePerKm);
  const localPackageFuelAdjustment = data.tripType === 'local' && packagePrice > 0
    ? Math.round(actual * (rate - (Number(localBaseRate) > 0 ? localBaseRate : vehicleRate(cab))))
    : 0;
  const grossDistanceFare = packagePrice > 0 ? Math.max(packagePrice + localPackageFuelAdjustment, 0) : Math.round(chargeable * rate);
  const offerDiscountPercent = Math.min(Math.max(Number(policy.offerDiscountPercent || 0), 0), 100);
  const roundTripDiscountPercent = Math.min(Math.max(Number(policy.roundTripDiscountPercent || 0), 0), 100);
  const appliedDiscountPercent = data.tripType === 'round-trip' ? roundTripDiscountPercent : offerDiscountPercent;
  const nightData = { ...data, pricingPolicy: policy };
  const driverChargeNights = data.tripType === 'round-trip'
    ? roundTripNightCount(nightData, days)
    : tripTouchesNightDriving(nightData, days) ? 1 : 0;
  const driver = Math.round(Number(policy.driverAllowancePerDay || 0) * driverChargeNights);
  const addons = Array.isArray(selectedAddons) ? selectedAddons.reduce((sum, item) => sum + Number(item.price || 0), 0) : 0;
  const subtotalBeforeDiscount = base + grossDistanceFare + fuelSurcharge + driver + addons;
  const discount = Math.round(subtotalBeforeDiscount * (appliedDiscountPercent / 100));
  const subtotal = Math.max(subtotalBeforeDiscount - discount, 0);
  const distanceFare = grossDistanceFare;
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
    vehicleRate: Number((rate + surchargePerKm).toFixed(2)),
    estimatedFare: subtotal,
    durationMinutes: tripDurationMinutes(data, days),
    tripDays: days,
    pricingPolicy: policy,
    minimumApplied: minimum > 0 && chargeable > actual,
    distance: chargeable,
    ratePerKm: Number((rate + surchargePerKm).toFixed(2)),
    distanceFare,
    base,
    driver,
    driverChargeNights,
    toll: 0,
    discount,
    offerDiscountPercent,
    roundTripDiscountPercent,
    appliedDiscountPercent,
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

function tripTouchesNightDriving(data = {}, days = 1) {
  const start = tripStart(data);
  const end = tripEnd(data, start, days);
  if (!start || !end) return pickupAfterNightChargeTime(data);
  return intervalTouchesNight(start, end, data.pricingPolicy || data.settings || {});
}

function tripStart(data = {}) {
  const date = String(data.date || data.pickupDate || '').slice(0, 10);
  const time = String(data.time || data.pickupTime || '').trim() || '00:00';
  if (!date) return null;
  const parsed = new Date(`${date}T${time}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function tripEnd(data = {}, start, days = 1) {
  if (!start) return null;
  const explicitEndDate = data.returnDate || data.dropDate || data.endDate;
  if (explicitEndDate) {
    const date = String(explicitEndDate).slice(0, 10);
    const time = String(data.returnTime || data.dropTime || data.endTime || '').trim() || '23:59';
    const parsed = new Date(`${date}T${time}`);
    if (!Number.isNaN(parsed.getTime()) && parsed >= start) return parsed;
  }
  const minutes = tripDurationMinutes(data, days);
  return new Date(start.getTime() + Math.max(minutes, 1) * 60 * 1000);
}

function tripDurationMinutes(data = {}, days = 1) {
  const explicit = Number(data.durationMinutes || 0);
  if (Number.isFinite(explicit) && explicit > 0) {
    return data.tripType === 'round-trip' ? explicit * 2 : explicit;
  }

  const localMinutes = localPackageHours(data.rental) * 60;
  if (localMinutes > 0) return localMinutes;

  const distance = actualDistance(data);
  if (distance > 0) return Math.max(Math.round((distance / 52) * 60), 1);

  return Number(days || 1) * 24 * 60;
}

function roundTripNightCount(data, days) {
  const start = tripStart(data);
  const end = tripEnd(data, start, days);
  if (!start || !end) return pickupAfterNightChargeTime(data) ? 1 : 0;
  return intervalNightCount(start, end, data.pricingPolicy || {});
}

function intervalTouchesNight(start, end, settings = {}) {
  return intervalNightCount(start, end, settings) > 0;
}

function intervalNightCount(start, end, settings = {}) {
  const startMinutes = parseTimeMinutes(settings.nightChargeStartTime || DEFAULT_PRICING_SETTINGS.nightChargeStartTime);
  const endMinutes = parseTimeMinutes(settings.nightChargeEndTime || DEFAULT_PRICING_SETTINGS.nightChargeEndTime);
  const wrapsMidnight = endMinutes <= startMinutes;
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  // An early-morning trip can overlap the window that began on the previous
  // calendar day (for example, 21:00 to 06:00). Include that window in the
  // scan instead of starting only with tonight's window.
  if (wrapsMidnight) cursor.setDate(cursor.getDate() - 1);
  let nights = 0;
  while (cursor <= end) {
    const nightStart = new Date(cursor);
    nightStart.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);
    const nightEnd = new Date(cursor);
    if (wrapsMidnight) nightEnd.setDate(nightEnd.getDate() + 1);
    nightEnd.setHours(Math.floor(endMinutes / 60), endMinutes % 60, 0, 0);
    if (start < nightEnd && end > nightStart) nights += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  return nights;
}

function pickupAfterNightChargeTime(data = {}) {
  const time = String(data.time || data.pickupTime || '').trim();
  const match = time.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return false;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return false;

  const settings = data.pricingPolicy || data.settings || {};
  const start = parseTimeMinutes(settings.nightChargeStartTime || DEFAULT_PRICING_SETTINGS.nightChargeStartTime);
  const end = parseTimeMinutes(settings.nightChargeEndTime || DEFAULT_PRICING_SETTINGS.nightChargeEndTime);
  const current = (hours * 60) + minutes;
  return end <= start ? current >= start || current < end : current >= start && current < end;
}

function parseTimeMinutes(value) {
  const [, hours = '0', minutes = '0'] = String(value || '').match(/^(\d{1,2}):(\d{2})/) || [];
  return Math.min(Math.max((Number(hours) * 60) + Number(minutes), 0), 1439);
}

function localPackageHours(value) {
  return Number(String(value || '').match(/(\d+)\s*hr/i)?.[1] || 0);
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

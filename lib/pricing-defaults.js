export const DEFAULT_PRICING_SETTINGS = {
  minimumBillingKmPerDay: 250,
  oneWayMinimumKm: 250,
  airportMinimumKm: 250,
  roundTripMinimumKmPerDay: 250,
  advancePercent: 25,
};

function numberValue(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizePricingSettings(input = {}) {
  return {
    minimumBillingKmPerDay: numberValue(input.minimumBillingKmPerDay, DEFAULT_PRICING_SETTINGS.minimumBillingKmPerDay),
    oneWayMinimumKm: numberValue(input.oneWayMinimumKm, input.minimumBillingKmPerDay ?? DEFAULT_PRICING_SETTINGS.oneWayMinimumKm),
    airportMinimumKm: numberValue(input.airportMinimumKm, input.minimumBillingKmPerDay ?? DEFAULT_PRICING_SETTINGS.airportMinimumKm),
    roundTripMinimumKmPerDay: numberValue(input.roundTripMinimumKmPerDay, input.minimumBillingKmPerDay ?? DEFAULT_PRICING_SETTINGS.roundTripMinimumKmPerDay),
    advancePercent: numberValue(input.advancePercent, DEFAULT_PRICING_SETTINGS.advancePercent),
  };
}

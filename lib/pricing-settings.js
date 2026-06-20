import { getDb } from './mongodb';
import { DEFAULT_PRICING_SETTINGS, normalizePricingSettings } from './pricing-defaults';

export { DEFAULT_PRICING_SETTINGS, normalizePricingSettings };

export async function getPricingSettings() {
  try {
    const db = await getDb();
    const settings = await db.collection('settings').findOne({ _id: 'pricing' });
    return normalizePricingSettings(settings || DEFAULT_PRICING_SETTINGS);
  } catch (error) {
    console.error('Pricing settings lookup failed:', error);
    return normalizePricingSettings(DEFAULT_PRICING_SETTINGS);
  }
}

export async function updatePricingSettings(input = {}) {
  const db = await getDb();
  const settings = normalizePricingSettings(input);
  await db.collection('settings').updateOne(
    { _id: 'pricing' },
    { $set: { ...settings, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
    { upsert: true }
  );
  return settings;
}

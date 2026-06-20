// lib/crm.js

import { ObjectId } from 'mongodb';
import { getDb, ensureIndexes } from './mongodb';
import { getSession } from './auth';
import { FLEET } from './data';
import { calculateMinimumBillingFare } from './fare-policy';
import { getPricingSettings } from './pricing-settings';

export function normalizeEmail(email) {
return String(email || '').trim().toLowerCase();
}

export function publicBooking(booking) {
return {
id: booking._id?.toString(),
bookingId: booking.bookingId,
status: booking.status,
tripType: booking.tripType,
pickup: booking.pickup,
drop: booking.drop,
rental: booking.rental,
pickupDate: booking.pickupDate,
pickupTime: booking.pickupTime,
returnDate: booking.returnDate,
returnTime: booking.returnTime,
stops: Array.isArray(booking.stops) ? booking.stops : [],
passengers: booking.passengers,
vehicleSlug: booking.vehicleSlug,
vehicleName: booking.vehicleName,
packageSlug: booking.packageSlug,
customer: booking.customer,
fare: booking.fare,
payment: booking.payment,
notes: booking.notes || '',
createdAt: booking.createdAt,
updatedAt: booking.updatedAt,
};
}

function clean(value) {
return String(value || '').trim();
}

function numberValue(value, fallback = 0) {
const parsed = Number(value);
return Number.isFinite(parsed) ? parsed : fallback;
}

function publicCab(cab) {
return {
id: cab._id?.toString?.() || cab.id || cab.slug,
slug: cab.slug,
name: cab.name,
category: cab.category || '',
image: cab.image || '',
seats: numberValue(cab.seats),
luggage: cab.luggage || '',
ac: cab.ac !== false,
features: Array.isArray(cab.features) ? cab.features : String(cab.features || '').split(',').map(clean).filter(Boolean),
pricePerKm: numberValue(cab.pricePerKm),
localPricePerKm: numberValue(cab.localPricePerKm || cab.pricePerKm),
local4hrPrice: numberValue(cab.local4hrPrice),
local8hrPrice: numberValue(cab.local8hrPrice),
local12hrPrice: numberValue(cab.local12hrPrice),
startPrice: numberValue(cab.startPrice),
fuelOptions: Array.isArray(cab.fuelOptions) ? cab.fuelOptions : String(cab.fuelOptions || 'cng,diesel').split(',').map(clean).filter(Boolean),
badge: cab.badge || '',
status: cab.status || 'active',
description: cab.description || '',
createdAt: cab.createdAt || null,
updatedAt: cab.updatedAt || null,
};
}

export function slugifyCab(value) {
return clean(value)
.toLowerCase()
.replace(/[^a-z0-9]+/g, '-')
.replace(/^-+|-+$/g, '');
}

export async function listCabs({ includeInactive = false, fallbackToFleet = true } = {}) {
try {
const db = await getDb();
const cabs = await db
  .collection('cabs')
  .find(includeInactive ? {} : { status: { $ne: 'inactive' } })
  .sort({ updatedAt: -1, name: 1 })
  .toArray();

if (cabs.length) return cabs.map(publicCab);
if (!fallbackToFleet) return [];
return FLEET.map((cab) => publicCab({ ...cab, status: 'active' }));
} catch (error) {
console.error('Cab lookup failed:', error);
if (!fallbackToFleet) return [];
return FLEET.map((cab) => publicCab({ ...cab, status: 'active' }));
}
}

export async function upsertCab(input) {
await ensureIndexes();
const db = await getDb();
const now = new Date();
const id = clean(input.id);
const name = clean(input.name);
const slug = slugifyCab(input.slug || name);

if (!name || !slug) throw new Error('Cab name is required.');

const cab = {
slug,
name,
category: clean(input.category),
image: clean(input.image),
seats: numberValue(input.seats, 4),
luggage: clean(input.luggage),
ac: input.ac !== false && input.ac !== 'false',
features: String(input.features || '').split(',').map(clean).filter(Boolean),
pricePerKm: numberValue(input.pricePerKm),
localPricePerKm: numberValue(input.localPricePerKm || input.pricePerKm),
local4hrPrice: numberValue(input.local4hrPrice),
local8hrPrice: numberValue(input.local8hrPrice),
local12hrPrice: numberValue(input.local12hrPrice),
startPrice: numberValue(input.startPrice),
fuelOptions: Array.isArray(input.fuelOptions) ? input.fuelOptions.map(clean).filter(Boolean) : String(input.fuelOptions || '').split(',').map(clean).filter(Boolean),
badge: clean(input.badge),
status: clean(input.status) || 'active',
description: clean(input.description),
updatedAt: now,
};

if (id && ObjectId.isValid(id)) {
await db.collection('cabs').updateOne({ _id: new ObjectId(id) }, { $set: cab });
return;
}

await db.collection('cabs').updateOne(
{ slug },
{ $set: cab, $setOnInsert: { createdAt: now } },
{ upsert: true }
);
}

export async function deleteCab(id) {
if (!ObjectId.isValid(id)) return;
const db = await getDb();
await db.collection('cabs').deleteOne({ _id: new ObjectId(id) });
}

export async function createBooking(input) {
try {
await ensureIndexes();


const session = await getSession();
const bookingId = await nextBookingId();
const now = new Date();
const cabs = await listCabs({ includeInactive: true, fallbackToFleet: true });
const cab = cabs.find((item) => item.slug === input.vehicleSlug || item.name === input.vehicleName) || {};
const incomingFare = input.fare || {};
const selectedAddons = Array.isArray(incomingFare.selectedAddons) ? incomingFare.selectedAddons : [];
const addonTotal = Number(incomingFare.addons || 0);
const pricingSettings = await getPricingSettings();
const policyFare = ['one-way', 'round-trip', 'airport'].includes(input.tripType) ? calculateMinimumBillingFare(cab, input, [], pricingSettings) : null;
const policyTotal = policyFare ? policyFare.estimatedFare + addonTotal : 0;
const fare = ['one-way', 'round-trip', 'airport'].includes(input.tripType)
  ? {
      ...policyFare,
      addons: addonTotal,
      total: policyTotal,
      totalFare: policyTotal,
      payLater: Math.max(policyTotal - Math.round(policyTotal * (Math.min(Math.max(pricingSettings.advancePercent, 0), 100) / 100)), 0),
      partPay: Math.round(policyTotal * (Math.min(Math.max(pricingSettings.advancePercent, 0), 100) / 100)),
      oldPrice: policyTotal,
      selectedAddons,
      paymentOption: incomingFare.paymentOption || 'part'
    }
  : {
      ...incomingFare,
      actualDistance: numberValue(incomingFare.actualDistance || incomingFare.distance),
      minimumDistance: numberValue(incomingFare.minimumDistance),
      chargeableDistance: numberValue(incomingFare.chargeableDistance || incomingFare.distance),
      vehicleRate: numberValue(incomingFare.vehicleRate || incomingFare.ratePerKm),
      estimatedFare: numberValue(incomingFare.estimatedFare || incomingFare.distanceFare || incomingFare.total),
      tripDays: numberValue(incomingFare.tripDays, 1)
    };

const booking = {
  bookingId,
  customerId:
    session?.userId && ObjectId.isValid(session.userId)
      ? new ObjectId(session.userId)
      : null,

  firebaseUid:
    session?.firebaseUid ||
    (!ObjectId.isValid(session?.userId || '')
      ? session?.userId
      : ''),

  status: 'new',

  tripType: input.tripType,
  pickup: input.pickup,
  drop: input.drop || '',
  rental: input.rental || '',
  pickupDate: input.date,
  pickupTime: input.time || '',
  returnDate: input.returnDate || '',
  returnTime: input.returnTime || '',
  stops: Array.isArray(input.stops) ? input.stops : [],
  passengers: input.passengers || '',

  vehicleSlug: input.vehicleSlug,
  vehicleName: input.vehicleName || '',
  packageSlug: input.packageSlug || '',

  customer: {
    name: input.name,
    phone: input.phone,
    email: normalizeEmail(input.email),
    address: input.address || '',
  },

  fare,
  payment: {
    option: fare.paymentOption || 'part',
    advancePaid: numberValue(input.fare?.advancePaid),
    provider: input.fare?.paymentProvider || '',
    razorpayOrderId: input.fare?.razorpayOrderId || '',
    razorpayPaymentId: input.fare?.razorpayPaymentId || '',
    status: input.fare?.paymentProvider === 'razorpay'
      ? 'paid_verified'
      : numberValue(input.fare?.advancePaid) > 0
        ? 'payment_initiated'
        : 'pay_after_ride'
  },
  notes: input.notes || '',

  source: 'website',

  createdAt: now,
  updatedAt: now,
};

const db = await getDb();

const result = await db
  .collection('bookings')
  .insertOne(booking);

return publicBooking({
  ...booking,
  _id: result.insertedId,
});


} catch (error) {
console.error('CREATE BOOKING ERROR:', error);
throw error;
}
}

export async function listAdminBookings() {
try {
const db = await getDb();


const bookings = await db
  .collection('bookings')
  .find({})
  .sort({ createdAt: -1 })
  .limit(100)
  .toArray();

return bookings.map(publicBooking);


} catch (error) {
console.error('Admin bookings lookup failed:', error);
return [];
}
}

export async function updateBooking(input) {
const id = clean(input.id);
if (!ObjectId.isValid(id)) return;
const db = await getDb();
await db.collection('bookings').updateOne(
{ _id: new ObjectId(id) },
{
  $set: {
    status: clean(input.status) || 'new',
    'fare.total': numberValue(input.totalFare),
    notes: clean(input.notes),
    updatedAt: new Date(),
  },
},
);
}

export async function deleteBooking(id) {
if (!ObjectId.isValid(id)) return;
const db = await getDb();
await db.collection('bookings').deleteOne({ _id: new ObjectId(id) });
}

export function publicUser(user) {
return {
id: user._id?.toString?.() || user.id || user.firebaseUid,
name: user.name || '',
email: user.email || '',
phone: user.phone || '',
role: user.role || 'customer',
createdAt: user.createdAt || null,
updatedAt: user.updatedAt || null,
};
}

export async function listUsers() {
try {
const db = await getDb();
const users = await db.collection('users').find({}, { projection: { passwordHash: 0 } }).sort({ createdAt: -1 }).limit(200).toArray();
return users.map(publicUser);
} catch (error) {
console.error('User lookup failed:', error);
return [];
}
}

export async function updateUser(input) {
const id = clean(input.id);
if (!ObjectId.isValid(id)) return;
const db = await getDb();
await db.collection('users').updateOne(
{ _id: new ObjectId(id) },
{
  $set: {
    name: clean(input.name),
    email: normalizeEmail(input.email),
    phone: clean(input.phone),
    role: clean(input.role) === 'admin' ? 'admin' : 'customer',
    updatedAt: new Date(),
  },
},
);
}

export async function deleteUser(id) {
if (!ObjectId.isValid(id)) return;
const db = await getDb();
await db.collection('users').deleteOne({ _id: new ObjectId(id) });
}

export async function listCustomerBookings(user) {
try {
const db = await getDb();


const filters = [];

if (ObjectId.isValid(user.id))
  filters.push({
    customerId: new ObjectId(user.id),
  });

if (user.firebaseUid)
  filters.push({
    firebaseUid: user.firebaseUid,
  });

if (user.email)
  filters.push({
    'customer.email': normalizeEmail(user.email),
  });

if (user.phone)
  filters.push({
    'customer.phone': user.phone,
  });

if (!filters.length) return [];

const bookings = await db
  .collection('bookings')
  .find({ $or: filters })
  .sort({ createdAt: -1 })
  .limit(50)
  .toArray();

return bookings.map(publicBooking);


} catch (error) {
console.error(
'Customer bookings lookup failed:',
error
);
return [];
}
}

async function nextBookingId() {
const db = await getDb();

const result = await db
.collection('counters')
.findOneAndUpdate(
{ _id: 'booking' },
{ $inc: { value: 1 } },
{
upsert: true,
returnDocument: 'after',
}
);

const value = result?.value || 1;

return `TTX${String(value).padStart(6, '0')}`;
}

export async function adminStats() {
  try {
    const db = await getDb();

    const [users, bookings, newBookings, assignedBookings] =
      await Promise.all([
        db.collection('users').countDocuments({
          role: 'customer',
        }),

        db.collection('bookings').countDocuments({}),

        db.collection('bookings').countDocuments({
          status: 'new',
        }),

        db.collection('bookings').countDocuments({
          status: 'assigned',
        }),
      ]);

    return {
      users,
      bookings,
      newBookings,
      assignedBookings,
      dbUnavailable: false,
    };
  } catch (error) {
    console.error(
      'Admin stats lookup failed:',
      error
    );

    return {
      users: 0,
      bookings: 0,
      newBookings: 0,
      assignedBookings: 0,
      dbUnavailable: true,
    };
  }
}

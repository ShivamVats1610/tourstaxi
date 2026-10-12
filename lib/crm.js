// lib/crm.js

import { ObjectId } from 'mongodb';
import { after } from 'next/server';
import { getDb, ensureIndexes } from './mongodb';
import { getSession } from './auth';
import { BLOG_POSTS, FLEET, PACKAGES, ROUTES } from './data';
import { calculateTripFare, fuelVehicleRate } from './fare-policy';
import { getPricingSettings } from './pricing-settings';
import { airportServiceAllowed, serviceCityAllowed } from './service-cities';
import { notifyBookingEmails, notifyPaymentRejectedEmail, notifyPaymentSubmittedEmail, notifyPaymentVerifiedEmail } from './email-notifier';

export const UPI_ID = 'merchant1305070.augp@aubank';
export const UPI_BUSINESS_NAME = 'ToursTaxi';

export function upiDeepLink(booking = {}, settings = {}) {
const amount = Number(booking.paymentAmount || booking.fare?.total || booking.fare?.totalFare || 0).toFixed(2);
const bookingId = clean(booking.bookingId);
const upiId = clean(settings.upiId || booking.upiId || booking.payment?.upiId || UPI_ID);
const businessName = clean(settings.upiBusinessName || booking.upiBusinessName || booking.payment?.businessName || UPI_BUSINESS_NAME);
return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(businessName)}&am=${encodeURIComponent(amount)}&cu=INR&tn=${encodeURIComponent(`Booking-${bookingId}`)}`;
}

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
selectedOptions: booking.selectedOptions || {},
passengers: booking.passengers,
vehicleSlug: booking.vehicleSlug,
vehicleName: booking.vehicleName,
packageSlug: booking.packageSlug,
customer: booking.customer,
fare: booking.fare,
payment: booking.payment,
paymentMethod: booking.paymentMethod || booking.payment?.method || '',
upiId: booking.upiId || booking.payment?.upiId || '',
upiBusinessName: booking.upiBusinessName || booking.payment?.businessName || '',
paymentAmount: Number(booking.paymentAmount || booking.payment?.amount || booking.fare?.total || 0),
paymentStatus: booking.paymentStatus || booking.payment?.status || 'pending',
paymentScreenshot: booking.paymentScreenshot || '',
paymentReference: booking.paymentReference || '',
paymentSubmittedAt: booking.paymentSubmittedAt || null,
paymentVerifiedAt: booking.paymentVerifiedAt || null,
paymentVerifiedBy: booking.paymentVerifiedBy || '',
paymentRejectedAt: booking.paymentRejectedAt || null,
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

function dateTimeValue(date, time) {
return `${clean(date).slice(0, 10)}T${clean(time) || '00:00'}`;
}

function validCustomerName(value) {
const parts = clean(value).split(/\s+/).filter(Boolean);
if (parts.length < 2) return false;
return parts.every((part) => /^[A-Za-z][A-Za-z.'-]{1,}$/.test(part) && !/(.)\1{2,}/i.test(part));
}

function validCustomerPhone(value) {
const raw = clean(value);
const digits = raw.replace(/\D/g, '');
if (/^(\d)\1+$/.test(digits)) return false;
if (/^(\d{2,5})\1+$/.test(digits)) return false;
if (raw.startsWith('+91')) return /^[6-9]\d{9}$/.test(digits.slice(-10));
return digits.length >= 7 && digits.length <= 15;
}

function validCustomerEmail(value) {
const email = normalizeEmail(value);
if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return false;
const [local, domain = ''] = email.split('@');
if (local.length < 5 || /^x+$/i.test(local) || /(.)\1{3,}/i.test(local)) return false;
return domain.includes('.') && !domain.startsWith('.') && !domain.endsWith('.');
}

function publicCab(cab, settings) {
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
petrolPricePerKm: fuelVehicleRate(cab, 'petrol', settings),
localPricePerKm: numberValue(cab.localPricePerKm || cab.pricePerKm),
localPetrolPricePerKm: fuelVehicleRate({ ...cab, pricePerKm: cab.localPricePerKm || cab.pricePerKm }, 'petrol', settings),
local4hrPrice: numberValue(cab.local4hrPrice),
local8hrPrice: numberValue(cab.local8hrPrice),
local12hrPrice: numberValue(cab.local12hrPrice),
startPrice: numberValue(cab.startPrice),
fuelOptions: Array.isArray(cab.fuelOptions) ? cab.fuelOptions : String(cab.fuelOptions || 'cng,petrol,diesel').split(',').map(clean).filter(Boolean),
badge: cab.badge || '',
status: cab.status || 'active',
description: cab.description || '',
createdAt: cab.createdAt || null,
updatedAt: cab.updatedAt || null,
};
}

function publicPackage(item) {
return {
id: item._id?.toString?.() || item.id || item.slug,
slug: item.slug,
title: item.title,
duration: item.duration || '',
price: numberValue(item.price),
image: item.image || '',
description: item.description || '',
inclusions: Array.isArray(item.inclusions) ? item.inclusions : String(item.inclusions || '').split(',').map(clean).filter(Boolean),
tag: item.tag || '',
status: item.status || 'active',
createdAt: item.createdAt || null,
updatedAt: item.updatedAt || null,
};
}

function publicBlogPost(item) {
return {
id: item._id?.toString?.() || item.id || item.slug,
slug: item.slug,
title: item.title,
excerpt: item.excerpt || '',
category: item.category || '',
author: item.author || '',
date: item.date || '',
readMin: numberValue(item.readMin),
image: item.image || '',
content: item.content || '',
status: item.status || 'active',
createdAt: item.createdAt || null,
updatedAt: item.updatedAt || null,
};
}

function publicRoute(item) {
return {
id: item._id?.toString?.() || item.id || item.slug || `${item.from}-${item.to}`,
slug: item.slug || slugifyContent(`${item.from || ''}-${item.to || ''}`),
from: item.from || '',
to: item.to || '',
distance: item.distance || '',
duration: item.duration || '',
price: numberValue(item.price),
image: item.image || '',
status: item.status || 'active',
createdAt: item.createdAt || null,
updatedAt: item.updatedAt || null,
};
}

export function slugifyCab(value) {
return clean(value)
.toLowerCase()
.replace(/[^a-z0-9]+/g, '-')
.replace(/^-+|-+$/g, '');
}

export const slugifyContent = slugifyCab;

export async function listCabs({ includeInactive = false, fallbackToFleet = true } = {}) {
const settings = await getPricingSettings();
try {
const db = await getDb();
const cabs = await db
  .collection('cabs')
  .find(includeInactive ? {} : { status: { $ne: 'inactive' } })
  .sort({ updatedAt: -1, name: 1 })
  .toArray();

if (cabs.length) return cabs.map(cab => publicCab(cab, settings));
if (!fallbackToFleet) return [];
return FLEET.map((cab) => publicCab({ ...cab, status: 'active' }, settings));
} catch (error) {
console.error('Cab lookup failed:', error);
if (!fallbackToFleet) return [];
return FLEET.map((cab) => publicCab({ ...cab, status: 'active' }, settings));
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
fuelOptions: (Array.isArray(input.fuelOptions) ? input.fuelOptions : String(input.fuelOptions || '').split(',')).map(clean).filter((item) => ['cng', 'diesel', 'petrol'].includes(item)),
badge: clean(input.badge),
status: clean(input.status) || 'active',
description: clean(input.description),
updatedAt: now,
};

if (id) {
const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { slug: id };
const existing = await db.collection('cabs').findOne(filter);
if (ObjectId.isValid(id) && !existing) throw new Error('Cab not found. Refresh the fleet and try again.');
if (existing) {
try {
await db.collection('cabs').updateOne(filter, { $set: cab });
} catch (error) {
if (error.code === 11000) throw new Error('This slug belongs to another cab. Please choose a different slug.');
throw error;
}
return;
}
}

// New cars must never overwrite another car with the same name or slug.
// The unique index also protects simultaneous additions.
let suffix = 1;
while (true) {
const candidate = suffix === 1 ? slug : `${slug}-${suffix}`;
if (await db.collection('cabs').findOne({ slug: candidate })) {
suffix += 1;
continue;
}
try {
await db.collection('cabs').insertOne({ ...cab, slug: candidate, createdAt: now });
return;
} catch (error) {
if (error.code !== 11000 || !error.keyPattern?.slug) throw error;
suffix += 1;
}
}
}

export async function deleteCab(id) {
if (!ObjectId.isValid(id)) return;
const db = await getDb();
await db.collection('cabs').deleteOne({ _id: new ObjectId(id) });
}

export async function listTourPackages({ includeInactive = false, fallbackToDefaults = true } = {}) {
try {
const db = await getDb();
const items = await db
  .collection('tourPackages')
  .find(includeInactive ? {} : { status: { $ne: 'inactive' } })
  .sort({ updatedAt: -1, title: 1 })
  .toArray();

if (items.length) return items.map(publicPackage);
if (!fallbackToDefaults) return [];
return PACKAGES.map((item) => publicPackage({ ...item, status: 'active' }));
} catch (error) {
console.error('Tour package lookup failed:', error);
if (!fallbackToDefaults) return [];
return PACKAGES.map((item) => publicPackage({ ...item, status: 'active' }));
}
}

export async function upsertTourPackage(input) {
await ensureIndexes();
const db = await getDb();
const now = new Date();
const id = clean(input.id);
const title = clean(input.title);
const slug = slugifyContent(input.slug || title);

if (!title || !slug) throw new Error('Tour package title is required.');

const item = {
slug,
title,
duration: clean(input.duration),
price: numberValue(input.price),
image: clean(input.image),
description: clean(input.description),
inclusions: String(input.inclusions || '').split(',').map(clean).filter(Boolean),
tag: clean(input.tag),
status: clean(input.status) || 'active',
updatedAt: now,
};

if (id && ObjectId.isValid(id)) {
await db.collection('tourPackages').updateOne({ _id: new ObjectId(id) }, { $set: item });
return;
}

await db.collection('tourPackages').updateOne(
{ slug },
{ $set: item, $setOnInsert: { createdAt: now } },
{ upsert: true }
);
}

export async function deleteTourPackage(id) {
if (!ObjectId.isValid(id)) return;
const db = await getDb();
await db.collection('tourPackages').deleteOne({ _id: new ObjectId(id) });
}

export async function listBlogPosts({ includeInactive = false, fallbackToDefaults = true } = {}) {
try {
const db = await getDb();
const items = await db
  .collection('blogPosts')
  .find(includeInactive ? {} : { status: { $ne: 'inactive' } })
  .sort({ updatedAt: -1, date: -1, title: 1 })
  .toArray();

if (items.length) return items.map(publicBlogPost);
if (!fallbackToDefaults) return [];
return BLOG_POSTS.map((item) => publicBlogPost({ ...item, status: 'active' }));
} catch (error) {
console.error('Blog post lookup failed:', error);
if (!fallbackToDefaults) return [];
return BLOG_POSTS.map((item) => publicBlogPost({ ...item, status: 'active' }));
}
}

export async function upsertBlogPost(input) {
await ensureIndexes();
const db = await getDb();
const now = new Date();
const id = clean(input.id);
const title = clean(input.title);
const slug = slugifyContent(input.slug || title);

if (!title || !slug) throw new Error('Blog title is required.');

const item = {
slug,
title,
excerpt: clean(input.excerpt),
category: clean(input.category),
author: clean(input.author),
date: clean(input.date),
readMin: numberValue(input.readMin),
image: clean(input.image),
content: clean(input.content),
status: clean(input.status) || 'active',
updatedAt: now,
};

if (id && ObjectId.isValid(id)) {
await db.collection('blogPosts').updateOne({ _id: new ObjectId(id) }, { $set: item });
return;
}

await db.collection('blogPosts').updateOne(
{ slug },
{ $set: item, $setOnInsert: { createdAt: now } },
{ upsert: true }
);
}

export async function deleteBlogPost(id) {
if (!ObjectId.isValid(id)) return;
const db = await getDb();
await db.collection('blogPosts').deleteOne({ _id: new ObjectId(id) });
}

export async function listPopularRoutes({ includeInactive = false, fallbackToDefaults = true } = {}) {
try {
const db = await getDb();
const items = await db
  .collection('popularRoutes')
  .find(includeInactive ? {} : { status: { $ne: 'inactive' } })
  .sort({ updatedAt: -1, from: 1, to: 1 })
  .toArray();

if (items.length) return items.map(publicRoute);
if (!fallbackToDefaults) return [];
return ROUTES.map((item) => publicRoute({ ...item, status: 'active' }));
} catch (error) {
console.error('Popular routes lookup failed:', error);
if (!fallbackToDefaults) return [];
return ROUTES.map((item) => publicRoute({ ...item, status: 'active' }));
}
}

export async function upsertPopularRoute(input) {
await ensureIndexes();
const db = await getDb();
const now = new Date();
const id = clean(input.id);
const from = clean(input.from);
const to = clean(input.to);
const slug = slugifyContent(input.slug || `${from}-${to}`);

if (!from || !to || !slug) throw new Error('Route from and to locations are required.');

const item = {
slug,
from,
to,
distance: clean(input.distance),
duration: clean(input.duration),
price: numberValue(input.price),
image: clean(input.image),
status: clean(input.status) || 'active',
updatedAt: now,
};

if (id && ObjectId.isValid(id)) {
await db.collection('popularRoutes').updateOne({ _id: new ObjectId(id) }, { $set: item });
return;
}

await db.collection('popularRoutes').updateOne(
{ slug },
{ $set: item, $setOnInsert: { createdAt: now } },
{ upsert: true }
);
}

export async function deletePopularRoute(id) {
if (!ObjectId.isValid(id)) return;
const db = await getDb();
await db.collection('popularRoutes').deleteOne({ _id: new ObjectId(id) });
}

export async function createBooking(input) {
try {
const session = await getSession();
if (!session?.userId) throw new Error('Please log in before booking.');
await ensureIndexes();
const bookingId = await nextBookingId();
const now = new Date();
const pickupDate = clean(input.date);
const returnDate = input.tripType === 'round-trip' ? clean(input.returnDate || pickupDate) : clean(input.returnDate);
if (input.tripType === 'round-trip' && returnDate && pickupDate && returnDate < pickupDate) {
  throw new Error('Return date cannot be before pickup date.');
}
if (input.tripType === 'round-trip' && dateTimeValue(returnDate || pickupDate, input.returnTime) < dateTimeValue(pickupDate, input.time)) {
  throw new Error('Return date and time cannot be before pickup date and time.');
}
const fareInput = {
  ...input,
  date: pickupDate,
  returnDate,
};
const cabs = await listCabs({ fallbackToFleet: false });
const cab = cabs.find((item) => item.slug === input.vehicleSlug || item.name === input.vehicleName) || {};
if (!cab.slug && !cab.name) {
  throw new Error('Selected cab is no longer available.');
}
if (!validCustomerName(input.name)) {
  throw new Error('Please enter a real first and last name.');
}
if (!validCustomerPhone(input.phone)) {
  throw new Error('Please enter a valid mobile number.');
}
if (!validCustomerEmail(input.email)) {
  throw new Error('Please enter a valid email address.');
}
const incomingFare = input.fare || {};
const selectedAddons = Array.isArray(incomingFare.selectedAddons) ? incomingFare.selectedAddons : [];
const addonTotal = Number(incomingFare.addons || 0);
const pricingSettings = await getPricingSettings();
const roundTripReturnLeadTimeMinutes = Number(pricingSettings.roundTripReturnLeadTimeMinutes || 0);
if (input.tripType === 'round-trip' && roundTripReturnLeadTimeMinutes > 0) {
  const minimumReturnTime = new Date(`${pickupDate}T${input.time || '00:00'}`);
  const requestedReturnTime = new Date(`${returnDate || pickupDate}T${input.returnTime || '00:00'}`);
  minimumReturnTime.setMinutes(minimumReturnTime.getMinutes() + roundTripReturnLeadTimeMinutes);
  if (!Number.isNaN(requestedReturnTime.getTime()) && requestedReturnTime < minimumReturnTime) {
    throw new Error(`Return time must be at least ${roundTripReturnLeadTimeMinutes} minutes after pickup time.`);
  }
}
const pickupLeadTimeMinutes = Number(pricingSettings.pickupLeadTimeMinutes || 0);
const minimumPickupTime = new Date(Date.now() + Math.max(pickupLeadTimeMinutes, 0) * 60 * 1000);
const requestedPickupTime = new Date(`${pickupDate}T${input.time || '00:00'}`);
if (!Number.isNaN(requestedPickupTime.getTime()) && requestedPickupTime < minimumPickupTime) {
  throw new Error(`Pickup time must be at least ${pickupLeadTimeMinutes} minutes from now.`);
}
const unavailableReason = serviceUnavailableReason({ ...input, date: pickupDate }, pricingSettings);
if (unavailableReason) {
  throw new Error(unavailableReason);
}
if (!serviceCityAllowed(input.pickup, pricingSettings)) {
  throw new Error('Pickup city is not service available.');
}
if (input.tripType === 'airport' && !airportServiceAllowed(input.pickup, pricingSettings) && !airportServiceAllowed(input.drop, pricingSettings)) {
  throw new Error('Selected airport is not service available.');
}
const blockedHoliday = holidayConflict({ ...input, date: pickupDate, returnDate }, pricingSettings);
if (blockedHoliday) {
  throw new Error(`Bookings are not available on holiday ${blockedHoliday}.`);
}
const addonObjects = selectedAddons.some((addon) => typeof addon !== 'string')
  ? selectedAddons.map((addon) => addon?.id === 'language'
      ? {
          ...addon,
          label: String(input.languagePreference || input.selectedOptions?.languagePreference || '').toLowerCase() === 'english'
            ? 'English chauffeur language'
            : 'Hindi chauffeur language',
          price: String(input.languagePreference || input.selectedOptions?.languagePreference || '').toLowerCase() === 'english'
            ? numberValue(pricingSettings.languageAddonPrice)
            : 0
        }
      : addon)
  : addonTotal > 0
    ? [{ id: 'selected-addons', price: addonTotal }]
    : [];
const fare = {
  ...calculateTripFare(cab, fareInput, addonObjects, pricingSettings),
  selectedAddons,
  paymentOption: incomingFare.paymentOption || 'part',
};
const payAfterRide = fare.paymentOption === 'later';
const requestedPaymentAmount = payAfterRide ? 0 : numberValue(incomingFare.advancePaid || (fare.paymentOption === 'full' ? fare.total : fare.partPay));
const passengerLabel = clean(input.passengers) || `${numberValue(cab.seats, 4)} Passengers`;
const upiId = clean(pricingSettings.upiId) || UPI_ID;
const upiBusinessName = clean(pricingSettings.upiBusinessName) || UPI_BUSINESS_NAME;

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

  status: payAfterRide ? 'new' : 'pending_payment',

  tripType: input.tripType,
  pickup: input.pickup,
  drop: input.drop || '',
  rental: input.rental || '',
  pickupDate,
  pickupTime: input.time || '',
  returnDate,
  returnTime: input.returnTime || '',
  stops: Array.isArray(input.stops) ? input.stops : [],
  passengers: passengerLabel,
  selectedOptions: {
    ...(input.selectedOptions || {}),
    fuelType: input.fuelType || input.selectedOptions?.fuelType || '',
    languagePreference: input.languagePreference || input.selectedOptions?.languagePreference || '',
    addons: addonObjects,
    stops: Array.isArray(input.stops) ? input.stops : [],
    dropAddress: input.dropAddress || '',
  },

  vehicleSlug: input.vehicleSlug,
  vehicleName: input.vehicleName || '',
  packageSlug: input.packageSlug || '',

  customer: {
    name: input.name,
    phone: input.phone,
    email: normalizeEmail(input.email),
    address: input.address || '',
    dropAddress: input.dropAddress || '',
  },

  fare,
  paymentMethod: payAfterRide ? 'pay_after_ride' : 'upi',
  upiId,
  upiBusinessName,
  paymentAmount: requestedPaymentAmount,
  paymentStatus: payAfterRide ? 'pay_after_ride' : 'pending',
  paymentScreenshot: '',
  paymentReference: '',
  paymentSubmittedAt: null,
  paymentVerifiedAt: null,
  paymentVerifiedBy: '',
  payment: {
    method: payAfterRide ? 'pay_after_ride' : 'upi',
    option: fare.paymentOption,
    amount: requestedPaymentAmount,
    upiId,
    businessName: upiBusinessName,
    provider: payAfterRide ? 'cash_after_ride' : 'upi_deep_link',
    status: payAfterRide ? 'pay_after_ride' : 'pending'
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

const createdBooking = publicBooking({
  ...booking,
  _id: result.insertedId,
});

after(() => notifyBookingEmails(createdBooking).catch((error) => console.error('New booking email failed:', error)));

return createdBooking;

} catch (error) {
console.error('CREATE BOOKING ERROR:', error);
throw error;
}
}

export async function getPublicBookingById(bookingId) {
try {
const db = await getDb();
const booking = await db.collection('bookings').findOne({ bookingId: clean(bookingId) });
return booking ? publicBooking(booking) : null;
} catch (error) {
console.error('Booking lookup failed:', error);
return null;
}
}

export async function submitUpiPayment(input) {
const bookingId = clean(input.bookingId);
if (!bookingId) throw new Error('Booking ID is required.');
const db = await getDb();
const update = {
  status: 'pending_verification',
  paymentStatus: 'pending_verification',
  paymentScreenshot: clean(input.paymentScreenshot),
  paymentReference: clean(input.paymentReference),
  paymentSubmittedAt: new Date(),
  updatedAt: new Date(),
  'payment.status': 'pending_verification',
};
await db.collection('bookings').updateOne({ bookingId }, { $set: update });
const booking = await getPublicBookingById(bookingId);
if (booking) {
  after(() => notifyPaymentSubmittedEmail(booking).catch((error) => console.error('Payment submitted email failed:', error)));
}
return booking;
}

export async function verifyUpiPayment(input) {
const id = clean(input.id);
if (!ObjectId.isValid(id)) throw new Error('Invalid booking id.');
const approve = input.decision === 'approve';
const session = await getSession();
const db = await getDb();
const update = approve
  ? {
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentVerifiedAt: new Date(),
      paymentVerifiedBy: session?.email || session?.userId || 'admin',
      notes: clean(input.notes),
      updatedAt: new Date(),
      'payment.status': 'paid',
    }
  : {
      status: 'payment_rejected',
      paymentStatus: 'rejected',
      paymentRejectedAt: new Date(),
      paymentVerifiedBy: session?.email || session?.userId || 'admin',
      notes: clean(input.notes),
      updatedAt: new Date(),
      'payment.status': 'rejected',
    };
await db.collection('bookings').updateOne({ _id: new ObjectId(id) }, { $set: update });
const saved = await db.collection('bookings').findOne({ _id: new ObjectId(id) });
const booking = saved ? publicBooking(saved) : null;
if (booking && approve) {
  after(() => notifyPaymentVerifiedEmail(booking).catch((error) => console.error('Payment verified email failed:', error)));
}
if (booking && !approve) {
  after(() => notifyPaymentRejectedEmail(booking).catch((error) => console.error('Payment rejected email failed:', error)));
}
return booking;
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

export async function listContactMessages() {
try {
const db = await getDb();
const messages = await db.collection('contactMessages').find({}).sort({ createdAt: -1 }).limit(100).toArray();
return messages.map((item) => ({
  id: item._id?.toString?.() || '',
  name: item.name || '',
  phone: item.phone || '',
  email: item.email || '',
  subject: item.subject || '',
  message: item.message || '',
  status: item.status || 'new',
  createdAt: item.createdAt || null,
}));
} catch (error) {
console.error('Contact messages lookup failed:', error);
return [];
}
}

export async function deleteContactMessage(id) {
const cleanId = clean(id);
if (!ObjectId.isValid(cleanId)) return;
const db = await getDb();
await db.collection('contactMessages').deleteOne({ _id: new ObjectId(cleanId) });
}

export async function updateBooking(input) {
const id = clean(input.id);
if (!ObjectId.isValid(id)) return;
const db = await getDb();
const existing = await db.collection('bookings').findOne({ _id: new ObjectId(id) });
if (!existing) return;
const pickupDate = clean(input.pickupDate) || clean(existing.pickupDate);
const pickupTime = clean(input.pickupTime) || clean(existing.pickupTime);
const returnDate = clean(input.returnDate);
const returnTime = clean(input.returnTime);
if (existing.tripType === 'round-trip' && returnDate && pickupDate && returnDate < pickupDate) {
  throw new Error('Return date cannot be before pickup date.');
}
if (existing.tripType === 'round-trip' && dateTimeValue(returnDate || pickupDate, returnTime) < dateTimeValue(pickupDate, pickupTime)) {
  throw new Error('Return date and time cannot be before pickup date and time.');
}
await db.collection('bookings').updateOne(
{ _id: new ObjectId(id) },
{
  $set: {
    status: clean(input.status) || 'new',
    'fare.total': numberValue(input.totalFare),
    pickupDate,
    pickupTime,
    returnDate: existing.tripType === 'round-trip' ? returnDate : '',
    returnTime: existing.tripType === 'round-trip' ? returnTime : '',
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

function holidayConflict(data = {}, settings = {}) {
const holidays = (Array.isArray(settings.holidays) ? settings.holidays : [])
  .flatMap((item) => String(item || '').match(/\d{4}-\d{2}-\d{2}/g) || [])
  .filter(Boolean);
if (!holidays.length) return null;
const dates = data.tripType === 'round-trip' ? dateRange(data.date, data.returnDate || data.date) : [data.date];
return dates.find((date) => holidays.includes(date)) || null;
}

function serviceUnavailableReason(data = {}, settings = {}) {
if (settings.dutyEnabled === false) {
  return 'Service is not available right now. Please try again when duty is on.';
}
if (data.tripType === 'one-way' && settings.oneWayEnabled === false) {
  return 'One way service is not available right now. Please choose another trip type.';
}
const pickup = localDateTime(data.date || data.pickupDate, data.time || data.pickupTime);
const start = localDateTime(settings.dutyOffStart);
const end = localDateTime(settings.dutyOffEnd);
if (pickup && start && end && end > start && pickup >= start && pickup <= end) {
  return 'Service is unavailable for the selected date and time.';
}
return '';
}

function localDateTime(date, time = '') {
const value = time ? `${String(date || '').slice(0, 10)}T${time}` : String(date || '');
const parsed = new Date(value);
return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function dateRange(start, end) {
if (!start) return [];
const dates = [];
const current = new Date(`${start}T00:00:00`);
const last = new Date(`${end || start}T00:00:00`);
if (Number.isNaN(current.getTime()) || Number.isNaN(last.getTime())) return [start];
while (current <= last) {
  const year = current.getFullYear();
  const month = String(current.getMonth() + 1).padStart(2, '0');
  const day = String(current.getDate()).padStart(2, '0');
  dates.push(`${year}-${month}-${day}`);
  current.setDate(current.getDate() + 1);
}
return dates;
}

export function publicUser(user) {
return {
id: user._id?.toString?.() || user.id || user.firebaseUid,
firebaseUid: user.firebaseUid || '',
name: user.name || '',
email: user.email || '',
phone: user.phone || '',
role: user.role || 'customer',
bookingCount: Number(user.bookingCount || 0),
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

export async function listUsersWithBookingCounts() {
try {
const users = await listUsers();
const db = await getDb();

const usersWithCounts = await Promise.all(
users.map(async (user) => {
  const filters = [];

  if (ObjectId.isValid(user.id)) {
    filters.push({ customerId: new ObjectId(user.id) });
  }

  if (user.firebaseUid) {
    filters.push({ firebaseUid: user.firebaseUid });
  }

  if (user.email) {
    filters.push({ 'customer.email': normalizeEmail(user.email) });
  }

  if (user.phone) {
    filters.push({ 'customer.phone': user.phone });
  }

  const bookingCount = filters.length
    ? await db.collection('bookings').countDocuments({ $or: filters })
    : 0;
  const bookings = bookingCount ? await listCustomerBookings(user) : [];

  return {
    ...user,
    bookingCount,
    bookings,
  };
})
);

return usersWithCounts.sort((first, second) => {
const countDiff = Number(second.bookingCount || 0) - Number(first.bookingCount || 0);
if (countDiff) return countDiff;
return new Date(second.createdAt || 0) - new Date(first.createdAt || 0);
});
} catch (error) {
console.error('User booking count lookup failed:', error);
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

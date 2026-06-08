// lib/crm.js

import { ObjectId } from 'mongodb';
import { getDb, ensureIndexes } from './mongodb';
import { getSession } from './auth';

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
passengers: booking.passengers,
vehicleSlug: booking.vehicleSlug,
vehicleName: booking.vehicleName,
packageSlug: booking.packageSlug,
customer: booking.customer,
fare: booking.fare,
notes: booking.notes || '',
createdAt: booking.createdAt,
updatedAt: booking.updatedAt,
};
}

export async function createBooking(input) {
try {
await ensureIndexes();


const session = await getSession();
const bookingId = await nextBookingId();
const now = new Date();

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

  fare: input.fare || null,
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
// app/api/bookings/route.js

import { createBooking, listAdminBookings } from '@/lib/crm';
import { getSession } from '@/lib/auth';
import { getCookieValue, VERIFIED_COOKIE, verifyPhoneCookie } from '@/lib/otp-verification';

function required(value) {
return String(value || '').trim();
}

function dateValue(value) {
return required(value).slice(0, 10);
}

function dateTimeValue(date, time) {
return `${dateValue(date)}T${required(time) || '00:00'}`;
}

function validCustomerName(value) {
const parts = required(value).split(/\s+/).filter(Boolean);
if (parts.length < 2) return false;
return parts.every((part) => /^[A-Za-z][A-Za-z.'-]{1,}$/.test(part) && !/(.)\1{2,}/i.test(part));
}

function validCustomerPhone(value) {
const raw = required(value);
const digits = raw.replace(/\D/g, '');
if (/^(\d)\1+$/.test(digits)) return false;
if (/^(\d{2,5})\1+$/.test(digits)) return false;
if (raw.startsWith('+91')) return /^[6-9]\d{9}$/.test(digits.slice(-10));
return digits.length >= 7 && digits.length <= 15;
}

function validCustomerEmail(value) {
const email = required(value).toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return false;
const [local, domain = ''] = email.split('@');
if (local.length < 5 || /^x+$/i.test(local) || /(.)\1{3,}/i.test(local)) return false;
return domain.includes('.') && !domain.startsWith('.') && !domain.endsWith('.');
}

export async function POST(request) {
try {
const session = await getSession();
if (!session?.userId) {
  return Response.json({ success: false, error: 'Please log in before booking.' }, { status: 401 });
}
const body = await request.json();


const errors = [];

if (!required(body.tripType))
  errors.push('Trip type is required.');

if (!required(body.pickup))
  errors.push('Exact pickup address is required.');

if (body.tripType !== 'local' && !required(body.drop))
  errors.push('Exact drop address is required.');

if (!required(body.date))
  errors.push('Pickup date is required.');

if (
  body.tripType === 'round-trip' &&
  dateValue(body.returnDate || body.date) < dateValue(body.date)
) {
  errors.push('Return date cannot be before pickup date.');
}

if (
  body.tripType === 'round-trip' &&
  dateTimeValue(body.returnDate || body.date, body.returnTime) < dateTimeValue(body.date, body.time)
) {
  errors.push('Return date and time cannot be before pickup date and time.');
}

if (!required(body.vehicleSlug))
  errors.push('Vehicle is required.');

if (!required(body.name))
  errors.push('Customer name is required.');
else if (!validCustomerName(body.name))
  errors.push('Please enter a real first and last name.');

if (!required(body.phone))
  errors.push('Customer phone is required.');
else if (!validCustomerPhone(body.phone))
  errors.push('Please enter a valid mobile number.');
else if (!verifyPhoneCookie(getCookieValue(request, VERIFIED_COOKIE), body.phone))
  errors.push('Please verify your mobile number with OTP.');

if (!required(body.email))
  errors.push('Customer email is required.');
else if (!validCustomerEmail(body.email))
  errors.push('Please enter a valid email address.');

if (errors.length) {
  return Response.json(
    {
      success: false,
      errors,
    },
    {
      status: 400,
    }
  );
}

const booking = await createBooking(body);

return Response.json(
  {
    success: true,
    booking,
  },
  {
    status: 201,
  }
);


} catch (error) {
console.error('BOOKING API ERROR:', error);

const message = error?.message || 'Unable to create booking';

return Response.json(
  {
    success: false,
    error: message,
  },
  {
    status: message.includes('Service is not available') ? 503 : 500,
  }
);


}
}

export async function GET() {
try {
const session = await getSession();


if (!session) {
  return Response.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}

if (session.role !== 'admin') {
  return Response.json(
    { error: 'Forbidden' },
    { status: 403 }
  );
}

const bookings = await listAdminBookings();

return Response.json({
  success: true,
  bookings,
});


} catch (error) {
console.error('GET BOOKINGS ERROR:', error);


return Response.json(
  {
    success: false,
    error: error?.message || 'Unable to load bookings',
  },
  {
    status: 500,
  }
);


}
}

// app/api/bookings/route.js

import { createBooking, listAdminBookings } from '@/lib/crm';
import { getSession } from '@/lib/auth';

function required(value) {
return String(value || '').trim();
}

export async function POST(request) {
try {
const body = await request.json();


const errors = [];

if (!required(body.tripType))
  errors.push('Trip type is required.');

if (!required(body.pickup))
  errors.push('Pickup location is required.');

if (body.tripType !== 'local' && !required(body.drop))
  errors.push('Drop location is required.');

if (!required(body.date))
  errors.push('Pickup date is required.');

if (!required(body.vehicleSlug))
  errors.push('Vehicle is required.');

if (!required(body.name))
  errors.push('Customer name is required.');

if (!required(body.phone))
  errors.push('Customer phone is required.');

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


return Response.json(
  {
    success: false,
    error: error?.message || 'Unable to create booking',
  },
  {
    status: 500,
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

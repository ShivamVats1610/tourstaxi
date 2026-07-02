const OLD_STATUSES = new Set(['completed', 'cancelled']);

export function todayDateValue() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

export function bookingTripDate(booking = {}) {
  return String(booking.returnDate || booking.pickupDate || '').slice(0, 10);
}

export function isOldBooking(booking = {}, today = todayDateValue()) {
  if (OLD_STATUSES.has(String(booking.status || ''))) return true;
  const tripDate = bookingTripDate(booking);
  return Boolean(tripDate && tripDate < today);
}

export function isNewBooking(booking = {}, today = todayDateValue()) {
  return !isOldBooking(booking, today);
}

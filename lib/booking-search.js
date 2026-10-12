export function filterBookingsBySearch(bookings = [], query = '') {
  const needle = normalize(query);
  if (!needle) return bookings;
  return bookings.filter((booking) => bookingSearchText(booking).includes(needle));
}

function bookingSearchText(booking = {}) {
  const fare = booking.fare || {};
  const payment = booking.payment || {};
  const customer = booking.customer || {};
  const selectedOptions = booking.selectedOptions || {};
  const values = [
    booking.id,
    booking.bookingId,
    booking.status,
    booking.paymentStatus,
    booking.tripType,
    booking.pickup,
    booking.drop,
    booking.rental,
    booking.pickupDate,
    booking.pickupTime,
    booking.returnDate,
    booking.returnTime,
    booking.vehicleName,
    booking.vehicleSlug,
    booking.passengers,
    booking.notes,
    booking.paymentReference,
    customer.name,
    customer.phone,
    customer.email,
    customer.address,
    customer.dropAddress,
    selectedOptions.fuelType,
    selectedOptions.languagePreference,
    payment.method,
    payment.status,
    payment.option,
    fare.total,
    fare.totalFare,
    fare.advancePaid,
    fare.paymentOption,
    fare.actualDistance,
    fare.minimumDistance,
    fare.chargeableDistance,
    fare.vehicleRate,
    ...(Array.isArray(booking.stops) ? booking.stops : []),
    ...(Array.isArray(selectedOptions.addons) ? selectedOptions.addons.map((addon) => addon?.label || addon?.id || addon) : []),
    ...(Array.isArray(fare.selectedAddons) ? fare.selectedAddons.map((addon) => addon?.label || addon?.id || addon) : []),
  ];
  return normalize(values.filter((value) => value !== undefined && value !== null).join(' '));
}

function normalize(value) {
  return String(value || '').toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

import { getPublicBookingById, upiDeepLink, UPI_ID } from '@/lib/crm';

export async function GET(_request, { params }) {
  const { bookingId } = await params;
  const booking = await getPublicBookingById(bookingId);
  if (!booking) {
    return Response.json({ success: false, error: 'Booking not found.' }, { status: 404 });
  }

  return Response.json({
    success: true,
    booking,
    upi: {
      id: UPI_ID,
      link: upiDeepLink(booking),
    },
  });
}

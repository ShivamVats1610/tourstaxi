import { getPublicBookingById, upiDeepLink, UPI_ID } from '@/lib/crm';
import { getPricingSettings } from '@/lib/pricing-settings';

export async function GET(_request, { params }) {
  const { bookingId } = await params;
  const booking = await getPublicBookingById(bookingId);
  if (!booking) {
    return Response.json({ success: false, error: 'Booking not found.' }, { status: 404 });
  }

  const settings = await getPricingSettings();

  return Response.json({
    success: true,
    booking,
    upi: {
      id: settings.upiId || booking.upiId || UPI_ID,
      businessName: settings.upiBusinessName || booking.upiBusinessName || 'ToursTaxi',
      link: upiDeepLink(booking, settings),
    },
  });
}

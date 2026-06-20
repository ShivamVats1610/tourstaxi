import crypto from 'crypto';
import { createBooking } from '@/lib/crm';

function required(value) {
  return String(value || '').trim();
}

export async function POST(request) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return Response.json({ success: false, error: 'Razorpay secret is not configured.' }, { status: 500 });
    }

    const body = await request.json();
    const payment = body.payment || {};
    const bookingInput = body.booking || {};
    const orderId = required(payment.razorpay_order_id);
    const paymentId = required(payment.razorpay_payment_id);
    const signature = required(payment.razorpay_signature);

    if (!orderId || !paymentId || !signature) {
      return Response.json({ success: false, error: 'Incomplete Razorpay payment response.' }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (expectedSignature !== signature) {
      return Response.json({ success: false, error: 'Payment verification failed.' }, { status: 400 });
    }

    const booking = await createBooking({
      ...bookingInput,
      fare: {
        ...(bookingInput.fare || {}),
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        paymentProvider: 'razorpay',
      },
    });

    return Response.json({
      success: true,
      booking,
      payment: {
        provider: 'razorpay',
        orderId,
        paymentId,
        status: 'verified',
      },
    });
  } catch (error) {
    console.error('RAZORPAY VERIFY ERROR:', error);
    return Response.json({ success: false, error: error?.message || 'Unable to verify payment.' }, { status: 500 });
  }
}

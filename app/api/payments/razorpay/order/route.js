function required(value) {
  return String(value || '').trim();
}

function moneyToPaise(value) {
  return Math.max(Math.round(Number(value || 0) * 100), 100);
}

export async function POST(request) {
  try {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return Response.json({ success: false, error: 'Razorpay keys are not configured.' }, { status: 500 });
    }

    const body = await request.json();
    const amount = moneyToPaise(body.amount);
    const receipt = required(body.receipt) || `ttx_${Date.now()}`;

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        receipt: receipt.slice(0, 40),
        notes: {
          source: 'tourstaxi-web',
          paymentOption: required(body.paymentOption) || 'part',
        },
      }),
    });

    const order = await response.json();
    if (!response.ok) {
      return Response.json({ success: false, error: order.error?.description || 'Unable to create Razorpay order.' }, { status: response.status });
    }

    return Response.json({
      success: true,
      keyId,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
    });
  } catch (error) {
    console.error('RAZORPAY ORDER ERROR:', error);
    return Response.json({ success: false, error: 'Unable to start Razorpay payment.' }, { status: 500 });
  }
}

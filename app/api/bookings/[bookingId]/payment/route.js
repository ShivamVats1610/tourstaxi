import { submitUpiPayment } from '@/lib/crm';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

export async function POST(request, { params }) {
  try {
    const { bookingId } = await params;
    const formData = await request.formData();
    const file = formData.get('screenshot');
    const paymentReference = String(formData.get('paymentReference') || '').trim();
    let paymentScreenshot = '';

    if (file && file.size) {
      if (!ALLOWED_TYPES.has(file.type)) {
        return Response.json({ success: false, error: 'Upload JPG, JPEG, PNG, or WEBP screenshot only.' }, { status: 400 });
      }
      if (file.size > MAX_FILE_SIZE) {
        return Response.json({ success: false, error: 'Screenshot must be 10 MB or smaller.' }, { status: 400 });
      }
      paymentScreenshot = await uploadToCloudinary(file);
    }

    const booking = await submitUpiPayment({ bookingId, paymentScreenshot, paymentReference });
    return Response.json({ success: true, booking });
  } catch (error) {
    console.error('UPI PAYMENT SUBMIT ERROR:', error);
    return Response.json({ success: false, error: error?.message || 'Unable to submit payment.' }, { status: 500 });
  }
}

async function uploadToCloudinary(file) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials are required for payment screenshot uploads.');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'tourstaxi/payments';
  const crypto = await import('crypto');
  const signature = crypto
    .createHash('sha1')
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest('hex');

  const body = new FormData();
  body.append('file', file);
  body.append('api_key', apiKey);
  body.append('timestamp', String(timestamp));
  body.append('folder', folder);
  body.append('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body,
  });
  const result = await response.json();
  if (!response.ok || !result.secure_url) {
    throw new Error(result.error?.message || 'Screenshot upload failed.');
  }
  return result.secure_url;
}

import { cookieHeader, generateOtp, normalizeOtpPhone, phoneSmsNumber, signOtpRequest } from '@/lib/otp-verification';

export const dynamic = 'force-dynamic';

const AQUASMS_API_KEY = process.env.AQUASMS_API_KEY || 'd0bd7a75-2aaa-4722-8cfd-46d6c3f0d856';
const AQUASMS_USERNAME = process.env.AQUASMS_USERNAME || '8952074176otp';
const AQUASMS_SENDER = process.env.AQUASMS_SENDER || 'CRTFUL';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const phone = normalizeOtpPhone(body.phone);
    const smsNumber = phoneSmsNumber(phone);

    if (!/^\d{10,15}$/.test(smsNumber)) {
      return Response.json({ success: false, error: 'Please enter a valid mobile number.' }, { status: 400 });
    }

    const otp = generateOtp();
    const message = `Your ToursTaxi booking OTP is ${otp}. It is valid for 10 minutes.`;
    const url = new URL('https://login.aquasms.com/sendSMS');
    url.searchParams.set('username', AQUASMS_USERNAME);
    url.searchParams.set('message', message);
    url.searchParams.set('sendername', AQUASMS_SENDER);
    url.searchParams.set('smstype', 'TRANS');
    url.searchParams.set('numbers', smsNumber);
    url.searchParams.set('apikey', AQUASMS_API_KEY);

    const smsResponse = await fetch(url, { cache: 'no-store' });
    const smsText = await smsResponse.text();

    if (!smsResponse.ok || /error|invalid|failed/i.test(smsText)) {
      console.error('AquaSMS OTP send failed:', smsResponse.status, smsText);
      return Response.json({ success: false, error: 'Unable to send OTP right now.' }, { status: 502 });
    }

    return Response.json(
      { success: true, message: 'OTP sent successfully.' },
      { headers: { 'Set-Cookie': cookieHeader('tt_otp_request', signOtpRequest(phone, otp), 10 * 60) } }
    );
  } catch (error) {
    console.error('OTP SEND ERROR:', error);
    return Response.json({ success: false, error: 'Unable to send OTP right now.' }, { status: 500 });
  }
}

import { cookieHeader, generateOtp, normalizeOtpPhone, phoneSmsNumber, signOtpRequest } from '@/lib/otp-verification';

export const dynamic = 'force-dynamic';

const AQUASMS_API_KEY = process.env.AQUASMS_API_KEY || '';
const AQUASMS_USERNAME = process.env.AQUASMS_USERNAME || '';
const AQUASMS_SENDER = process.env.AQUASMS_SENDER || '';
const AQUASMS_PE_ID = process.env.AQUASMS_PE_ID || '';
const AQUASMS_TEMPLATE_ID = process.env.AQUASMS_TEMPLATE_ID || '';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const phone = normalizeOtpPhone(body.phone);
    const smsNumber = phoneSmsNumber(phone);

    if (!/^\d{10,15}$/.test(smsNumber)) {
      return Response.json({ success: false, error: 'Please enter a valid mobile number.' }, { status: 400 });
    }

    const missingConfig = [
      ['AQUASMS_API_KEY', AQUASMS_API_KEY],
      ['AQUASMS_USERNAME', AQUASMS_USERNAME],
      ['AQUASMS_SENDER', AQUASMS_SENDER],
    ].filter(([, value]) => !value).map(([name]) => name);

    if (missingConfig.length) {
      console.error('AquaSMS OTP configuration is incomplete:', missingConfig.join(', '));
      return Response.json({ success: false, error: 'OTP service is temporarily unavailable.' }, { status: 503 });
    }

    const otp = generateOtp();
    const message = `Your OTP code for verification is : ${otp} CRTFUL`;
    const url = new URL('https://login.aquasms.com/v2/sendSMS');
    url.searchParams.set('username', AQUASMS_USERNAME);
    url.searchParams.set('message', message);
    url.searchParams.set('sendername', AQUASMS_SENDER);
    url.searchParams.set('smstype', 'TRANS');
    url.searchParams.set('numbers', smsNumber);
    url.searchParams.set('apikey', AQUASMS_API_KEY);
    if (AQUASMS_PE_ID) url.searchParams.set('peid', AQUASMS_PE_ID);
    if (AQUASMS_TEMPLATE_ID) url.searchParams.set('templateid', AQUASMS_TEMPLATE_ID);

    const smsResponse = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(15_000) });
    const smsText = await smsResponse.text();

    if (!smsResponse.ok || !providerAccepted(smsText)) {
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

function providerAccepted(responseText) {
  const text = String(responseText || '').trim();
  if (!text) return false;

  try {
    const payload = JSON.parse(text);
    const records = Array.isArray(payload) ? payload : [payload];
    const statuses = records.map((record) => String(
      record?.status ?? record?.success ?? record?.type ?? record?.responseCode ?? ''
    ).toLowerCase());
    const hasError = statuses.some((status) =>
      /\b(false|error|failed|failure|invalid|rejected|denied|insufficient)\b/i.test(status)
    );
    if (hasError) return false;

    const messageId = records.find((record) =>
      record?.message_id ?? record?.messageId ?? record?.msgid ?? record?.id
    );
    if (messageId) return true;

    return statuses.some((status) => /\b(true|success|successfully|sent|submitted|queued)\b/i.test(status));
  } catch {
    if (/\b(error|invalid|failed|failure|rejected|denied|insufficient)\b/i.test(text)) return false;
    if (/\b(success|sent|submitted|queued)\b/i.test(text)) return true;

    // AquaSMS can return the provider message ID as an unwrapped text value.
    return /^[a-z0-9_-]{6,}$/i.test(text);
  }
}

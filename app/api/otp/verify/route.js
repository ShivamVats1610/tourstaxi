import { cookieHeader, expiredCookieHeader, getCookieValue, OTP_COOKIE, normalizeOtpPhone, signVerifiedPhone, verifyOtpRequestCookie } from '@/lib/otp-verification';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const phone = normalizeOtpPhone(body.phone);
    const otp = String(body.otp || '').trim();

    if (!/^\d{6}$/.test(otp)) {
      return Response.json({ success: false, error: 'Please enter the 6 digit OTP.' }, { status: 400 });
    }

    const requestCookie = getCookieValue(request, OTP_COOKIE);
    if (!verifyOtpRequestCookie(requestCookie, phone, otp)) {
      return Response.json({ success: false, error: 'Invalid or expired OTP.' }, { status: 400 });
    }

    const headers = new Headers();
    headers.append('Set-Cookie', cookieHeader('tt_otp_verified', signVerifiedPhone(phone), 30 * 60));
    headers.append('Set-Cookie', expiredCookieHeader(OTP_COOKIE));

    return Response.json({ success: true, message: 'Mobile number verified.' }, { headers });
  } catch (error) {
    console.error('OTP VERIFY ERROR:', error);
    return Response.json({ success: false, error: 'Unable to verify OTP right now.' }, { status: 500 });
  }
}

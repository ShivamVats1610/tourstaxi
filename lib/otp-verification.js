import crypto from 'crypto';

const OTP_SECRET = process.env.SESSION_SECRET || 'tourstaxi-dev-secret';
const OTP_TTL_MS = 10 * 60 * 1000;
const VERIFIED_TTL_MS = 30 * 60 * 1000;

export const OTP_COOKIE = 'tt_otp_request';
export const VERIFIED_COOKIE = 'tt_otp_verified';

export function normalizeOtpPhone(value) {
  const raw = String(value || '').trim();
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  if (raw.startsWith('+')) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
}

export function phoneSmsNumber(value) {
  return normalizeOtpPhone(value).replace(/\D/g, '');
}

export function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

export function signOtpRequest(phone, otp) {
  return signPayload({
    phone: normalizeOtpPhone(phone),
    otpHash: hashValue(otp),
    expiresAt: Date.now() + OTP_TTL_MS,
  });
}

export function signVerifiedPhone(phone) {
  return signPayload({
    phone: normalizeOtpPhone(phone),
    expiresAt: Date.now() + VERIFIED_TTL_MS,
  });
}

export function verifyOtpRequestCookie(cookieValue, phone, otp) {
  const payload = readSignedPayload(cookieValue);
  if (!payload || payload.expiresAt < Date.now()) return false;
  if (payload.phone !== normalizeOtpPhone(phone)) return false;
  return safeEqual(payload.otpHash, hashValue(otp));
}

export function verifyPhoneCookie(cookieValue, phone) {
  const payload = readSignedPayload(cookieValue);
  if (!payload || payload.expiresAt < Date.now()) return false;
  return payload.phone === normalizeOtpPhone(phone);
}

export function cookieHeader(name, value, maxAgeSeconds) {
  return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

export function expiredCookieHeader(name) {
  return `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function getCookieValue(request, name) {
  const cookie = request.headers.get('cookie') || '';
  return cookie
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`))
    ?.slice(name.length + 1) || '';
}

function signPayload(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', OTP_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

function readSignedPayload(value) {
  const [encoded, signature] = String(value || '').split('.');
  if (!encoded || !signature) return null;
  const expected = crypto.createHmac('sha256', OTP_SECRET).update(encoded).digest('base64url');
  if (!safeEqual(signature, expected)) return null;
  try {
    return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

function hashValue(value) {
  return crypto.createHmac('sha256', OTP_SECRET).update(String(value || '')).digest('base64url');
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ''));
  const rightBuffer = Buffer.from(String(right || ''));
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

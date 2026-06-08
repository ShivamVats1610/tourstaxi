import crypto from 'crypto';

export const SESSION_COOKIE = 'tourstaxi_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getSessionSecret() {
  return process.env.SESSION_SECRET || 'tourstaxi-dev-session-secret-change-me';
}

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function sign(value) {
  return crypto.createHmac('sha256', getSessionSecret()).update(value).digest('base64url');
}

export function createSessionToken(user) {
  const payload = base64url(JSON.stringify({
    userId: String(user._id || user.id || user.firebaseUid),
    firebaseUid: user.firebaseUid || '',
    role: user.role,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  }));

  return `${payload}.${sign(payload)}`;
}

export function parseSessionToken(token) {
  if (!token || !token.includes('.')) return null;

  const [payload, signature] = token.split('.');
  if (!signature || signature !== sign(payload)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!session.exp || session.exp < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

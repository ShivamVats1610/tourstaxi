import crypto from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ObjectId } from 'mongodb';
import { getDb } from './mongodb';
import { SESSION_COOKIE, SESSION_MAX_AGE, createSessionToken, parseSessionToken } from './session-token';

const PASSWORD_ITERATIONS = 120000;
const PASSWORD_KEYLEN = 64;
const PASSWORD_DIGEST = 'sha512';

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('base64url');
  const hash = await new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, PASSWORD_ITERATIONS, PASSWORD_KEYLEN, PASSWORD_DIGEST, (error, key) => {
      if (error) reject(error);
      else resolve(key.toString('base64url'));
    });
  });

  return `${PASSWORD_ITERATIONS}.${salt}.${hash}`;
}

export async function verifyPassword(password, stored) {
  const [iterations, salt, original] = String(stored || '').split('.');
  if (!iterations || !salt || !original) return false;

  const candidate = await new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, Number(iterations), PASSWORD_KEYLEN, PASSWORD_DIGEST, (error, key) => {
      if (error) reject(error);
      else resolve(key.toString('base64url'));
    });
  });

  return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(original));
}

export async function setSessionCookie(user) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionToken(user), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession() {
  const cookieStore = await cookies();
  return parseSessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function requireUser(requiredRole) {
  const session = await getSession();
  if (!session?.userId) redirect('/login');

  if (requiredRole && session.role !== requiredRole) {
    redirect(session.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard');
  }

  let user = null;

  try {
    const db = await getDb();
    const filter = ObjectId.isValid(session.userId)
      ? { _id: new ObjectId(session.userId) }
      : { firebaseUid: session.firebaseUid || session.userId };

    user = await db.collection('users').findOne(filter, { projection: { passwordHash: 0 } });
  } catch {
    console.warn('Dashboard profile lookup failed. Falling back to the signed session user.');
  }

  if (!user) return serializeSessionUser(session);
  if (requiredRole && user.role !== requiredRole) {
    redirect(user.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard');
  }

  return serializeUser(user);
}

export function serializeUser(user) {
  return {
    id: String(user._id || user.id || user.firebaseUid),
    firebaseUid: user.firebaseUid || '',
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    createdAt: user.createdAt?.toISOString?.() || user.createdAt || null,
    dbUnavailable: false,
  };
}

function serializeSessionUser(session) {
  return {
    id: session.userId,
    firebaseUid: session.firebaseUid || session.userId,
    name: session.name || 'ToursTaxi User',
    email: session.email || '',
    phone: session.phone || '',
    role: session.role || 'customer',
    createdAt: null,
    dbUnavailable: true,
  };
}

'use server';

import { redirect } from 'next/navigation';
import { getDb, ensureIndexes } from '@/lib/mongodb';
import { clearSessionCookie, setSessionCookie, verifyPassword } from '@/lib/auth';
import { normalizeEmail } from '@/lib/crm';

function clean(value) {
  return String(value || '').trim();
}

export async function createFirebaseSession(profile) {
  const firebaseUid = clean(profile?.firebaseUid);
  const email = normalizeEmail(profile?.email);
  const name = clean(profile?.name) || email.split('@')[0] || 'ToursTaxi User';
  const phone = clean(profile?.phone);
  const requestedRole = clean(profile?.role) === 'admin' ? 'admin' : 'customer';
  const adminCode = clean(profile?.adminCode);

  if (!firebaseUid || !email) {
    return { ok: false, message: 'Firebase login did not return a valid user.' };
  }

  if (requestedRole === 'admin') {
    const expected = process.env.ADMIN_REGISTRATION_CODE;
    if (!expected || adminCode !== expected) {
      return { ok: false, message: 'Admin registration code is invalid.' };
    }
  }

  const now = new Date();
  const fallbackUser = {
    id: firebaseUid,
    firebaseUid,
    name,
    email,
    phone,
    role: requestedRole,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await ensureIndexes();
    const db = await getDb();
    const existing = await db.collection('users').findOne({ $or: [{ firebaseUid }, { email }] });

    if (existing) {
      const role = existing.role || requestedRole;
      await db.collection('users').updateOne(
        { _id: existing._id },
        {
          $set: {
            firebaseUid,
            email,
            name: existing.name || name,
            phone: existing.phone || phone,
            role,
            updatedAt: now,
          },
          $unset: { passwordHash: '' },
        }
      );

      const user = { ...existing, firebaseUid, email, name: existing.name || name, phone: existing.phone || phone, role };
      await setSessionCookie(user);
      return { ok: true, redirectTo: role === 'admin' ? '/admin/dashboard' : '/customer/dashboard' };
    }

    const user = {
      firebaseUid,
      name,
      email,
      phone,
      role: requestedRole,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection('users').insertOne(user);
    await setSessionCookie({ ...user, _id: result.insertedId });
  } catch (error) {
    console.error('Firebase session profile sync failed:', error?.message || error);
    await setSessionCookie(fallbackUser);
  }

  return { ok: true, redirectTo: requestedRole === 'admin' ? '/admin/dashboard' : '/customer/dashboard' };
}

export async function verifyLegacyLogin(credentials) {
  const email = normalizeEmail(credentials?.email);
  const password = String(credentials?.password || '');

  if (!email || !password) {
    return { ok: false, message: 'Email and password are required.' };
  }

  let user = null;

  try {
    const db = await getDb();
    user = await db.collection('users').findOne({ email });
  } catch (error) {
    console.error('Legacy login lookup failed:', error?.message || error);
    return { ok: false, message: 'Old account lookup is unavailable. Please use Create account once to activate Firebase login.' };
  }

  if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    return { ok: false, message: 'Invalid email or password.' };
  }

  return {
    ok: true,
    profile: {
      email: user.email,
      name: user.name || '',
      phone: user.phone || '',
      role: user.role === 'admin' ? 'admin' : 'customer',
    },
  };
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect('/login');
}

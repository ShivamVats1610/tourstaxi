'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth';
import { deleteBooking, deleteCab, deleteUser, updateBooking, updateUser, upsertCab } from '@/lib/crm';
import { updatePricingSettings } from '@/lib/pricing-settings';

async function requireAdmin() {
  await requireUser('admin');
}

export async function saveCabAction(formData) {
  await requireAdmin();
  const imageFile = formData.get('imageFile');
  let image = String(formData.get('image') || '');

  if (imageFile && imageFile.size) {
    try {
      image = await uploadToCloudinary(imageFile);
    } catch (error) {
      console.error('Cab image upload failed:', error);
      if (!image) {
        throw error;
      }
    }
  }

  await upsertCab({
    id: formData.get('id'),
    slug: formData.get('slug'),
    name: formData.get('name'),
    category: formData.get('category'),
    image,
    seats: formData.get('seats'),
    luggage: formData.get('luggage'),
    ac: formData.get('ac') === 'on',
    features: formData.get('features'),
    pricePerKm: formData.get('pricePerKm'),
    localPricePerKm: formData.get('localPricePerKm'),
    local4hrPrice: formData.get('local4hrPrice'),
    local8hrPrice: formData.get('local8hrPrice'),
    local12hrPrice: formData.get('local12hrPrice'),
    startPrice: formData.get('startPrice'),
    fuelOptions: formData.getAll('fuelOptions'),
    badge: formData.get('badge'),
    status: formData.get('status'),
    description: formData.get('description'),
  });

  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/cars');
  revalidatePath('/fleet');
  revalidatePath('/fleet/[slug]', 'page');
  revalidatePath('/');
}

export async function deleteCabAction(formData) {
  await requireAdmin();
  await deleteCab(String(formData.get('id') || ''));
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/cars');
  revalidatePath('/fleet');
  revalidatePath('/fleet/[slug]', 'page');
  revalidatePath('/');
}

export async function updateBookingAction(formData) {
  await requireAdmin();
  await updateBooking({
    id: formData.get('id'),
    status: formData.get('status'),
    totalFare: formData.get('totalFare'),
    notes: formData.get('notes'),
  });
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/bookings/new');
  revalidatePath('/admin/bookings/old');
  revalidatePath('/customer/dashboard');
}

export async function deleteBookingAction(formData) {
  await requireAdmin();
  await deleteBooking(String(formData.get('id') || ''));
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/bookings/new');
  revalidatePath('/admin/bookings/old');
}

export async function updateUserAction(formData) {
  await requireAdmin();
  await updateUser({
    id: formData.get('id'),
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    role: formData.get('role'),
  });
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/customers');
}

export async function deleteUserAction(formData) {
  await requireAdmin();
  await deleteUser(String(formData.get('id') || ''));
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/customers');
}

export async function updatePricingSettingsAction(formData) {
  await requireAdmin();
  await updatePricingSettings({
    minimumBillingKmPerDay: formData.get('minimumBillingKmPerDay'),
    oneWayMinimumKm: formData.get('oneWayMinimumKm'),
    airportMinimumKm: formData.get('airportMinimumKm'),
    roundTripMinimumKmPerDay: formData.get('roundTripMinimumKmPerDay'),
    advancePercent: formData.get('advancePercent'),
  });
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/pricing');
  revalidatePath('/');
}

export async function updateProfileAction(formData) {
  const user = await requireUser('customer');
  await updateUser({
    id: user.id,
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    role: 'customer',
  });
  revalidatePath('/customer/dashboard');
}

async function uploadToCloudinary(file) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials are not configured.');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'tourstaxi/cabs';
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
  if (!response.ok) {
    throw new Error(result.error?.message || 'Cloudinary upload failed.');
  }

  return result.secure_url;
}

'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth';
import { deleteBlogPost, deleteBooking, deleteCab, deletePopularRoute, deleteTourPackage, deleteUser, updateBooking, updateUser, upsertBlogPost, upsertCab, upsertPopularRoute, upsertTourPackage, verifyUpiPayment } from '@/lib/crm';
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
  revalidatePath('/', 'layout');
}

export async function deleteCabAction(formData) {
  await requireAdmin();
  await deleteCab(String(formData.get('id') || ''));
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/cars');
  revalidatePath('/fleet');
  revalidatePath('/fleet/[slug]', 'page');
  revalidatePath('/');
  revalidatePath('/', 'layout');
}

export async function saveTourPackageAction(formData) {
  await requireAdmin();
  const imageFile = formData.get('imageFile');
  let image = String(formData.get('image') || '');

  if (imageFile && imageFile.size) {
    try {
      image = await uploadToCloudinary(imageFile, 'tourstaxi/packages');
    } catch (error) {
      console.error('Tour package image upload failed:', error);
      if (!image) throw error;
    }
  }

  await upsertTourPackage({
    id: formData.get('id'),
    slug: formData.get('slug'),
    title: formData.get('title'),
    duration: formData.get('duration'),
    price: formData.get('price'),
    image,
    description: formData.get('description'),
    inclusions: formData.get('inclusions'),
    tag: formData.get('tag'),
    status: formData.get('status'),
  });

  revalidatePath('/admin/tour-packages');
  revalidatePath('/tour-packages');
  revalidatePath('/tour-packages/[slug]', 'page');
  revalidatePath('/');
}

export async function deleteTourPackageAction(formData) {
  await requireAdmin();
  await deleteTourPackage(String(formData.get('id') || ''));
  revalidatePath('/admin/tour-packages');
  revalidatePath('/tour-packages');
  revalidatePath('/tour-packages/[slug]', 'page');
  revalidatePath('/');
}

export async function saveBlogPostAction(formData) {
  await requireAdmin();
  const imageFile = formData.get('imageFile');
  let image = String(formData.get('image') || '');

  if (imageFile && imageFile.size) {
    try {
      image = await uploadToCloudinary(imageFile, 'tourstaxi/blog');
    } catch (error) {
      console.error('Blog image upload failed:', error);
      if (!image) throw error;
    }
  }

  await upsertBlogPost({
    id: formData.get('id'),
    slug: formData.get('slug'),
    title: formData.get('title'),
    excerpt: formData.get('excerpt'),
    category: formData.get('category'),
    author: formData.get('author'),
    date: formData.get('date'),
    readMin: formData.get('readMin'),
    image,
    content: formData.get('content'),
    status: formData.get('status'),
  });

  revalidatePath('/admin/blog');
  revalidatePath('/blog');
  revalidatePath('/blog/[slug]', 'page');
  revalidatePath('/');
}

export async function deleteBlogPostAction(formData) {
  await requireAdmin();
  await deleteBlogPost(String(formData.get('id') || ''));
  revalidatePath('/admin/blog');
  revalidatePath('/blog');
  revalidatePath('/blog/[slug]', 'page');
  revalidatePath('/');
}

export async function savePopularRouteAction(formData) {
  await requireAdmin();
  const imageFile = formData.get('imageFile');
  let image = String(formData.get('image') || '');

  if (imageFile && imageFile.size) {
    try {
      image = await uploadToCloudinary(imageFile, 'tourstaxi/routes');
    } catch (error) {
      console.error('Popular route image upload failed:', error);
      if (!image) throw error;
    }
  }

  await upsertPopularRoute({
    id: formData.get('id'),
    slug: formData.get('slug'),
    from: formData.get('from'),
    to: formData.get('to'),
    distance: formData.get('distance'),
    duration: formData.get('duration'),
    price: formData.get('price'),
    image,
    status: formData.get('status'),
  });

  revalidatePath('/admin/routes');
  revalidatePath('/popular-routes');
  revalidatePath('/');
}

export async function deletePopularRouteAction(formData) {
  await requireAdmin();
  await deletePopularRoute(String(formData.get('id') || ''));
  revalidatePath('/admin/routes');
  revalidatePath('/popular-routes');
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

export async function verifyUpiPaymentAction(formData) {
  await requireAdmin();
  await verifyUpiPayment({
    id: formData.get('id'),
    decision: formData.get('decision'),
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
    localMinimumKm: formData.get('localMinimumKm'),
    oneWayBaseFare: formData.get('oneWayBaseFare'),
    roundTripBaseFare: formData.get('roundTripBaseFare'),
    roundTripDiscountPercent: formData.get('roundTripDiscountPercent'),
    airportBaseFare: formData.get('airportBaseFare'),
    localBaseFare: formData.get('localBaseFare'),
    driverAllowancePerDay: formData.get('driverAllowancePerDay'),
    gstPercent: formData.get('gstPercent'),
    dieselSurchargePerKm: formData.get('dieselSurchargePerKm'),
    advancePercent: formData.get('advancePercent'),
    carrierAddonPrice: formData.get('carrierAddonPrice'),
    newCarAddonPrice: formData.get('newCarAddonPrice'),
    languageAddonPrice: formData.get('languageAddonPrice'),
    serviceCities: formData.get('serviceCities'),
    holidays: formData.get('holidays'),
    facebookUrl: formData.get('facebookUrl'),
    instagramUrl: formData.get('instagramUrl'),
    youtubeUrl: formData.get('youtubeUrl'),
    xUrl: formData.get('xUrl'),
    googleBusinessUrl: formData.get('googleBusinessUrl'),
    whatsappNumber: formData.get('whatsappNumber'),
    callingNumber: formData.get('callingNumber'),
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

async function uploadToCloudinary(file, folder = 'tourstaxi/cabs') {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials are not configured.');
  }

  const timestamp = Math.floor(Date.now() / 1000);
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

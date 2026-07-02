import { getDb } from '@/lib/mongodb';
import { notifyContactMessageEmail } from '@/lib/email-notifier';

export const dynamic = 'force-dynamic';

function clean(value) {
  return String(value || '').trim();
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean(value).toLowerCase());
}

export async function POST(request) {
  try {
    const body = await request.json();
    const message = {
      name: clean(body.name),
      phone: clean(body.phone),
      email: clean(body.email).toLowerCase(),
      subject: clean(body.subject),
      message: clean(body.message),
      status: 'new',
      source: 'contact_page',
      createdAt: new Date(),
    };

    if (!message.name || !message.phone || !validEmail(message.email) || !message.message) {
      return Response.json({ success: false, error: 'Please fill name, phone, valid email, and message.' }, { status: 400 });
    }

    try {
      const db = await getDb();
      await db.collection('contactMessages').insertOne(message);
    } catch (error) {
      console.error('CONTACT SAVE FAILED:', error);
    }

    const emailResult = await notifyContactMessageEmail(message);
    return Response.json({ success: true, emailSkipped: Boolean(emailResult?.skipped) });
  } catch (error) {
    console.error('CONTACT API ERROR:', error);
    return Response.json({ success: false, error: 'Unable to send message right now.' }, { status: 500 });
  }
}

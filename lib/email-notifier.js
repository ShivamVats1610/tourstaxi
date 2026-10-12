import nodemailer from 'nodemailer';

function clean(value) {
  return String(value || '').trim();
}

function money(value) {
  const amount = Number(value || 0);
  return amount ? `Rs ${amount.toLocaleString('en-IN')}` : 'Pending';
}

function formatClock(value) {
  if (!value) return '';
  const [hours, minutes = '00'] = String(value).split(':');
  const date = new Date();
  date.setHours(Number(hours) || 0, Number(minutes) || 0, 0, 0);
  return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function labelTrip(value) {
  return String(value || 'Trip').replace('-', ' ');
}

function formatRoute(booking) {
  if (booking.tripType === 'local') {
    return `${booking.pickup || '-'} | ${booking.rental || 'Local rental'}`;
  }

  return `${booking.pickup || '-'} to ${booking.drop || '-'}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function detailRows(booking) {
  const customer = booking.customer || {};
  const fare = booking.fare || {};
  const options = booking.selectedOptions || {};
  const addons = Array.isArray(options.addons) ? options.addons : Array.isArray(fare.selectedAddons) ? fare.selectedAddons : [];
  const addonText = addons.map((addon) => addon.label || addon.id || addon).filter(Boolean).join(', ');

  return [
    ['Booking ID', booking.bookingId || '-'],
    ['Customer', customer.name || '-'],
    ['Phone', customer.phone || '-'],
    ['Email', customer.email || '-'],
    ['Trip Type', labelTrip(booking.tripType)],
    ['Route', formatRoute(booking)],
    ['Pickup', `${booking.pickupDate || '-'} ${formatClock(booking.pickupTime)}`.trim()],
    booking.returnDate ? ['Return', `${booking.returnDate} ${formatClock(booking.returnTime)}`.trim()] : null,
    ['Cab', booking.vehicleName || booking.vehicleSlug || '-'],
    ['Fuel Type', labelFuel(options.fuelType)],
    ['Passengers', booking.passengers || '-'],
    options.languagePreference ? ['Driver Language', options.languagePreference] : null,
    addonText ? ['Selected Add-ons', addonText] : null,
    booking.stops?.length ? ['Stops', booking.stops.filter(Boolean).join(' | ')] : null,
    ['Fare', money(fare.total || fare.totalFare)],
    ['Payment', paymentLabel(fare.paymentOption, booking.paymentStatus || booking.payment?.status)],
    customer.address ? ['Pickup Address', customer.address] : null,
    customer.dropAddress ? ['Drop Address', customer.dropAddress] : null,
    booking.notes ? ['Notes', booking.notes] : null,
  ].filter(Boolean);
}

function labelFuel(value) {
  if (!value) return '-';
  if (value === 'petrol') return 'Petrol';
  return value === 'diesel' ? 'Diesel' : 'CNG';
}

function bookingLines(booking) {
  return detailRows(booking).map(([label, value]) => `${label}: ${value}`);
}

function textMessage(title, booking, closing = '') {
  return [
    title,
    '',
    ...bookingLines(booking),
    closing ? '' : '',
    closing,
  ].filter(Boolean).join('\n');
}

function paymentLabel(option, status) {
  if (option === 'later' || status === 'pay_after_ride') return 'Pay after ride';
  if (status === 'paid') return 'Paid';
  if (status === 'pending_verification') return 'Pending verification';
  if (status === 'rejected') return 'Rejected';
  return 'Pending';
}

function htmlLayout({ title, eyebrow, intro, booking, footer }) {
  const rows = detailRows(booking).map(([label, value]) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#64748b;font-size:13px;font-weight:700;width:34%;">${escapeHtml(label)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#0f172a;font-size:14px;font-weight:700;">${escapeHtml(value)}</td>
    </tr>
  `).join('');

  return `
    <div style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
      <div style="max-width:640px;margin:0 auto;padding:24px 12px;">
        <div style="overflow:hidden;border-radius:14px;background:#ffffff;border:1px solid #e2e8f0;">
          <div style="background:#0f766e;padding:22px 24px;color:#ffffff;">
            <div style="font-size:12px;font-weight:900;letter-spacing:1.8px;text-transform:uppercase;">ToursTaxi</div>
            <h1 style="margin:8px 0 0;font-size:26px;line-height:1.2;">${escapeHtml(title)}</h1>
            <div style="margin-top:8px;font-size:14px;color:#ccfbf1;">${escapeHtml(eyebrow)}</div>
          </div>
          <div style="padding:22px 24px;">
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">${escapeHtml(intro)}</p>
            <div style="margin:18px 0;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                ${rows}
              </table>
            </div>
            <div style="border-radius:10px;background:#ecfeff;border:1px solid #99f6e4;padding:14px 16px;color:#134e4a;font-size:14px;font-weight:700;line-height:1.5;">
              ${escapeHtml(footer)}
            </div>
            <p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:#64748b;">
              Need help? Reply to this email or call ToursTaxi support.
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function customerHtml(booking) {
  const paid = (booking.paymentStatus || booking.payment?.status) === 'paid';
  const payLater = booking.fare?.paymentOption === 'later' || booking.paymentStatus === 'pay_after_ride';
  return htmlLayout({
    title: paid ? 'Booking Confirmed' : 'Booking Received',
    eyebrow: `Reference ${booking.bookingId || '-'}`,
    intro: `Hi ${booking.customer?.name || 'there'}, we have received your ToursTaxi cab booking. Our team will contact you about your trip and driver details before pickup.`,
    booking,
    footer: paid
      ? 'Your payment is verified and booking is confirmed. Please keep the booking ID handy for your trip.'
      : payLater
        ? 'You selected pay after ride. No online payment is required now. Our team will contact you to confirm your ride.'
        : 'Please complete your online payment and submit payment proof. Your booking is awaiting payment verification.',
  });
}

function adminHtml(booking) {
  return htmlLayout({
    title: 'New Taxi Booking',
    eyebrow: `Action required for ${booking.bookingId || '-'}`,
    intro: 'A new booking has been received from the website. Contact the customer and assign the cab/driver as needed.',
    booking,
    footer: 'Open the admin panel to update booking status, fare notes, and follow-up details.',
  });
}

function getTransporter() {
  const user = clean(process.env.GMAIL_USER || process.env.SMTP_USER);
  const pass = clean(process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS).replace(/\s+/g, '');

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });
}

export async function notifyBookingEmails(booking) {
  const transporter = getTransporter();
  const fromEmail = clean(process.env.MAIL_FROM || process.env.GMAIL_USER || process.env.SMTP_USER);
  const from = `"ToursTaxi" <${fromEmail}>`;
  const adminEmail = clean(process.env.ADMIN_NOTIFICATION_EMAIL || fromEmail);
  const customerEmail = clean(booking.customer?.email);

  if (!transporter || !fromEmail) return { skipped: true };

  const messages = [];

  if (adminEmail) {
    messages.push({
      from,
      to: adminEmail,
      replyTo: customerEmail || undefined,
      subject: `New taxi booking ${booking.bookingId || ''}`.trim(),
      text: textMessage('New Taxi Booking Alert', booking),
      html: adminHtml(booking),
    });
  }

  if (customerEmail) {
    messages.push({
      from,
      to: customerEmail,
      replyTo: adminEmail || undefined,
      subject: `ToursTaxi booking received ${booking.bookingId || ''}`.trim(),
      text: textMessage(
        'Your ToursTaxi booking has been received',
        booking,
        'Our team will contact you soon with driver details.'
      ),
      html: customerHtml(booking),
    });
  }

  if (!messages.length) return { skipped: true };

  await Promise.all(messages.map((message) => transporter.sendMail(message)));

  return { skipped: false };
}

export async function notifyPaymentSubmittedEmail(booking) {
  return sendTemplatedEmail({
    booking,
    customerSubject: `ToursTaxi payment submitted ${booking.bookingId || ''}`.trim(),
    adminSubject: `Payment submitted ${booking.bookingId || ''}`.trim(),
    title: 'Payment Submitted',
    intro: 'Payment proof has been submitted and is waiting for admin verification.',
    footer: 'Admin will verify the payment shortly. Booking remains pending verification until approval.',
  });
}

export async function notifyPaymentVerifiedEmail(booking) {
  return sendTemplatedEmail({
    booking,
    customerSubject: `ToursTaxi payment verified ${booking.bookingId || ''}`.trim(),
    adminSubject: `Payment verified ${booking.bookingId || ''}`.trim(),
    title: 'Payment Verified',
    intro: 'Your UPI payment has been verified by ToursTaxi.',
    footer: 'Your booking is now confirmed. Our team will contact you with driver details.',
  });
}

export async function notifyPaymentRejectedEmail(booking) {
  return sendTemplatedEmail({
    booking,
    customerSubject: `ToursTaxi payment needs attention ${booking.bookingId || ''}`.trim(),
    adminSubject: `Payment rejected ${booking.bookingId || ''}`.trim(),
    title: 'Payment Rejected',
    intro: 'The submitted payment proof could not be verified.',
    footer: 'Please retry payment or upload a clear screenshot from your customer dashboard.',
  });
}

export async function notifyContactMessageEmail(message = {}) {
  const transporter = getTransporter();
  const fromEmail = clean(process.env.MAIL_FROM || process.env.GMAIL_USER || process.env.SMTP_USER);
  const from = `"ToursTaxi" <${fromEmail}>`;
  const adminEmail = clean(process.env.ADMIN_NOTIFICATION_EMAIL || fromEmail);
  const customerEmail = clean(message.email);

  if (!transporter || !fromEmail || !adminEmail) return { skipped: true };

  await transporter.sendMail({
    from,
    to: adminEmail,
    replyTo: customerEmail || undefined,
    subject: `ToursTaxi contact message from ${clean(message.name) || 'website'}`,
    text: [
      'New Contact Page Message',
      '',
      `Name: ${clean(message.name) || '-'}`,
      `Phone: ${clean(message.phone) || '-'}`,
      `Email: ${customerEmail || '-'}`,
      `Subject: ${clean(message.subject) || '-'}`,
      '',
      clean(message.message) || '-',
    ].join('\n'),
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
        <h2>New Contact Page Message</h2>
        <p><b>Name:</b> ${escapeHtml(clean(message.name) || '-')}</p>
        <p><b>Phone:</b> ${escapeHtml(clean(message.phone) || '-')}</p>
        <p><b>Email:</b> ${escapeHtml(customerEmail || '-')}</p>
        <p><b>Subject:</b> ${escapeHtml(clean(message.subject) || '-')}</p>
        <div style="white-space:pre-wrap;border:1px solid #e5e7eb;border-radius:8px;padding:12px;">${escapeHtml(clean(message.message) || '-')}</div>
      </div>
    `,
  });

  return { skipped: false };
}

async function sendTemplatedEmail({ booking, customerSubject, adminSubject, title, intro, footer }) {
  const transporter = getTransporter();
  const fromEmail = clean(process.env.MAIL_FROM || process.env.GMAIL_USER || process.env.SMTP_USER);
  const from = `"ToursTaxi" <${fromEmail}>`;
  const adminEmail = clean(process.env.ADMIN_NOTIFICATION_EMAIL || fromEmail);
  const customerEmail = clean(booking.customer?.email);
  if (!transporter || !fromEmail) return { skipped: true };
  const messages = [];
  if (adminEmail) messages.push({ from, to: adminEmail, replyTo: customerEmail || undefined, subject: adminSubject, text: textMessage(title, booking, footer), html: htmlLayout({ title, eyebrow: `Reference ${booking.bookingId || '-'}`, intro, booking, footer }) });
  if (customerEmail) messages.push({ from, to: customerEmail, replyTo: adminEmail || undefined, subject: customerSubject, text: textMessage(title, booking, footer), html: htmlLayout({ title, eyebrow: `Reference ${booking.bookingId || '-'}`, intro, booking, footer }) });
  if (!messages.length) return { skipped: true };
  await Promise.all(messages.map((message) => transporter.sendMail(message)));
  return { skipped: false };
}

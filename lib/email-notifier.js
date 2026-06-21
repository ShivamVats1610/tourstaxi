import nodemailer from 'nodemailer';

function clean(value) {
  return String(value || '').trim();
}

function money(value) {
  const amount = Number(value || 0);
  return amount ? `Rs ${amount.toLocaleString('en-IN')}` : 'Pending';
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

  return [
    ['Booking ID', booking.bookingId || '-'],
    ['Customer', customer.name || '-'],
    ['Phone', customer.phone || '-'],
    ['Email', customer.email || '-'],
    ['Trip Type', labelTrip(booking.tripType)],
    ['Route', formatRoute(booking)],
    ['Pickup', `${booking.pickupDate || '-'} ${booking.pickupTime || ''}`.trim()],
    booking.returnDate ? ['Return', `${booking.returnDate} ${booking.returnTime || ''}`.trim()] : null,
    ['Cab', booking.vehicleName || booking.vehicleSlug || '-'],
    ['Passengers', booking.passengers || '-'],
    ['Fare', money(fare.total || fare.totalFare)],
    ['Payment', paymentLabel(fare.paymentOption, booking.payment?.status)],
    customer.address ? ['Pickup Address', customer.address] : null,
    booking.notes ? ['Notes', booking.notes] : null,
  ].filter(Boolean);
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
  if (option === 'after' || status === 'pay_after_ride') return 'Pay after ride';
  if (option === 'full') return 'Full fare paid online';
  if (option === 'part') return 'Advance paid online';
  return status || 'Pending';
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
  return htmlLayout({
    title: 'Booking Confirmed',
    eyebrow: `Reference ${booking.bookingId || '-'}`,
    intro: `Hi ${booking.customer?.name || 'there'}, your ToursTaxi cab booking is confirmed. We have received your trip request and our team will contact you with driver details before pickup.`,
    booking,
    footer: booking.fare?.paymentOption === 'after'
      ? 'Payment selected: Pay after ride. Please keep the booking ID handy for your trip.'
      : 'Your online payment selection has been received. Please keep the booking ID handy for your trip.',
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
      subject: `ToursTaxi booking confirmed ${booking.bookingId || ''}`.trim(),
      text: textMessage(
        'Your ToursTaxi booking is confirmed',
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

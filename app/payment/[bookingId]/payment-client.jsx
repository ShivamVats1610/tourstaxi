'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Copy, QrCode, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const UPI_APPS = ['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI', 'Other UPI Apps'];

export default function PaymentClient({ bookingId }) {
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [upi, setUpi] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/bookings/${bookingId}`, { cache: 'no-store' })
      .then((response) => response.json())
      .then((result) => {
        if (!result.success) throw new Error(result.error || 'Booking not found.');
        setBooking(result.booking);
        setUpi(result.upi);
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const qrUrl = useMemo(() => (
    upi?.link ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(upi.link)}` : ''
  ), [upi]);

  const submitPaid = async () => {
    setSubmitting(true);
    try {
      const form = new FormData();
      if (screenshot) form.append('screenshot', screenshot);
      form.append('paymentReference', paymentReference);
      const response = await fetch(`/api/bookings/${bookingId}/payment`, { method: 'POST', body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to submit payment.');
      setBooking(result.booking);
      toast.success('Payment submitted for verification.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <main className="min-h-screen bg-slate-50 px-4 pt-28 text-center font-bold text-slate-600">Loading payment...</main>;
  if (!booking || !upi) return <main className="min-h-screen bg-slate-50 px-4 pt-28 text-center font-bold text-red-700">Booking not found.</main>;

  const amount = Number(booking.paymentAmount || booking.fare?.total || 0);
  const canSubmit = !['pending_verification', 'paid'].includes(booking.paymentStatus);

  return (
    <main className="min-h-screen bg-[#f7faf9] px-3 pb-8 pt-20 sm:px-6 sm:pt-24">
      <div className="mx-auto max-w-5xl">
        <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
          <div className="bg-teal-700 px-4 py-3 text-white sm:px-5">
            <div className="text-[10px] font-black uppercase tracking-wider text-teal-100">ToursTaxi UPI Payment</div>
            <h1 className="mt-0.5 text-xl font-black sm:text-2xl">Complete Payment</h1>
          </div>
          <div className="grid gap-3 p-3 lg:grid-cols-[330px_1fr] lg:p-4">
            <aside className="h-fit rounded-lg border border-teal-100 bg-teal-50 p-3 text-center lg:sticky lg:top-24">
              <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-md bg-white text-teal-700"><QrCode className="h-4 w-4" /></div>
              <div className="mt-1 text-base font-black text-slate-950">Scan QR</div>
              <img src={qrUrl} alt="UPI QR code" className="mx-auto mt-2 h-48 w-48 rounded-md border border-slate-200 bg-white p-2 sm:h-56 sm:w-56" />
              <div className="mt-2 text-2xl font-black text-teal-800">{money(amount)}</div>

              <div className="mt-3 rounded-md border border-slate-200 bg-white p-2">
                <div className="text-xs font-black text-slate-950">Pay with UPI app</div>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  {UPI_APPS.map((app) => (
                    <a key={app} href={upi.link} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-2 text-[11px] font-black text-slate-950 transition hover:border-teal-300 hover:bg-teal-50">
                      {app}
                    </a>
                  ))}
                </div>
              </div>

              <div className="mt-2 rounded-md border border-slate-200 bg-white p-2 text-left">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">UPI ID</div>
                <div className="break-all text-xs font-black text-slate-950">{upi.id}</div>
                <Button type="button" variant="outline" onClick={() => {
                  navigator.clipboard?.writeText(upi.id);
                  toast.success('UPI ID copied.');
                }} className="mt-2 h-8 w-full rounded-md bg-white text-xs"><Copy className="h-3.5 w-3.5" /> Copy UPI ID</Button>
              </div>

              {canSubmit ? (
                <div className="mt-3 grid gap-2 text-left">
                  <Input value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} placeholder="UPI reference number (optional)" className="h-9 text-xs" />
                  <label className="rounded-md border border-dashed border-slate-300 bg-white p-2 text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5"><Upload className="h-3.5 w-3.5 text-teal-700" /> Upload Screenshot</span>
                    <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={(event) => setScreenshot(event.target.files?.[0] || null)} className="mt-1 w-full text-[11px]" />
                    <span className="mt-1 block text-[10px] text-slate-500">JPG, PNG, WEBP up to 10 MB.</span>
                  </label>
                  <Button onClick={submitPaid} disabled={submitting} className="h-10 rounded-md bg-teal-700 text-xs font-black text-white hover:bg-teal-800">
                    {submitting ? 'Submitting...' : 'I Have Paid'}
                  </Button>
                </div>
              ) : (
                <div className="mt-3 rounded-md border border-emerald-200 bg-white p-2 text-xs font-bold text-emerald-700">
                  <Check className="mr-1 inline h-3.5 w-3.5" /> Payment submitted. Verification pending.
                </div>
              )}
              <Link href="/customer/dashboard" className="mt-3 inline-flex text-xs font-black text-teal-800">Go to dashboard</Link>
            </aside>

            <section className="grid gap-3">
              <div className="grid gap-1.5 rounded-md bg-slate-50 p-3 text-xs font-semibold text-slate-700 sm:grid-cols-2">
                <Info label="Booking ID" value={booking.bookingId} />
                <Info label="Customer Name" value={booking.customer?.name || '-'} />
                <Info label="Vehicle" value={booking.vehicleName || booking.vehicleSlug || '-'} />
                <Info label="Trip Type" value={String(booking.tripType || '').replace('-', ' ')} />
                <Info label="Pickup" value={booking.pickup || '-'} />
                <Info label="Drop" value={booking.tripType === 'local' ? booking.rental : booking.drop || '-'} />
                <Info label="Travel Date" value={`${booking.pickupDate || '-'} ${booking.pickupTime || ''}`} />
                <Info label="Estimated Fare" value={money(booking.fare?.total)} />
                <Info label="Amount to Pay" value={money(amount)} strong />
                <Info label="Payment Status" value={labelStatus(booking.paymentStatus)} strong />
              </div>

              <div className="rounded-md border border-slate-200 bg-white p-3">
                <div className="text-sm font-black text-slate-950">Payment Instructions</div>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs font-semibold text-slate-700">
                  <li>Complete the payment using any UPI application.</li>
                  <li>Return to the website.</li>
                  <li>Click I Have Paid.</li>
                  <li>Upload screenshot if available.</li>
                  <li>Admin will verify the payment.</li>
                  <li>Booking will be confirmed after verification.</li>
                </ol>
                <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-[11px] font-bold text-amber-900">
                  If no UPI app opens, scan the QR code or copy the UPI ID.
                </div>
              </div>
            </section>
          </div>
        </motion.section>
      </div>
    </main>
  );
}

function Info({ label, value, strong = false }) {
  return <div><div className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</div><div className={`${strong ? 'text-teal-800' : 'text-slate-950'} text-xs font-black`}>{value || '-'}</div></div>;
}

function money(value) {
  return `Rs ${Number(value || 0).toLocaleString('en-IN')}`;
}

function labelStatus(value) {
  return String(value || 'pending').replaceAll('_', ' ');
}

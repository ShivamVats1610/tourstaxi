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
    <main className="min-h-screen bg-[#f7faf9] px-3 pb-12 pt-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
          <div className="bg-teal-700 px-4 py-5 text-white sm:px-6">
            <div className="text-xs font-black uppercase tracking-wider text-teal-100">ToursTaxi UPI Payment</div>
            <h1 className="mt-1 text-2xl font-black">Complete Payment</h1>
          </div>
          <div className="grid gap-5 p-4 lg:grid-cols-[1fr_360px] lg:p-6">
            <section className="grid gap-4">
              <div className="grid gap-2 rounded-md bg-slate-50 p-4 text-sm font-semibold text-slate-700 sm:grid-cols-2">
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

              <div className="rounded-md border border-slate-200 bg-white p-4">
                <div className="text-sm font-black text-slate-950">Pay with any UPI app</div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {UPI_APPS.map((app) => (
                    <a key={app} href={upi.link} className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-950 transition hover:border-teal-300 hover:bg-teal-50">
                      {app}
                    </a>
                  ))}
                </div>
                <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs font-bold text-amber-900">
                  If no UPI app opens, scan the QR code or copy the UPI ID below.
                </div>
              </div>

              <div className="rounded-md border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">UPI ID</div>
                    <div className="break-all text-base font-black text-slate-950">{upi.id}</div>
                  </div>
                  <Button type="button" variant="outline" onClick={() => {
                    navigator.clipboard?.writeText(upi.id);
                    toast.success('UPI ID copied.');
                  }} className="rounded-md bg-white"><Copy className="h-4 w-4" /> Copy UPI ID</Button>
                </div>
              </div>

              <div className="rounded-md border border-slate-200 bg-white p-4">
                <div className="text-sm font-black text-slate-950">Payment Instructions</div>
                <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm font-semibold text-slate-700">
                  <li>Complete the payment using any UPI application.</li>
                  <li>Return to the website.</li>
                  <li>Click I Have Paid.</li>
                  <li>Upload payment screenshot if available.</li>
                  <li>Admin will verify the payment.</li>
                  <li>Booking will be confirmed after verification.</li>
                </ol>
              </div>
            </section>

            <aside className="h-fit rounded-lg border border-teal-100 bg-teal-50 p-4 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-white text-teal-700"><QrCode className="h-5 w-5" /></div>
              <div className="mt-2 text-lg font-black text-slate-950">Scan QR</div>
              <img src={qrUrl} alt="UPI QR code" className="mx-auto mt-4 h-64 w-64 rounded-md border border-slate-200 bg-white p-3" />
              <div className="mt-4 text-3xl font-black text-teal-800">{money(amount)}</div>

              {canSubmit ? (
                <div className="mt-5 grid gap-3 text-left">
                  <Input value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} placeholder="UPI reference number (optional)" />
                  <label className="rounded-md border border-dashed border-slate-300 bg-white p-3 text-sm font-bold text-slate-700">
                    <span className="flex items-center gap-2"><Upload className="h-4 w-4 text-teal-700" /> Upload Screenshot</span>
                    <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={(event) => setScreenshot(event.target.files?.[0] || null)} className="mt-2 w-full text-xs" />
                    <span className="mt-1 block text-xs text-slate-500">JPG, JPEG, PNG, WEBP up to 10 MB.</span>
                  </label>
                  <Button onClick={submitPaid} disabled={submitting} className="h-11 rounded-md bg-teal-700 text-sm font-black text-white hover:bg-teal-800">
                    {submitting ? 'Submitting...' : 'I Have Paid'}
                  </Button>
                </div>
              ) : (
                <div className="mt-5 rounded-md border border-emerald-200 bg-white p-3 text-sm font-bold text-emerald-700">
                  <Check className="mr-1 inline h-4 w-4" /> Payment submitted. Admin verification is pending.
                </div>
              )}
              <Link href="/customer/dashboard" className="mt-4 inline-flex text-sm font-black text-teal-800">Go to dashboard</Link>
            </aside>
          </div>
        </motion.section>
      </div>
    </main>
  );
}

function Info({ label, value, strong = false }) {
  return <div><div className="text-[11px] font-black uppercase tracking-wider text-slate-500">{label}</div><div className={`${strong ? 'text-teal-800' : 'text-slate-950'} font-black`}>{value || '-'}</div></div>;
}

function money(value) {
  return `Rs ${Number(value || 0).toLocaleString('en-IN')}`;
}

function labelStatus(value) {
  return String(value || 'pending').replaceAll('_', ' ');
}

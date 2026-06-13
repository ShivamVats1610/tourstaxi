'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AdminBookingNotifier({ latestBookingId = '', latestCreatedAt = '' }) {
  const router = useRouter();
  const seenLatestRef = useRef({ id: latestBookingId, createdAt: latestCreatedAt });
  const initializedRef = useRef(false);

  useEffect(() => {
    let active = true;

    const checkBookings = async () => {
      try {
        const response = await fetch('/api/bookings', { cache: 'no-store' });
        const data = await response.json();
        if (!active || !response.ok || !Array.isArray(data.bookings)) return;

        const latest = data.bookings[0];
        if (!latest?.bookingId) return;

        const previous = seenLatestRef.current;
        const hasNewBooking = initializedRef.current && latest.bookingId !== previous.id;
        seenLatestRef.current = {
          id: latest.bookingId,
          createdAt: latest.createdAt || ''
        };
        initializedRef.current = true;

        if (!hasNewBooking) return;

        toast.success('New booking received', {
          description: `${latest.bookingId} - ${latest.customer?.name || 'Guest'} booked ${latest.vehicleName || latest.vehicleSlug || 'a cab'}.`
        });
        router.refresh();
      } catch (error) {
        console.error('Admin booking notification check failed:', error);
      }
    };

    const timer = window.setInterval(checkBookings, 12000);
    checkBookings();

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [router]);

  return null;
}

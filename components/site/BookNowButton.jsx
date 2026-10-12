'use client';

import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBooking } from '@/lib/booking-context';

export default function BookNowButton({ children = 'Book Now', prefill = {}, className = '', variant = 'default' }) {
  const { open } = useBooking();

  return (
    <Button type="button" variant={variant} onClick={() => open(prefill)} className={className}>
      {children} <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );
}

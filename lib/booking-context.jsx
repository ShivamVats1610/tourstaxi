'use client';
import { createContext, useContext, useState, useCallback } from 'react';
import BookingFlow from '@/components/site/BookingFlow';

const BookingCtx = createContext({ open: () => {} });
export const useBooking = () => useContext(BookingCtx);

export default function BookingProvider({ children }) {
  const [state, setState] = useState({ open: false, prefill: {} });

  const open = useCallback((prefill = {}) => setState({ open: true, prefill }), []);
  const close = useCallback(() => setState(s => ({ ...s, open: false })), []);

  return (
    <BookingCtx.Provider value={{ open }}>
      {children}
      <BookingFlow open={state.open} prefill={state.prefill} onClose={close} />
    </BookingCtx.Provider>
  );
}

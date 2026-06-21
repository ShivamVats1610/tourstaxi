'use client';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import BookingFlow from '@/components/site/BookingFlow';

const BookingCtx = createContext({ open: () => {} });
export const useBooking = () => useContext(BookingCtx);

export default function BookingProvider({ children, cabs = [] }) {
  const [state, setState] = useState({ open: false, prefill: {} });
  const [liveCabs, setLiveCabs] = useState(cabs);

  const open = useCallback((prefill = {}) => setState({ open: true, prefill }), []);
  const close = useCallback(() => setState(s => ({ ...s, open: false })), []);

  useEffect(() => {
    if (!state.open) return;

    let ignore = false;
    fetch('/api/cabs', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : null)
      .then((result) => {
        if (!ignore && Array.isArray(result?.cabs)) {
          setLiveCabs(result.cabs);
        }
      })
      .catch((error) => {
        console.error('Cab refresh failed:', error);
      });

    return () => {
      ignore = true;
    };
  }, [state.open]);

  return (
    <BookingCtx.Provider value={{ open }}>
      {children}
      <BookingFlow open={state.open} prefill={state.prefill} onClose={close} cabs={liveCabs} />
    </BookingCtx.Provider>
  );
}

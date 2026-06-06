'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export function Dialog({ open, onOpenChange, children }) {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onOpenChange?.(false);
    };

    document.addEventListener('keydown', onKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onOpenChange]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={() => onOpenChange?.(false)}
      />
      {children}
    </div>,
    document.body
  );
}

export function DialogContent({ children, className = '' }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`relative z-10 w-full ${className}`}
      onClick={(event) => event.stopPropagation()}
    >
      {children}
    </div>
  );
}

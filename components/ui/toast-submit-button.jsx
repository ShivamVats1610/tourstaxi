'use client';

import { toast } from 'sonner';

export default function ToastSubmitButton({ children, message, description, className = '', formAction }) {
  return (
    <button
      formAction={formAction}
      onClick={() => toast.success(message, { description })}
      className={className}
    >
      {children}
    </button>
  );
}

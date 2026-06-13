'use client';

import React from 'react';

export const Textarea = React.forwardRef(function Textarea({ className = '', ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={`min-h-20 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
});

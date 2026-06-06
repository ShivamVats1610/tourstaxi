'use client';

import { createContext, useContext, useState } from 'react';

const AccordionContext = createContext(null);
const ItemContext = createContext(null);

export function Accordion({ children, type = 'single', collapsible = false, className = '' }) {
  const [value, setValue] = useState(null);

  const toggle = (nextValue) => {
    setValue((current) => {
      if (current === nextValue && (collapsible || type === 'single')) return null;
      return nextValue;
    });
  };

  return (
    <AccordionContext.Provider value={{ value, toggle }}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({ children, value, className = '' }) {
  return (
    <ItemContext.Provider value={value}>
      <div className={`border-b border-slate-200 last:border-b-0 ${className}`}>{children}</div>
    </ItemContext.Provider>
  );
}

export function AccordionTrigger({ children, className = '' }) {
  const value = useContext(ItemContext);
  const accordion = useContext(AccordionContext);
  const open = accordion?.value === value;

  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={() => accordion?.toggle(value)}
      className={`flex w-full items-center justify-between py-4 text-sm font-medium transition hover:text-sky-600 ${className}`}
    >
      <span>{children}</span>
      <span className={`ml-4 text-lg leading-none transition-transform ${open ? 'rotate-45' : ''}`}>+</span>
    </button>
  );
}

export function AccordionContent({ children, className = '' }) {
  const value = useContext(ItemContext);
  const accordion = useContext(AccordionContext);
  const open = accordion?.value === value;

  if (!open) return null;

  return <div className={`pb-4 text-sm ${className}`}>{children}</div>;
}

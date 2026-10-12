export function formatPhoneNumber(value = '') {
  const cleaned = String(value || '').trim();
  if (!cleaned) return '';
  const digits = cleaned.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return `+91 ${digits.slice(2, 7)}${digits.slice(7)}`;
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)}${digits.slice(5)}`;
  return cleaned;
}

export function phoneHref(value = '') {
  const cleaned = String(value || '').trim();
  return cleaned ? `tel:${cleaned.replace(/[^\d+]/g, '')}` : '';
}

import { absoluteUrl } from '@/lib/seo';
export default function robots() {
  // Allow public HTML so crawlers can read noindex on account and payment pages.
  return { rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/admin/', '/customer/'] }, sitemap: absoluteUrl('/sitemap.xml') };
}

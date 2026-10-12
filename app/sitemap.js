import { listCabs, listTourPackages, listBlogPosts } from '@/lib/crm';
import { PUBLIC_PAGES, absoluteUrl } from '@/lib/seo';
export const dynamic = 'force-dynamic';
export default async function sitemap() {
  const [cabs, tours, posts] = await Promise.all([listCabs({ fallbackToFleet: false }), listTourPackages(), listBlogPosts()]);
  const entries = Object.keys(PUBLIC_PAGES).map(path => ({ url: absoluteUrl(path) }));
  for (const [prefix, items] of [['fleet', cabs], ['tour-packages', tours], ['blog', posts]]) {
    for (const item of items) {
      if (!item.slug || item.status === 'inactive') continue;
      const date = item.updatedAt || item.createdAt;
      const lastModified = date && !Number.isNaN(new Date(date).getTime()) ? new Date(date) : undefined;
      entries.push({ url: absoluteUrl('/' + prefix + '/' + encodeURIComponent(item.slug)), ...(lastModified ? { lastModified } : {}) });
    }
  }
  return [...new Map(entries.map(entry => [entry.url, entry])).values()];
}

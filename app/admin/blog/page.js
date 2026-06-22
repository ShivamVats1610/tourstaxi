import { listBlogPosts } from '@/lib/crm';
import { BlogManager } from '../_components';

export const metadata = { title: 'Blog | ToursTaxi Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminBlogPage() {
  const posts = await listBlogPosts({ includeInactive: true });
  return <BlogManager posts={posts} />;
}

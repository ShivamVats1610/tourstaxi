import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BLOG_CATEGORIES } from '@/lib/data';
import { listBlogPosts } from '@/lib/crm';
import { Clock, User, ArrowLeft, ArrowRight, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const posts = await listBlogPosts();
  const p = posts.find(b => b.slug === slug);
  return { title: p ? `${p.title} - ToursTaxi Blog` : 'Blog - ToursTaxi' };
}

export default async function BlogSinglePage({ params }) {
  const { slug } = await params;
  const posts = await listBlogPosts();
  const post = posts.find(p => p.slug === slug);
  if (!post) return notFound();
  const categories = [...new Set(posts.map((item) => item.category).filter(Boolean))].map((name) => ({
    name,
    count: posts.filter((item) => item.category === name).length
  }));
  const content = post.content
    ? String(post.content).split(/\n{2,}/).map((item) => item.trim()).filter(Boolean)
    : [];

  return (
    <div className="pt-24">
      <section className="relative">
        <div className="relative h-[55vh] overflow-hidden">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-slate-950/30" />
          <div className="absolute bottom-0 inset-x-0 pb-12">
            <div className="max-w-4xl mx-auto px-4 text-white">
              <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white mb-4"><ArrowLeft className="h-4 w-4" /> Back to Blog</Link>
              <div className="inline-block px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-bold uppercase">{post.category}</div>
              <h1 className="mt-3 text-3xl md:text-5xl font-extrabold leading-tight max-w-3xl">{post.title}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/80">
                <span className="flex items-center gap-1.5"><User className="h-4 w-4" />{post.author}</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{post.date}</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{post.readMin} min read</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-[1fr_320px] gap-10">
          <article className="prose prose-slate max-w-none">
            <p className="text-xl text-slate-700 leading-relaxed font-medium">{post.excerpt}</p>
            {content.length ? (
              content.map((paragraph) => <p key={paragraph} className="text-slate-700 leading-relaxed">{paragraph}</p>)
            ) : (
              <>
                <p className="text-slate-700 leading-relaxed">Welcome to the ToursTaxi travel journal. In this article, our experienced drivers and tour planners share insider knowledge they have picked up over hundreds of trips across India.</p>
                <h2 className="text-2xl font-bold text-slate-900 mt-8">Why this matters</h2>
                <p className="text-slate-700 leading-relaxed">Whether you are planning your first Rajasthan trip or returning for the third time, getting the small details right - timing, hotel choice, the right cab - turns a good holiday into an unforgettable one.</p>
                <h2 className="text-2xl font-bold text-slate-900 mt-8">Quick tips</h2>
                <ul className="text-slate-700 leading-relaxed list-disc pl-6 space-y-1">
                  <li>Book your cab at least 48 hours in advance during peak season (Oct-Mar).</li>
                  <li>Carry a printout of your booking confirmation - some monuments need it.</li>
                  <li>For wildlife, the early-morning safari is always better than the afternoon one.</li>
                  <li>Hydrate constantly - Rajasthan summers are no joke.</li>
                </ul>
                <h2 className="text-2xl font-bold text-slate-900 mt-8">Final thoughts</h2>
                <p className="text-slate-700 leading-relaxed">For a customised itinerary or a chauffeur who knows every shortcut, call our team - we are happy to help plan the perfect trip.</p>
              </>
            )}
          </article>

          <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
            <Card><CardContent className="p-5">
              <h4 className="font-bold text-slate-900 mb-3">Categories</h4>
              <ul className="space-y-2">
                {(categories.length ? categories : BLOG_CATEGORIES).map(c => <li key={c.name}><Link href="/blog" className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-teal-50 text-sm text-slate-700 hover:text-teal-700"><span>{c.name}</span><span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">{c.count}</span></Link></li>)}
              </ul>
            </CardContent></Card>
            <Card><CardContent className="p-5">
              <h4 className="font-bold text-slate-900 mb-3">Recent Posts</h4>
              <ul className="space-y-3">
                {posts.filter(p => p.slug !== post.slug).slice(0, 4).map(p => (
                  <li key={p.slug}><Link href={`/blog/${p.slug}`} className="flex gap-3 group">
                    <img src={p.image} alt={p.title} className="h-16 w-16 rounded-lg object-cover shrink-0" />
                    <div><div className="text-sm font-semibold text-slate-800 group-hover:text-teal-700 line-clamp-2">{p.title}</div><div className="text-xs text-slate-500 mt-1">{p.date}</div></div>
                  </Link></li>
                ))}
              </ul>
            </CardContent></Card>
            <Card className="bg-[#12233f] text-white border-0"><CardContent className="p-5">
              <h4 className="font-bold text-lg">Plan this trip</h4>
              <p className="text-sm opacity-90 mt-1">Speak to our tour desk - we will handle everything.</p>
              <Link href="/contact"><Button className="mt-4 w-full bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold">Contact Us <ArrowRight className="h-4 w-4 ml-2" /></Button></Link>
            </CardContent></Card>
          </aside>
        </div>
      </section>
    </div>
  );
}
